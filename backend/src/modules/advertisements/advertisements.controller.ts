import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { uploadAdAsset } from '../../lib/cloudinary';
import type { Advertisement } from '../../generated/prisma/client.js';
import { AssetType } from '../../generated/prisma/enums';
import { ConflictError, UpstreamServiceError, ValidationError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { createAdvertisementSchema, updateAdvertisementSchema } from './advertisements.schema';
import { toAdvertisementDto } from './advertisements.service';
import { adminListQuerySchema } from '../../schemas/pagination.schema';
import { ListView } from '../../constants/listView.constants';
import { buildPaginationMeta } from '../../lib/pagination';

// Counts live placements only - a retired placement no longer puts this ad on any video.
const WITH_AD_PLACEMENT_COUNT = {
  include: { _count: { select: { adPlacements: { where: { deletedAt: null } } } } },
} as const;

/**
 * @description Creates an advertisement owned by the calling admin: uploads the creative to
 * Cloudinary and persists the resulting URL. assetType is derived from the file's real mimetype,
 * not chosen by the client - the multer middleware (adAssetUpload) already restricts uploads to
 * image/video files, so anything reaching here is one or the other.
 */
export const createAdvertisement: RequestHandler = async (req, res) => {
  const data = createAdvertisementSchema.parse(req.body);
  const adminId = req.admin!.id;

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
    data: { ...data, assetUrl, assetType, adminId },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ data: { advertisement }, message: ApiSuccessMessages.ADVERTISEMENT_CREATED });
};

/**
 * @description Lists the calling admin's ads, paginated and searchable - active ones by default,
 * or only retired (soft-deleted) ones with `view=deleted`, most recently deleted first.
 */
export const listAdvertisements: RequestHandler = async (req, res) => {
  const { page, pageSize, search, view } = adminListQuerySchema.parse(req.query);
  const deleted = view === ListView.DELETED;
  const where = {
    adminId: req.admin!.id,
    deletedAt: deleted ? { not: null } : null,
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [advertisements, totalItems] = await Promise.all([
    prisma.advertisement.findMany({
      where,
      orderBy: deleted ? { deletedAt: 'desc' } : { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      ...WITH_AD_PLACEMENT_COUNT,
    }),
    prisma.advertisement.count({ where }),
  ]);

  res.status(StatusCodes.OK).json({
    data: {
      advertisements: advertisements.map(toAdvertisementDto),
      pagination: buildPaginationMeta(page, pageSize, totalItems),
    },
    message: ApiSuccessMessages.ADVERTISEMENTS_FETCHED,
  });
};

/**
 * @description Fetches one advertisement. requireOwnership already verified it belongs to the
 * caller - it's re-fetched here (rather than reused from req.resource) just to bring in the
 * ad placement count, which the ownership check itself doesn't need.
 */
export const getAdvertisement: RequestHandler = async (req, res) => {
  const existing = req.resource as Advertisement;
  const advertisement = await prisma.advertisement.findUniqueOrThrow({
    where: { id: existing.id },
    ...WITH_AD_PLACEMENT_COUNT,
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
    ...WITH_AD_PLACEMENT_COUNT,
  });

  res.status(StatusCodes.OK).json({
    data: { advertisement: toAdvertisementDto(advertisement) },
    message: ApiSuccessMessages.ADVERTISEMENT_UPDATED,
  });
};

/**
 * @description Retires an advertisement - a soft delete (sets deletedAt), so its placement and
 * event history stays intact. Rejected while it's still live on any video.
 */
export const deleteAdvertisement: RequestHandler = async (req, res) => {
  const existing = req.resource as Advertisement;

  const livePlacementCount = await prisma.adPlacement.count({
    where: { advertisementId: existing.id, deletedAt: null },
  });
  if (livePlacementCount > 0) {
    throw new ConflictError(ErrorMessages.ADVERTISEMENT_IN_USE);
  }

  await prisma.advertisement.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  });

  res
    .status(StatusCodes.OK)
    .json({ data: null, message: ApiSuccessMessages.ADVERTISEMENT_DELETED });
};
