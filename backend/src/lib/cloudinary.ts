import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';
import https from 'node:https';
import dns from 'node:dns';
import type { LookupAddress } from 'node:dns';
import { env } from '../config/env';
import { STATUS_CHECK_TIMEOUT_MS } from '../constants/cloudinary.constants';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: unknown,
  family?: number,
) => void;

/**
 *  @description Some machines' configured DNS resolver has a dead/unreliable nameserver, which makes Node's
 *default dns.lookup()-based connection setup to Cloudinary fail or hang well before curl (which
 * uses a different resolution path) would. Setting DNS_FALLBACK_SERVERS in .env routes lookups
 * through those servers instead of the OS's broken one. Opt-in and unset by default - most
 *environments don't have this problem and shouldn't carry the extra indirection.
 */
const createDnsSafeAgent = (servers: string[]): https.Agent => {
  const resolver = new dns.promises.Resolver();
  resolver.setServers(servers);

  const dnsSafeLookup = (
    hostname: string,
    optionsOrCallback: { all?: boolean } | LookupCallback,
    maybeCallback?: LookupCallback,
  ): void => {
    const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback!;
    const wantsAll = typeof optionsOrCallback === 'object' && optionsOrCallback.all === true;

    resolver
      .resolve4(hostname)
      .then((addresses) => {
        if (wantsAll) {
          const results: LookupAddress[] = addresses.map((address) => ({ address, family: 4 }));
          callback(null, results);
        } else {
          callback(null, addresses[0], 4);
        }
      })
      .catch((error: NodeJS.ErrnoException) => callback(error, null));
  };

  return new https.Agent({ lookup: dnsSafeLookup as unknown as https.AgentOptions['lookup'] });
};

const dnsSafeAgent = env.DNS_FALLBACK_SERVERS
  ? createDnsSafeAgent(env.DNS_FALLBACK_SERVERS)
  : undefined;

// The SDK's own `timeout` option calls request.setTimeout() but never attaches a 'timeout'
// listener to actually abort the request - so it never fires. This is our own enforcement: it
// stops the poller/status-check from waiting forever on a hung connection. It doesn't cancel the
// underlying request, just stops us waiting on it.
const timeboxPromise = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);

/**
 * @description Streams a video buffer to Cloudinary. `eager` requests a scaled-down preview
 * variant; `eager_async: true` makes Cloudinary return immediately with a `public_id` while that
 * transcoding continues in the background, giving the poller a real processing window to track.
 */
export const initiateVideoUpload = (fileBuffer: Buffer): Promise<{ publicId: string }> =>
  new Promise((resolve, reject) => {
    const options: UploadApiOptions = {
      resource_type: 'video',
      eager: [{ width: 640, height: 360, crop: 'scale' }],
      eager_async: true,
      agent: dnsSafeAgent,
    };
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(
          new Error(error?.message ?? 'Cloudinary upload returned no result', { cause: error }),
        );
        return;
      }
      resolve({ publicId: result.public_id });
    });

    uploadStream.end(fileBuffer);
  });

/**
 * @description Uploads an ad creative (image or video) straight through, no eager transformation -
 * unlike videos, an ad asset doesn't need a processing/polling window, so the returned secure_url
 * is playable/renderable immediately.
 */
export const uploadAdAsset = (
  fileBuffer: Buffer,
  resourceType: 'image' | 'video',
): Promise<{ secureUrl: string }> =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, agent: dnsSafeAgent },
      (error, result) => {
        if (error || !result) {
          reject(
            new Error(error?.message ?? 'Cloudinary upload returned no result', { cause: error }),
          );
          return;
        }
        resolve({ secureUrl: result.secure_url });
      },
    );

    uploadStream.end(fileBuffer);
  });

/**
 * @description Fetches a video resource's raw Admin API details, for the poller to interpret.
 * `resource()` is typed `Promise<any>` by the SDK - the exact shape of its `derived`/`eager` data
 * mid-transformation isn't clearly documented, so parsing it into a ready/processing/failed
 * verdict is left to the caller rather than guessed here.
 */
export const getVideoResource = (publicId: string): Promise<Record<string, unknown>> =>
  timeboxPromise(
    cloudinary.api.resource(publicId, { resource_type: 'video', agent: dnsSafeAgent }),
    STATUS_CHECK_TIMEOUT_MS,
    'Cloudinary status check timed out',
  );

/**
 * @description Deletes a video asset from Cloudinary - used when a video is given up on (max
 * processing age, or Cloudinary reports the transformation itself failed), so a dead row doesn't
 * leave real storage behind on Cloudinary indefinitely.
 */
export const deleteVideoResource = (publicId: string): Promise<unknown> =>
  timeboxPromise(
    // destroy()'s declared options type omits `agent`, but the SDK reads it generically at the
    // request layer the same way resource() and upload_stream() do (confirmed by reading
    // execute_request.js) - this is a gap in the SDK's types, not a real runtime restriction.
    cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
      agent: dnsSafeAgent,
    } as UploadApiOptions),
    STATUS_CHECK_TIMEOUT_MS,
    'Cloudinary delete timed out',
  );
