import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FiArrowRight, FiCheck, FiLock } from "react-icons/fi";
import { RiShoppingBasketLine } from "react-icons/ri";
import { MdOutlineMarkEmailRead, MdVerifiedUser } from "react-icons/md";
import { RxLetterCaseCapitalize } from "react-icons/rx";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

import { useDispatch, useSelector } from "react-redux";
import { userRegisterAction, clearError } from "../../redux/actions/userAction";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./AuthPages.css";

const CreateAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { error, success, loading } = useSelector((state) => state.register);

  const handleRegisterUser = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch(userRegisterAction({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    }));
  };

  useEffect(() => {
    document.title = "Create Account";
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
      <main className="auth-page auth-page--register">
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
              <span>Start fresh</span>
              <h1>Make room for a smarter kind of grocery run.</h1>
              <p>Create your account to bring your shopping and deliveries together.</p>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          {success ? (
            <div className="auth-success" role="status">
              <span className="auth-success-icon"><FiCheck /></span>
              <h2>Account created</h2>
              <p>Your ShopSmart account is ready. Sign in to start shopping.</p>
              <button className="auth-submit-button" onClick={() => navigate("/sign-in")}>
                Continue to sign in <FiArrowRight />
              </button>
            </div>
          ) : (
            <>
              <header className="auth-form-heading">
                <span>Join ShopSmart</span>
                <h2>Create account</h2>
                <p>Set up your details to make checkout quicker.</p>
              </header>

              <form className="auth-form" onSubmit={handleRegisterUser}>
                <label className="auth-field" htmlFor="register-first-name">
                  First name
                  <span className="auth-input-wrap">
                    <RxLetterCaseCapitalize aria-hidden="true" />
                    <input id="register-first-name" type="text" name="firstName" placeholder="First name" autoComplete="given-name" required />
                  </span>
                </label>

                <label className="auth-field" htmlFor="register-last-name">
                  Last name
                  <span className="auth-input-wrap">
                    <RxLetterCaseCapitalize aria-hidden="true" />
                    <input id="register-last-name" type="text" name="lastName" placeholder="Last name" autoComplete="family-name" required />
                  </span>
                </label>

                <label className="auth-field" htmlFor="register-email">
                  Email address
                  <span className="auth-input-wrap">
                    <MdOutlineMarkEmailRead aria-hidden="true" />
                    <input id="register-email" type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                  </span>
                </label>

                <label className="auth-field" htmlFor="register-password">
                  Password
                  <span className="auth-input-wrap">
                    <FiLock aria-hidden="true" />
                    <input id="register-password" type={showPassword ? "text" : "password"} name="password" placeholder="Create a password" autoComplete="new-password" required />
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

                <label className="auth-field" htmlFor="register-confirm-password">
                  Confirm password
                  <span className="auth-input-wrap">
                    <MdVerifiedUser aria-hidden="true" />
                    <input id="register-confirm-password" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Enter your password again" autoComplete="new-password" required />
                    <button
                      type="button"
                      className="auth-visibility-button"
                      aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                    >
                      {showConfirmPassword ? <VscEyeClosed /> : <VscEye />}
                    </button>
                  </span>
                </label>

                {errorMessages.length > 0 && (
                  <div className="auth-error" role="alert">
                    <ul>{errorMessages.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul>
                  </div>
                )}

                <button className="auth-submit-button" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"} <FiArrowRight />
                </button>
                <div className="auth-inline-links auth-register-signin">
                  <span>Already have an account?</span>
                  <Link to="/sign-in">Sign in</Link>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CreateAccount;