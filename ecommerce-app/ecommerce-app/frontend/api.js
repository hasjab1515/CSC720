function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
  }

  const res = await fetch(API_BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch (e) {
    json = { success: false, error: { message: "Invalid server response" } };
  }

  if (!res.ok || json.success === false) {
    const message = json?.error?.message || "Request failed";
    throw new Error(message);
  }
  return json;
}

const api = {
  register: (data) => apiRequest("/auth/register", { method: "POST", body: data }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: data }),
  me: () => apiRequest("/auth/me", { auth: true }),

  listProducts: (query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return apiRequest("/products" + (qs ? "?" + qs : ""));
  },
  getProduct: (id) => apiRequest("/products/" + id),

  getCart: () => apiRequest("/cart", { auth: true }),
  addToCart: (data) => apiRequest("/cart/items", { method: "POST", body: data, auth: true }),
  updateCartItem: (itemId, quantity) =>
    apiRequest("/cart/items/" + itemId, { method: "PUT", body: { quantity }, auth: true }),
  removeCartItem: (itemId) => apiRequest("/cart/items/" + itemId, { method: "DELETE", auth: true }),

  checkout: (shippingAddress, challengeId, otp) =>
    apiRequest("/orders/checkout", { method: "POST", body: { shippingAddress, challengeId, otp }, auth: true }),
  myOrders: () => apiRequest("/orders", { auth: true }),
  getOrder: (id) => apiRequest("/orders/" + id, { auth: true }),

  exportMyData: () => apiRequest("/auth/export-data", { auth: true }),
  deleteMyAccount: () => apiRequest("/auth/me", { method: "DELETE", auth: true }),

  adminAllOrders: () => apiRequest("/orders/admin/all", { auth: true }),
  adminUpdateOrderStatus: (id, status) =>
    apiRequest("/orders/admin/" + id + "/status", { method: "PUT", body: { status }, auth: true }),

  adminCreateProduct: (data) => apiRequest("/products", { method: "POST", body: data, auth: true }),
  adminUpdateVariantStock: (productId, variantId, stock) =>
    apiRequest(`/products/${productId}/variants/${variantId}`, { method: "PUT", body: { stock }, auth: true }),

  adminDashboard: () => apiRequest("/admin/dashboard", { auth: true }),

  productReviews: (productId) => apiRequest("/reviews/product/" + productId),
  submitReview: (data) => apiRequest("/reviews", { method: "POST", body: data, auth: true }),
};
