const Product = require("../models/Product");

async function listProducts(query) {
  const filter = { isActive: true };

  if (query.category) filter.category = query.category;
  if (query.search) filter.$text = { $search: query.search };
  if (query.size) filter["variants.size"] = query.size;
  if (query.color) filter["variants.color"] = query.color;
  if (query.minPrice || query.maxPrice) {
    filter.basePrice = {};
    if (query.minPrice) filter.basePrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.basePrice.$lte = Number(query.maxPrice);
  }

  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Number(query.pageSize) || 12);

  let sort = { createdAt: -1 };
  if (query.sort === "price_asc") sort = { basePrice: 1 };
  if (query.sort === "price_desc") sort = { basePrice: -1 };
  if (query.sort === "rating") sort = { avgRating: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize),
    Product.countDocuments(filter),
  ]);

  return { items, page, pageSize, totalPages: Math.ceil(total / pageSize), total };
}

async function getProduct(id) {
  return Product.findById(id);
}

async function createProduct(data) {
  return Product.create(data);
}

async function updateProduct(id, data) {
  return Product.findByIdAndUpdate(id, data, { new: true });
}

async function updateVariantStock(productId, variantId, stock) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, "variants._id": variantId },
    { $set: { "variants.$.stock": stock } },
    { new: true }
  );
  return product;
}

async function deactivateProduct(id) {
  return Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateVariantStock,
  deactivateProduct,
};
