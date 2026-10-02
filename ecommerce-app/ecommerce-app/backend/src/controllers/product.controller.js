const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/product.service");
const ApiError = require("../utils/ApiError");

exports.list = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  res.json({ success: true, data: result.items, meta: { page: result.page, totalPages: result.totalPages, total: result.total } });
});

exports.get = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found");
  res.json({ success: true, data: product });
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

exports.update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
});

exports.updateVariantStock = asyncHandler(async (req, res) => {
  const product = await productService.updateVariantStock(req.params.id, req.params.variantId, req.body.stock);
  res.json({ success: true, data: product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await productService.deactivateProduct(req.params.id);
  res.json({ success: true, data: product });
});
