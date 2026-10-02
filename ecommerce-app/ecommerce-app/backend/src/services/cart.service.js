const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

async function addItem(userId, { productId, variantId, quantity }) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found");

  const variant = product.variants.id(variantId);
  if (!variant) throw new ApiError(404, "NOT_FOUND", "Variant not found");
  if (variant.stock < quantity) {
    throw new ApiError(400, "INSUFFICIENT_STOCK", `Only ${variant.stock} unit(s) of this variant are available`);
  }

  const cart = await getCart(userId);
  const existing = cart.items.find((i) => i.variantId.toString() === variantId);
  const price = variant.priceOverride ?? product.basePrice;

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > variant.stock) {
      throw new ApiError(400, "INSUFFICIENT_STOCK", `Only ${variant.stock} unit(s) of this variant are available`);
    }
    existing.quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      variantId: variant._id,
      name: product.name,
      size: variant.size,
      color: variant.color,
      image: product.images?.[0] || "",
      quantity,
      priceAtAdd: price,
    });
  }

  await cart.save();
  return cart;
}

async function updateItem(userId, itemId, quantity) {
  const cart = await getCart(userId);
  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "NOT_FOUND", "Cart item not found");

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    const product = await Product.findById(item.product);
    const variant = product?.variants.id(item.variantId);
    if (variant && quantity > variant.stock) {
      throw new ApiError(400, "INSUFFICIENT_STOCK", `Only ${variant.stock} unit(s) available`);
    }
    item.quantity = quantity;
  }

  await cart.save();
  return cart;
}

async function removeItem(userId, itemId) {
  const cart = await getCart(userId);
  cart.items.id(itemId)?.deleteOne();
  await cart.save();
  return cart;
}

module.exports = { getCart, addItem, updateItem, removeItem };
