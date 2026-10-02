const { HashRouter, Routes, Route } = ReactRouterDOM;

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        {/* WCAG 2.2 — 2.4.1 Bypass Blocks: skip link for keyboard/screen-reader users */}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/return-policy" element={<ReturnPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrdersPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer className="site-footer">
          <div>Fashion &amp; Apparel E-Commerce Platform — coursework demo project</div>
          <nav className="footer-links" aria-label="Legal">
            <Link to="/terms">Terms &amp; Conditions</Link>
            <Link to="/return-policy">Return &amp; Refund Policy</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </nav>
        </footer>
      </HashRouter>
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
