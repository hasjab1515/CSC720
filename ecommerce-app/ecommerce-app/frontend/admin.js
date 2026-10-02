const { useState: useState3, useEffect: useEffect3 } = React;

function AdminLayout({ children }) {
  return (
    <div className="section">
      <div className="admin-tabs">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
      </div>
      {children}
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState3(null);
  useEffect3(() => { api.adminDashboard().then((res) => setStats(res.data)); }, []);

  return (
    <AdminLayout>
      <h2 className="section-title">Dashboard</h2>
      {!stats ? <Loader /> : (
        <div className="stat-cards">
          <div className="stat-card"><div className="stat-value">{stats.totalOrders}</div><div className="stat-label">Total Orders</div></div>
          <div className="stat-card"><div className="stat-value">${stats.revenue.toFixed(2)}</div><div className="stat-label">Revenue</div></div>
          <div className="stat-card stat-warning"><div className="stat-value">{stats.lowStockCount}</div><div className="stat-label">Low Stock Products</div></div>
          <div className="stat-card stat-error"><div className="stat-value">{stats.outOfStockCount}</div><div className="stat-label">Out of Stock Products</div></div>
        </div>
      )}
    </AdminLayout>
  );
}

const emptyVariant = { size: "", color: "", sku: "", stock: 0 };

function AdminProductsPage() {
  const [products, setProducts] = useState3([]);
  const [loading, setLoading] = useState3(true);
  const [showForm, setShowForm] = useState3(false);
  const [error, setError] = useState3("");
  const [form, setForm] = useState3({
    name: "", description: "", brand: "", category: "Men", basePrice: "",
    images: "", variants: [{ ...emptyVariant }],
  });

  function load() {
    setLoading(true);
    api.listProducts({ pageSize: 50 }).then((res) => setProducts(res.data)).finally(() => setLoading(false));
  }
  useEffect3(() => { load(); }, []);

  function updateVariant(idx, field, value) {
    const variants = [...form.variants];
    variants[idx] = { ...variants[idx], [field]: value };
    setForm({ ...form, variants });
  }

  function addVariantRow() {
    setForm({ ...form, variants: [...form.variants, { ...emptyVariant }] });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.adminCreateProduct({
        name: form.name,
        description: form.description,
        brand: form.brand,
        category: form.category,
        basePrice: Number(form.basePrice),
        images: form.images ? [form.images] : [],
        variants: form.variants.map((v) => ({ ...v, stock: Number(v.stock) })),
      });
      setShowForm(false);
      setForm({ name: "", description: "", brand: "", category: "Men", basePrice: "", images: "", variants: [{ ...emptyVariant }] });
      load();
    } catch (e) { setError(e.message); }
  }

  async function handleStockChange(productId, variantId, stock) {
    await api.adminUpdateVariantStock(productId, variantId, Number(stock));
    load();
  }

  return (
    <AdminLayout>
      <div className="listing-header">
        <h2 className="section-title">Products</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form className="form admin-product-form" onSubmit={handleCreate}>
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label>Brand</label>
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Men</option><option>Women</option><option>Kids</option><option>Shoes</option>
          </select>
          <label>Base Price</label>
          <input required type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
          <label>Image URL</label>
          <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..." />

          <label>Variants</label>
          {form.variants.map((v, idx) => (
            <div key={idx} className="variant-row">
              <input placeholder="Size" value={v.size} onChange={(e) => updateVariant(idx, "size", e.target.value)} />
              <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(idx, "color", e.target.value)} />
              <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(idx, "sku", e.target.value)} />
              <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(idx, "stock", e.target.value)} />
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-small" onClick={addVariantRow}>+ Add variant</button>

          <ErrorMessage message={error} />
          <button className="btn btn-primary btn-large" type="submit">Save Product</button>
        </form>
      )}

      {loading ? <Loader /> : (
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Variants (size/color — stock)</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.basePrice.toFixed(2)}</td>
                <td>
                  {p.variants.map((v) => (
                    <div key={v._id} className="variant-stock-row">
                      <span>{v.size}/{v.color}</span>
                      <input
                        type="number" defaultValue={v.stock} className="qty-input small"
                        onBlur={(e) => handleStockChange(p._id, v._id, e.target.value)}
                      />
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

const ORDER_STATUS_OPTIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState3([]);
  const [loading, setLoading] = useState3(true);

  function load() {
    setLoading(true);
    api.adminAllOrders().then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }
  useEffect3(() => { load(); }, []);

  async function handleStatusChange(id, status) {
    await api.adminUpdateOrderStatus(id, status);
    load();
  }

  return (
    <AdminLayout>
      <h2 className="section-title">Orders</h2>
      {loading ? <Loader /> : (
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-6).toUpperCase()}</td>
                <td>{o.user?.name} <span className="hint">({o.user?.email})</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>${o.total.toFixed(2)}</td>
                <td><span className={"status-badge status-" + o.status}>{o.status}</span></td>
                <td>
                  {ORDER_STATUS_OPTIONS[o.status].length > 0 ? (
                    <select defaultValue="" onChange={(e) => e.target.value && handleStatusChange(o._id, e.target.value)}>
                      <option value="">Change to...</option>
                      {ORDER_STATUS_OPTIONS[o.status].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <span className="hint">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
