import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { MdOutlineMarkEmailRead } from "react-icons/md";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { FiArrowRight, FiLock } from "react-icons/fi";
import { RiShoppingBasketLine } from "react-icons/ri";

import { useDispatch, useSelector } from "react-redux";
import { userLoginAction, clearError } from "../../redux/actions/userAction";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./AuthPages.css";

const SignIn = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { error, loading } = useSelector((state) => state.user);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch(userLoginAction({
      email: formData.get("email"),
      password: formData.get("password"),
    }));
  };

  useEffect(() => {
    document.title = "Sign In";
  }, []);

  useEffect(() => {
    if (!error) return undefined;
    const timeout = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(timeout);
  }, [dispatch, error]);

  const errorMessages = error ? (Array.isArray(error) ? error : [error]) : [];

  return (
    <>
      <Header />
      <main className="auth-page">
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
              <span>Welcome back</span>
              <h1>Your everyday shop, right where you left it.</h1>
              <p>Sign in to pick up your basket, follow orders, and keep your favorites close.</p>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <header className="auth-form-heading">
            <span>Good to see you</span>
            <h2>Sign in</h2>
            <p>Enter your account details to continue shopping.</p>
          </header>

          <form className="auth-form" name="login_form" onSubmit={handleLoginSubmit}>
            <label className="auth-field" htmlFor="signin-email">
              Email address
              <span className="auth-input-wrap">
                <MdOutlineMarkEmailRead aria-hidden="true" />
                <input id="signin-email" type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
              </span>
            </label>

            <label className="auth-field" htmlFor="signin-password">
              Password
              <span className="auth-input-wrap">
                <FiLock aria-hidden="true" />
                <input id="signin-password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" autoComplete="current-password" required />
                <button
                  type="button"
                  className="auth-visibility-button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <VscEyeClosed /> : <VscEye />}
                </button>
              </span>
            </label>

            {errorMessages.length > 0 && (
              <div className="auth-error" role="alert">
                {errorMessages.map((message, index) => <p key={`${message}-${index}`}>{message}</p>)}
              </div>
            )}

            <div className="auth-inline-links">
              <Link to="/forgot-password">Forgot password?</Link>
              <Link to="/create-account">Create an account</Link>
            </div>

            <button className="auth-submit-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"} <FiArrowRight />
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SignIn;