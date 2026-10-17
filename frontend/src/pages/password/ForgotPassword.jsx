import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { FiArrowRight, FiCheck, FiMail } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import { clearError, restPasswordSendEmailAction } from "../../redux/actions/userAction";

import PasswordPageLayout from "./PasswordPageLayout";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const { success, message, error, loading } = useSelector(
    (state) => state.sendResetPassMail
  );

  useEffect(() => {
    document.title = "Forgot Password";
  }, []);

  useEffect(() => {
    if (!error) return undefined;
    const timeout = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(timeout);
  }, [dispatch, error]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(restPasswordSendEmailAction(email.trim()));
  };

  const errorMessages = error ? (Array.isArray(error) ? error : [error]) : [];

  return (
    <PasswordPageLayout
      eyebrow="Password recovery"
      visualTitle="A quick reset gets you back to your list."
      visualDescription="We’ll send a secure link to the email address on your ShopSmart account."
      formTitle={success ? "Check your inbox" : "Forgot your password?"}
      formDescription={success ? "Your reset request has been sent." : "Enter the email address you used to create your account."}
    >
      {success ? (
        <div className="auth-success" role="status">
          <span className="auth-success-icon"><FiCheck /></span>
          <p>{message || "If that email is registered, a reset link is on its way."}</p>
          <a className="password-result-link" href="https://mail.google.com/mail/#inbox" target="_blank" rel="noreferrer">
            Open email <FiArrowRight />
          </a>
          <Link className="password-back-link" to="/sign-in">Back to sign in</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field" htmlFor="forgot-email">
            Email address
            <span className="auth-input-wrap">
              <FiMail aria-hidden="true" />
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </span>
          </label>

          {errorMessages.length > 0 && (
            <div className="auth-error password-auth-error" role="alert">
              {errorMessages.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
            </div>
          )}

          <button className="auth-submit-button" type="submit" disabled={loading}>
            {loading ? "Sending link..." : "Send reset link"} <FiArrowRight />
          </button>
          <Link className="password-back-link" to="/sign-in">Back to sign in</Link>
        </form>
      )}
    </PasswordPageLayout>
  );
};

export default ForgotPassword;