const { useState: useState2, useEffect: useEffect2 } = React;
const { useParams, useNavigate: useNavigate2 } = ReactRouterDOM;

function HomePage() {
  const [products, setProducts] = useState2([]);
  const [loading, setLoading] = useState2(true);

  useEffect2(() => {
    api.listProducts({ pageSize: 8, sort: "rating" })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Wear what fits.<br />Trust what you buy.</h1>
          <p>Accurate sizing, verified reviews, and transparent order tracking — fashion e-commerce done right.</p>
          <Link to="/products" className="btn btn-primary btn-large">Shop the collection</Link>
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Featured picks</h2>
        {loading ? <Loader /> : (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductListPage() {
  const [products, setProducts] = useState2([]);
  const [loading, setLoading] = useState2(true);
  const [filters, setFilters] = useState2({ category: "", search: "", sort: "newest" });

  useEffect2(() => {
    setLoading(true);
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.search) query.search = filters.search;
    if (filters.sort) query.sort = filters.sort;
    api.listProducts(query).then((res) => setProducts(res.data)).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="section">
      <div className="listing-header">
        <h2 className="section-title">Shop all</h2>
        <div className="filters">
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Shoes">Shoes</option>
          </select>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
      {loading ? <Loader /> : products.length === 0 ? (
        <EmptyState title="No products found" subtitle="Try adjusting your filters." />
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate2();
  const { user } = useAuth();
  const [product, setProduct] = useState2(null);
  const [reviews, setReviews] = useState2([]);
  const [selectedVariant, setSelectedVariant] = useState2(null);
  const [quantity, setQuantity] = useState2(1);
  const [error, setError] = useState2("");
  const [message, setMessage] = useState2("");
  const [reviewForm, setReviewForm] = useState2({ rating: 5, comment: "" });

  function load() {
    api.getProduct(id).then((res) => setProduct(res.data));
    api.productReviews(id).then((res) => setReviews(res.data));
  }

  useEffect2(() => { load(); }, [id]);

  if (!product) return <Loader />;

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];

  async function handleAddToCart() {
    setError(""); setMessage("");
    if (!user) return navigate("/login");
    if (!selectedVariant) return setError("Please select a size and color");
    try {
      await api.addToCart({ productId: product._id, variantId: selectedVariant._id, quantity });
      setMessage("Added to cart!");
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.submitReview({ productId: product._id, rating: Number(reviewForm.rating), comment: reviewForm.comment });
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="section product-detail">
      <div className="product-detail-grid">
        <div className="product-detail-image">
          <img src={product.images?.[0]} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <div className="product-card-category">{product.category} · {product.brand}</div>
          <h1>{product.name}</h1>
          <StarRating value={product.avgRating} count={product.reviewCount} />
          <div className="price price-large">${product.basePrice.toFixed(2)}</div>
          <p className="description">{product.description}</p>

          <div className="variant-picker">
            <label>Size</label>
            <div className="chip-row">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={"chip" + (selectedVariant?.size === s ? " chip-active" : "")}
                  onClick={() => {
                    const match = product.variants.find((v) => v.size === s && (!selectedVariant?.color || v.color === selectedVariant.color)) || product.variants.find(v => v.size === s);
                    setSelectedVariant(match);
                  }}
                >{s}</button>
              ))}
            </div>
            <label>Color</label>
            <div className="chip-row">
              {colors.map((c) => (
                <button
                  key={c}
                  className={"chip" + (selectedVariant?.color === c ? " chip-active" : "")}
                  onClick={() => {
                    const match = product.variants.find((v) => v.color === c && (!selectedVariant?.size || v.size === selectedVariant.size)) || product.variants.find(v => v.color === c);
                    setSelectedVariant(match);
                  }}
                >{c}</button>
              ))}
            </div>
          </div>

          {selectedVariant && <StockBadge stock={selectedVariant.stock} />}

          <div className="add-to-cart-row">
            <input
              type="number" min="1" value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="qty-input"
            />
            <button
              className="btn btn-primary btn-large"
              disabled={!!selectedVariant && selectedVariant.stock === 0}
              onClick={handleAddToCart}
            >Add to Cart</button>
          </div>
          <ErrorMessage message={error} />
          {message && <div className="success-message">{message}</div>}
        </div>
      </div>

      <div className="reviews-section">
        <h2 className="section-title">Reviews ({reviews.length})</h2>
        {user && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h4>Leave a review</h4>
            <p className="hint">Only available for products from orders that have been delivered to you.</p>
            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
            </select>
            <textarea
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            <button className="btn btn-outline" type="submit">Submit review</button>
          </form>
        )}
        {reviews.length === 0 ? <p className="hint">No reviews yet.</p> : (
          <div className="review-list">
            {reviews.map((r) => (
              <div key={r._id} className="review-item">
                <div className="review-item-header">
                  <StarRating value={r.rating} />
                  <strong>{r.user?.name || "Anonymous"}</strong>
                  {r.verifiedPurchase && <span className="badge badge-success">Verified Purchase</span>}
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CartPage() {
  const [cart, setCart] = useState2(null);
  const [error, setError] = useState2("");
  const navigate = useNavigate2();

  function load() { api.getCart().then((res) => setCart(res.data)); }
  useEffect2(() => { load(); }, []);

  async function updateQty(itemId, qty) {
    setError("");
    try {
      const res = await api.updateCartItem(itemId, qty);
      setCart(res.data);
    } catch (e) { setError(e.message); }
  }

  async function removeItem(itemId) {
    const res = await api.removeCartItem(itemId);
    setCart(res.data);
  }

  if (!cart) return <Loader />;

  const subtotal = cart.items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0);

  if (cart.items.length === 0) {
    return <div className="section"><EmptyState title="Your cart is empty" subtitle="Find something you'll love." actionLabel="Browse products" actionTo="/products" /></div>;
  }

  return (
    <div className="section">
      <h2 className="section-title">Your Cart</h2>
      <ErrorMessage message={error} />
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <div>{item.name}</div>
                <div className="hint">{item.size} / {item.color}</div>
                <div className="price">${item.priceAtAdd.toFixed(2)}</div>
              </div>
              <input
                type="number" min="0" value={item.quantity} className="qty-input"
                onChange={(e) => updateQty(item._id, Number(e.target.value))}
              />
              <button className="btn btn-outline btn-small" onClick={() => removeItem(item._id)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="hint">Tax and shipping calculated at checkout.</div>
          <button className="btn btn-primary btn-large" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate2();
  const [address, setAddress] = useState2({ street: "", city: "", state: "", zip: "", country: "" });
  const [error, setError] = useState2("");
  const [submitting, setSubmitting] = useState2(false);
  // 3-D Secure 2 step-up challenge state
  const [challenge, setChallenge] = useState2(null); // { challengeId, amount, message }
  const [otp, setOtp] = useState2("");

  async function attemptCheckout(challengeId, otpValue) {
    setError(""); setSubmitting(true);
    try {
      const res = await api.checkout(address, challengeId, otpValue);
      if (res.data.requiresChallenge) {
        // Issuer requires step-up authentication (EMV 3-D Secure 2 challenge flow)
        setChallenge(res.data);
      } else {
        setChallenge(null);
        navigate("/orders/" + res.data._id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    attemptCheckout(null, null);
  }

  function handleVerify(e) {
    e.preventDefault();
    attemptCheckout(challenge.challengeId, otp);
  }

  if (challenge) {
    return (
      <div className="section narrow">
        <h2 className="section-title">Verify your payment</h2>
        <div className="threeds-modal" role="dialog" aria-labelledby="threeds-title" aria-describedby="threeds-desc">
          <h3 id="threeds-title">Bank Verification Required (3-D Secure 2)</h3>
          <p id="threeds-desc" className="hint">
            Your bank requires additional verification for this ${challenge.amount.toFixed(2)} payment.
            Enter the one-time code sent to your registered device.
          </p>
          <p className="hint"><em>Demo mode — use code <strong>123456</strong>.</em></p>
          <form className="form" onSubmit={handleVerify}>
            <label htmlFor="otp-input">Verification code</label>
            <input
              id="otp-input" required inputMode="numeric" maxLength={6} autoFocus
              value={otp} onChange={(e) => setOtp(e.target.value)}
            />
            <ErrorMessage message={error} />
            <div className="add-to-cart-row">
              <button className="btn btn-primary btn-large" disabled={submitting} type="submit">
                {submitting ? "Verifying..." : "Verify & Pay"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => { setChallenge(null); setOtp(""); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="section narrow">
      <h2 className="section-title">Checkout</h2>
      <p className="hint">Payment runs in mock/test mode via a PCI-DSS-aligned tokenized flow — no card data is stored by this platform, and no real charge occurs.</p>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="chk-street">Street</label>
        <input id="chk-street" required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
        <label htmlFor="chk-city">City</label>
        <input id="chk-city" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
        <label htmlFor="chk-state">State</label>
        <input id="chk-state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
        <label htmlFor="chk-zip">ZIP</label>
        <input id="chk-zip" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
        <label htmlFor="chk-country">Country</label>
        <input id="chk-country" required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
        <ErrorMessage message={error} />
        <button className="btn btn-primary btn-large" disabled={submitting} type="submit">
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

function OrderHistoryPage() {
  const [orders, setOrders] = useState2([]);
  const [loading, setLoading] = useState2(true);

  useEffect2(() => { api.myOrders().then((res) => setOrders(res.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <Loader />;
  if (orders.length === 0) return <div className="section"><EmptyState title="No orders yet" actionLabel="Start shopping" actionTo="/products" /></div>;

  return (
    <div className="section">
      <h2 className="section-title">Order History</h2>
      <div className="order-list">
        {orders.map((o) => (
          <Link to={"/orders/" + o._id} key={o._id} className="order-row">
            <span>#{o._id.slice(-6).toUpperCase()}</span>
            <span>{new Date(o.createdAt).toLocaleDateString()}</span>
            <span className={"status-badge status-" + o.status}>{o.status}</span>
            <span>${o.total.toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState2(null);

  useEffect2(() => { api.getOrder(id).then((res) => setOrder(res.data)); }, [id]);

  if (!order) return <Loader />;
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="section narrow">
      <h2 className="section-title">Order #{order._id.slice(-6).toUpperCase()}</h2>

      {order.status === "cancelled" ? (
        <div className="badge badge-error">Cancelled</div>
      ) : (
        <div className="status-timeline">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className={"timeline-step" + (i <= currentStepIndex ? " active" : "")}>
              <div className="timeline-dot"></div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      <div className="order-items">
        {order.items.map((item, idx) => (
          <div key={idx} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="cart-item-info">
              <div>{item.name}</div>
              <div className="hint">{item.size} / {item.color} × {item.quantity}</div>
            </div>
            <div className="price">${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
        <div className="summary-row"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>${order.shipping.toFixed(2)}</span></div>
        <div className="summary-row summary-total"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate2();
  const [form, setForm] = useState2({ email: "", password: "" });
  const [error, setError] = useState2("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.login(form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="section narrow">
      <h2 className="section-title">Log in</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="login-password">Password</label>
        <input id="login-password" required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <ErrorMessage message={error} />
        <button className="btn btn-primary btn-large" type="submit">Log in</button>
      </form>
      <p className="hint">Demo: admin@example.com / Admin123! · customer@example.com / Customer123!</p>
    </div>
  );
}

function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate2();
  const [form, setForm] = useState2({ name: "", email: "", password: "", consent: false });
  const [error, setError] = useState2("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.consent) {
      setError("You must agree to the Terms and Privacy Policy to create an account.");
      return;
    }
    try {
      const res = await api.register(form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="section narrow">
      <h2 className="section-title">Create account</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="reg-name">Name</label>
        <input id="reg-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="reg-password">Password</label>
        <input id="reg-password" required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-describedby="reg-password-hint" />
        <span id="reg-password-hint" className="hint">At least 6 characters.</span>

        {/* NDPA (2023) / GDPR: explicit, unticked-by-default consent — not bundled with account creation */}
        <label className="checkbox-row" htmlFor="reg-consent">
          <input
            id="reg-consent" type="checkbox" checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          />
          <span>
            I agree to the <Link to="/terms">Terms &amp; Conditions</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>, and consent to my data being processed for order fulfillment.
          </span>
        </label>

        <ErrorMessage message={error} />
        <button className="btn btn-primary btn-large" type="submit">Sign up</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legal & Account pages (Terms, Return/Refund Policy, Privacy, NDPA/GDPR self-service)
// ---------------------------------------------------------------------------

function TermsPage() {
  return (
    <div className="section narrow legal-page">
      <h2 className="section-title">Terms &amp; Conditions</h2>
      <p className="hint">Effective upon account registration.</p>
      <h3>1. Acceptance of Terms</h3>
      <p>By creating an account or placing an order, you agree to these Terms, the Return &amp; Refund Policy, and the Privacy Policy.</p>
      <h3>2. Eligibility</h3>
      <p>You must be at least 18, or the age of legal majority in your jurisdiction, to register and purchase.</p>
      <h3>3. Product Information</h3>
      <p>Stock is tracked per size/color variant and validated again at checkout; availability shown while browsing is not a guarantee.</p>
      <h3>4. Payment</h3>
      <p>Payment is processed through a PCI-DSS-aligned tokenized flow. This platform does not store full card numbers.</p>
      <h3>5. Limitation of Liability</h3>
      <p>We are not liable for indirect or consequential damages arising from use of this service, to the extent permitted by law.</p>
      <h3>6. Changes</h3>
      <p>We may update these Terms from time to time; continued use after changes take effect constitutes acceptance.</p>
    </div>
  );
}

function ReturnPolicyPage() {
  return (
    <div className="section narrow legal-page">
      <h2 className="section-title">Return &amp; Refund Policy</h2>
      <h3>Return Window</h3>
      <p>Items may be returned within 14 days of delivery, unworn and with original tags attached.</p>
      <h3>Non-Returnable Items</h3>
      <p>Final-sale items, intimate apparel, and items without original tags are not eligible for return.</p>
      <h3>Refund Process</h3>
      <p>Once a returned item is received and inspected, a refund is issued to your original payment method within 5–10 business days.</p>
      <h3>Damaged or Incorrect Items</h3>
      <p>Items arriving damaged, defective, or incorrect qualify for a full refund or replacement, including return shipping, at no cost to you.</p>
    </div>
  );
}

function PrivacyPolicyPage() {
  return (
    <div className="section narrow legal-page">
      <h2 className="section-title">Privacy Policy</h2>
      <p className="hint">Aligned with the Nigeria Data Protection Act, 2023 (NDPA) and the EU GDPR.</p>
      <h3>What we collect</h3>
      <p>Name, email, password (hashed), shipping addresses, order history, and reviews you submit — only what's needed to operate your account and fulfill orders.</p>
      <h3>Your rights</h3>
      <p>You can access a copy of your data, or request deletion of your account, at any time from your <Link to="/account">Account</Link> page.</p>
      <h3>Data retention</h3>
      <p>Order records are retained for legal/tax purposes even after account deletion, but are no longer linked to identifying personal data once your account is deleted.</p>
      <h3>Cross-border transfer</h3>
      <p>Our hosting infrastructure may be located outside your country of residence; appropriate safeguards are applied to any such transfer.</p>
    </div>
  );
}

function AccountPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState2("");
  const [error, setError] = useState2("");
  const [confirmingDelete, setConfirmingDelete] = useState2(false);
  const navigate = useNavigate2();
  const { logout } = useAuth();

  async function handleExport() {
    setError(""); setMessage("");
    try {
      const res = await api.exportMyData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Your data export has downloaded.");
    } catch (e) { setError(e.message); }
  }

  async function handleDelete() {
    setError("");
    try {
      await api.deleteMyAccount();
      logout();
      navigate("/");
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="section narrow">
      <h2 className="section-title">Account</h2>
      <p><strong>{user?.name}</strong><br /><span className="hint">{user?.email}</span></p>

      <div className="account-card">
        <h3>Your data rights</h3>
        <p className="hint">Under NDPA (2023) and GDPR, you have the right to access and erase your personal data.</p>
        <div className="add-to-cart-row">
          <button className="btn btn-outline" onClick={handleExport}>Download My Data</button>
          <button className="btn btn-outline" onClick={() => setConfirmingDelete(true)}>Delete My Account</button>
        </div>

        {confirmingDelete && (
          <div className="confirm-box" role="alertdialog" aria-labelledby="confirm-delete-title">
            <p id="confirm-delete-title"><strong>Are you sure?</strong> Your profile will be anonymized and you'll be logged out. This cannot be undone.</p>
            <div className="add-to-cart-row">
              <button className="btn btn-primary" onClick={handleDelete}>Yes, delete my account</button>
              <button className="btn btn-outline" onClick={() => setConfirmingDelete(false)}>Cancel</button>
            </div>
          </div>
        )}

        <ErrorMessage message={error} />
        {message && <div className="success-message" role="status">{message}</div>}
      </div>

      <p className="hint" style={{ marginTop: 20 }}>
        Read our <Link to="/terms">Terms</Link>, <Link to="/return-policy">Return Policy</Link>, or <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  );
}
