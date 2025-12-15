// Database Query Helpers - Reusable CRUD operations

import { getPaginationParams, getSortParams } from "../config/apiConfig.js";

// Generic Find All with Pagination
export const findAllWithPagination = async (Model, query = {}, populate = '', select = '') => {
  const { page, limit, skip } = getPaginationParams(query);
  const sort = getSortParams(query);
  
  const filter = query.filter || {};

  const [data, total] = await Promise.all([
    Model.find(filter)
      .populate(populate)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Generic Find By ID
export const findById = async (Model, id, populate = '') => {
  return Model.findById(id).populate(populate).lean();
};

// Generic Create
export const createDocument = async (Model, data) => {
  return Model.create(data);
};

// Generic Update
export const updateDocument = async (Model, id, data) => {
  return Model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
};

// Generic Delete
export const deleteDocument = async (Model, id) => {
  return Model.findByIdAndDelete(id).lean();
};

// Generic Find One
export const findOne = async (Model, filter, populate = '') => {
  return Model.findOne(filter).populate(populate).lean();
};

// Bulk operations
export const bulkCreate = async (Model, dataArray) => {
  return Model.insertMany(dataArray);
};

export const bulkUpdate = async (Model, operations) => {
  return Model.bulkWrite(operations);
};

export const bulkDelete = async (Model, filter) => {
  return Model.deleteMany(filter);
};
