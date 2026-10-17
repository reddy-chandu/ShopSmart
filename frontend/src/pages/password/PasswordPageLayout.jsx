import { Link } from "react-router-dom";

import { RiShoppingBasketLine } from "react-icons/ri";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./PasswordPages.css";

const PasswordPageLayout = ({
  eyebrow,
  visualTitle,
  visualDescription,
  formTitle,
  formDescription,
  children,
}) => (
  <>
    <Header />
    <main className="auth-page password-auth-page">
      <section className="auth-visual" aria-label="ShopSmart">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85"
          alt="Fresh produce at a market"
        />
        <div className="auth-visual-overlay">
          <Link to="/" className="auth-brand">
            <span className="auth-brand-mark"><RiShoppingBasketLine /></span>
            ShopSmart
          </Link>
          <div className="auth-visual-copy">
            <span>Account support</span>
            <h1>{visualTitle}</h1>
            <p>{visualDescription}</p>
          </div>
        </div>
      </section>
      <section className="auth-form-panel">
        <header className="auth-form-heading">
          <span>{eyebrow}</span>
          <h2>{formTitle}</h2>
          <p>{formDescription}</p>
        </header>
        {children}
      </section>
    </main>
    <Footer />
  </>
);

export default PasswordPageLayout;