import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { FiArrowRight, FiCheck, FiLock } from "react-icons/fi";
import { MdVerifiedUser } from "react-icons/md";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

import { useDispatch, useSelector } from "react-redux";
import { clearError, restPasswordAction } from "../../redux/actions/userAction";

import PasswordPageLayout from "./PasswordPageLayout";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const { loading, error, message, success } = useSelector(
    (state) => state.passwordReset
  );

  useEffect(() => {
    document.title = "Reset Password";
  }, []);

  useEffect(() => {
    if (!error) return undefined;
    const timeout = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(timeout);
  }, [dispatch, error]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    if (password.length < 4) {
      setFormError("Use at least 4 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Your passwords do not match.");
      return;
    }
    dispatch(restPasswordAction(id, token, password, confirmPassword));
  };

  const errorMessages = formError ? [formError] : error ? (Array.isArray(error) ? error : [error]) : [];

  return (
    <PasswordPageLayout
      eyebrow="Password recovery"
      visualTitle="Choose a new key for your ShopSmart account."
      visualDescription="Create a new password, then sign in with it to continue shopping."
      formTitle={success ? "Password reset" : "Create a new password"}
      formDescription={success ? "Your account password has been updated." : "Use at least 4 characters and enter it twice."}
    >
      {success ? (
        <div className="auth-success" role="status">
          <span className="auth-success-icon"><FiCheck /></span>
          <p>{message || "Your password has been reset successfully."}</p>
          <button className="auth-submit-button" onClick={() => navigate("/sign-in")}>
            Continue to sign in <FiArrowRight />
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field" htmlFor="reset-password">
            New password
            <span className="auth-input-wrap">
              <FiLock aria-hidden="true" />
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={4}
                placeholder="At least 4 characters"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFormError("");
                }}
                required
              />
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

          <label className="auth-field" htmlFor="reset-confirm-password">
            Confirm new password
            <span className="auth-input-wrap">
              <MdVerifiedUser aria-hidden="true" />
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter it again"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setFormError("");
                }}
                required
              />
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
            <div className="auth-error password-auth-error" role="alert">
              {errorMessages.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
            </div>
          )}

          <button className="auth-submit-button" type="submit" disabled={loading}>
            {loading ? "Updating password..." : "Reset password"} <FiArrowRight />
          </button>
          <Link className="password-back-link" to="/sign-in">Back to sign in</Link>
        </form>
      )}
    </PasswordPageLayout>
  );
};

export default ResetPassword;