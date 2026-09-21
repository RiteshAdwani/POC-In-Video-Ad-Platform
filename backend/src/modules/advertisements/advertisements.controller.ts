import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { uploadAdAsset } from '../../lib/cloudinary';
import { Prisma, type Advertisement } from '../../generated/prisma/client.js';
import { AssetType } from '../../generated/prisma/enums';
import { ConflictError, UpstreamServiceError, ValidationError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { createAdvertisementSchema, updateAdvertisementSchema } from './advertisements.schema';
import { toAdvertisementDto } from './advertisements.service';

const WITH_PLACEMENT_COUNT = { include: { _count: { select: { adPlacements: true } } } } as const;

/**
 * @description Creates an advertisement owned by the calling admin: uploads the creative to
 * Cloudinary and persists the resulting URL. assetType is derived from the file's real mimetype,
 * not chosen by the client - the multer middleware (adAssetUpload) already restricts uploads to
 * image/video files, so anything reaching here is one or the other.
 */
export const createAdvertisement: RequestHandler = async (req, res) => {
  const data = createAdvertisementSchema.parse(req.body);
  const authorId = req.admin!.id;

  if (!req.file) {
    throw new ValidationError(ErrorMessages.MISSING_AD_ASSET_FILE);
  }

  const isImage = req.file.mimetype.startsWith('image/');
  const assetType = isImage ? AssetType.IMAGE : AssetType.VIDEO;

  let assetUrl: string;
  try {
    ({ secureUrl: assetUrl } = await uploadAdAsset(req.file.buffer, isImage ? 'image' : 'video'));
  } catch (error) {
    req.log.error(error, 'Cloudinary ad asset upload failed');
    throw new UpstreamServiceError(ErrorMessages.AD_ASSET_UPLOAD_FAILED);
  }

  const advertisement = await prisma.advertisement.create({
    data: { ...data, assetUrl, assetType, authorId },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ data: { advertisement }, message: ApiSuccessMessages.ADVERTISEMENT_CREATED });
};

/**
 * @description Lists advertisements owned by the calling admin - never other admins' ads.
 */
export const listAdvertisements: RequestHandler = async (req, res) => {
  // Fetch all advertisements for an admin
  const advertisements = await prisma.advertisement.findMany({
    where: { authorId: req.admin!.id },
    orderBy: { createdAt: 'desc' },
    ...WITH_PLACEMENT_COUNT,
  });

  res.status(StatusCodes.OK).json({
    data: { advertisements: advertisements.map(toAdvertisementDto) },
    message: ApiSuccessMessages.ADVERTISEMENTS_FETCHED,
  });
};

/**
 * @description Fetches one advertisement. requireOwnership already verified it belongs to the
 * caller - it's re-fetched here (rather than reused from req.resource) just to bring in the
 * placement count, which the ownership check itself doesn't need.
 */
export const getAdvertisement: RequestHandler = async (req, res) => {
  const existing = req.resource as Advertisement;
  const advertisement = await prisma.advertisement.findUniqueOrThrow({
    where: { id: existing.id },
    ...WITH_PLACEMENT_COUNT,
  });

  res.status(StatusCodes.OK).json({
    data: { advertisement: toAdvertisementDto(advertisement) },
    message: ApiSuccessMessages.ADVERTISEMENT_FETCHED,
  });
};

/**
 * @description Updates an advertisement. requireOwnership already fetched and verified it.
 */
export const updateAdvertisement: RequestHandler = async (req, res) => {
  const existing = req.resource as Advertisement;
  const data = updateAdvertisementSchema.parse(req.body);

  const advertisement = await prisma.advertisement.update({
    where: { id: existing.id },
    data,
    ...WITH_PLACEMENT_COUNT,
  });

  res.status(StatusCodes.OK).json({
    data: { advertisement: toAdvertisementDto(advertisement) },
    message: ApiSuccessMessages.ADVERTISEMENT_UPDATED,
  });
};

/**
 * @description Deletes an advertisement. requireOwnership already fetched and verified it.
 */
export const deleteAdvertisement: RequestHandler = async (req, res) => {
  const existing = req.resource as Advertisement;

  try {
    await prisma.advertisement.delete({ where: { id: existing.id } });
  } catch (error) {
    // P2003: foreign key constraint failed - this ad is still referenced by an AdPlacement.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new ConflictError(ErrorMessages.ADVERTISEMENT_IN_USE);
    }
    throw error;
  }

  res
    .status(StatusCodes.OK)
    .json({ data: null, message: ApiSuccessMessages.ADVERTISEMENT_DELETED });
};
