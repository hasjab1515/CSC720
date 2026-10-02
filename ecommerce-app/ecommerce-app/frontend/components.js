const { Link, useNavigate } = ReactRouterDOM;

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Northfield &amp; Co.</Link>
        <nav className="nav-links" aria-label="Primary">
          <Link to="/products">Shop</Link>
          {user && <Link to="/orders">Orders</Link>}
          {user && <Link to="/cart">Cart</Link>}
          {user && <Link to="/account">Account</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="hello">Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn-outline" onClick={() => { logout(); navigate("/"); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function StarRating({ value = 0, count }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" title={value + " out of 5"}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "star filled" : "star"}>★</span>
      ))}
      {typeof count === "number" && <span className="review-count">({count})</span>}
    </span>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) return <span className="badge badge-error">Out of stock</span>;
  if (stock <= 5) return <span className="badge badge-warning">Only {stock} left</span>;
  return <span className="badge badge-success">In stock</span>;
}

function ProductCard({ product }) {
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.images?.[0]} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{product.category}</div>
        <div className="product-card-name">{product.name}</div>
        <StarRating value={product.avgRating} count={product.reviewCount} />
        <div className="product-card-footer">
          <span className="price">${product.basePrice.toFixed(2)}</span>
          <StockBadge stock={totalStock} />
        </div>
      </div>
    </Link>
  );
}

function Loader({ label = "Loading..." }) {
  return <div className="loader">{label}</div>;
}

function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="error-message">{message}</div>;
}

function EmptyState({ title, subtitle, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>
      )}
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (!loading && requireAdmin && user?.role !== "admin") navigate("/");
  }, [loading, user]);

  if (loading) return <Loader />;
  if (!user) return null;
  if (requireAdmin && user.role !== "admin") return null;
  return children;
}
