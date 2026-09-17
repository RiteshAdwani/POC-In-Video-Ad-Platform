import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { Prisma, type Advertisement } from '../../generated/prisma/client.js';
import { ConflictError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { createAdvertisementSchema, updateAdvertisementSchema } from './advertisements.schema';

/**
 * @description Creates an advertisement owned by the calling admin.
 */
export const createAdvertisement: RequestHandler = async (req, res) => {
  // Parse data from the req and extract authorId
  const data = createAdvertisementSchema.parse(req.body);
  const authorId = req.admin!.id;

  // Create advertisement
  const advertisement = await prisma.advertisement.create({ data: { ...data, authorId } });

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
  });

  res
    .status(StatusCodes.OK)
    .json({ data: { advertisements }, message: ApiSuccessMessages.ADVERTISEMENTS_FETCHED });
};

/**
 * @description Fetches one advertisement. requireOwnership already fetched and verified it.
 */
export const getAdvertisement: RequestHandler = async (req, res) => {
  const advertisement = req.resource as Advertisement;

  res
    .status(StatusCodes.OK)
    .json({ data: { advertisement }, message: ApiSuccessMessages.ADVERTISEMENT_FETCHED });
};

/**
 * @description Updates an advertisement. requireOwnership already fetched and verified it.
 */
export const updateAdvertisement: RequestHandler = async (req, res) => {
  const existing = req.resource as Advertisement;
  const data = updateAdvertisementSchema.parse(req.body);

  const advertisement = await prisma.advertisement.update({ where: { id: existing.id }, data });

  res
    .status(StatusCodes.OK)
    .json({ data: { advertisement }, message: ApiSuccessMessages.ADVERTISEMENT_UPDATED });
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
