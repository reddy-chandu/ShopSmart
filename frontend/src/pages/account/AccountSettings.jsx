import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiAlertTriangle, FiCheck, FiEye, FiEyeOff, FiLock, FiMapPin, FiSave, FiShield, FiUser, FiX } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  deleteMyAccountAction,
  updateMyAccountAction,
  userPasswordUpdateAction,
} from "../../redux/actions/userAction";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./AccountSettings.css";

const emptyDeliveryAddress = {
  address: "",
  city: "",
  mobileNumber: "",
  pinCode: "",
};

const AccountSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { loading: passwordSaving, error: passwordUpdateError } = useSelector((state) => state.passwordUpdate);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    deliveryAddress: { ...emptyDeliveryAddress, ...user?.deliveryAddress },
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

  useEffect(() => {
    document.title = "Manage your account";
  }, []);

  useEffect(() => {
    if (!passwordUpdateError) return undefined;
    const timeout = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(timeout);
  }, [dispatch, passwordUpdateError]);

  useEffect(() => {
    setProfile({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      deliveryAddress: { ...emptyDeliveryAddress, ...user?.deliveryAddress },
    });
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSavedMessage("");
    setFormError("");
  };

  const handleAddressChange = (event, maxDigits) => {
    const { name } = event.target;
    const value = maxDigits
      ? event.target.value.replace(/\D/g, "").slice(0, maxDigits)
      : event.target.value;
    setProfile((current) => ({
      ...current,
      deliveryAddress: { ...current.deliveryAddress, [name]: value },
    }));
    setSavedMessage("");
    setFormError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const { deliveryAddress } = profile;
    const addressValues = Object.values(deliveryAddress);
    const hasAddress = addressValues.some((value) => value.trim());

    if (profile.firstName.trim().length < 2 || !profile.lastName.trim()) {
      setFormError("Enter a first name with at least 2 characters and a last name.");
      return;
    }
    if (hasAddress && addressValues.some((value) => !value.trim())) {
      setFormError("Complete every delivery address field or leave them all blank.");
      return;
    }
    if (deliveryAddress.mobileNumber && !/^\d{10}$/.test(deliveryAddress.mobileNumber)) {
      setFormError("Mobile number must contain exactly 10 digits.");
      return;
    }
    if (deliveryAddress.pinCode && !/^\d{6}$/.test(deliveryAddress.pinCode)) {
      setFormError("PIN code must contain exactly 6 digits.");
      return;
    }

    setSaving(true);
    setSavedMessage("");
    setFormError("");
    try {
      const result = await dispatch(updateMyAccountAction(profile));
      setSavedMessage(result.message || "Your details have been saved.");
    } catch (error) {
      const message = error.response?.data?.message;
      setFormError(Array.isArray(message) ? message.join(" ") : message || "Could not save your account details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    try {
      await dispatch(deleteMyAccountAction());
      navigate("/", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message;
      setDeleteError(Array.isArray(message) ? message.join(" ") : message || "Could not delete your account.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordFormError("");
    setPasswordSuccessMessage("");
    if (newPassword.length < 4) {
      setPasswordFormError("Use at least 4 characters for your password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFormError("Your passwords do not match.");
      return;
    }

    const result = await dispatch(userPasswordUpdateAction({
      password: newPassword,
      confirm_password: confirmPassword,
    }));
    if (result?.success) {
      setPasswordSuccessMessage(result.message || "Your password has been updated.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handlePasswordInput = (setter) => (event) => {
    setter(event.target.value);
    setPasswordFormError("");
    setPasswordSuccessMessage("");
    if (passwordUpdateError) dispatch(clearError());
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <>
      <Header />
      <main className="account-page">
        <header className="account-header">
          <div className="account-heading-copy">
            <span className="account-eyebrow">PROFILE & DELIVERY</span>
            <h1>Manage your account</h1>
            <p>Keep your details updated for a smoother checkout.</p>
          </div>
          <div className="account-identity">
            <span className="account-avatar" aria-hidden="true">{initials || <FiUser />}</span>
            <span className="account-identity-copy">
              <strong>{user?.firstName} {user?.lastName}</strong>
              <span>{user?.email}</span>
            </span>
          </div>
        </header>

        <form className="account-form" onSubmit={handleSave}>
          <section className="account-section" aria-labelledby="personal-details-heading">
            <div className="account-section-heading">
              <span className="account-section-icon"><FiUser /></span>
              <div>
                <h2 id="personal-details-heading">Personal details</h2>
                <p>Your name is used for your account and order records.</p>
              </div>
            </div>
            <div className="account-fields-grid">
              <label className="account-field">
                <span>First name</span>
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  minLength={2}
                  maxLength={60}
                  required
                />
              </label>
              <label className="account-field">
                <span>Last name</span>
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  maxLength={60}
                  required
                />
              </label>
              <label className="account-field account-field-full">
                <span>Email address</span>
                <input type="email" value={user?.email || ""} autoComplete="email" readOnly />
                <small>Email is used to sign in and can’t be changed.</small>
              </label>
            </div>
          </section>

          <section className="account-section" aria-labelledby="delivery-address-heading">
            <div className="account-section-heading">
              <span className="account-section-icon"><FiMapPin /></span>
              <div>
                <h2 id="delivery-address-heading">Default delivery address</h2>
                <p>Saved details will prefill checkout, where you can still edit them.</p>
              </div>
            </div>
            <div className="account-fields-grid">
              <label className="account-field account-field-full">
                <span>Street address</span>
                <input
                  type="text"
                  name="address"
                  autoComplete="street-address"
                  placeholder="House number and street"
                  value={profile.deliveryAddress.address}
                  onChange={handleAddressChange}
                  maxLength={160}
                />
              </label>
              <label className="account-field">
                <span>City</span>
                <input
                  type="text"
                  name="city"
                  autoComplete="address-level2"
                  placeholder="City"
                  value={profile.deliveryAddress.city}
                  onChange={handleAddressChange}
                  maxLength={80}
                />
              </label>
              <label className="account-field">
                <span>Mobile number</span>
                <input
                  type="tel"
                  name="mobileNumber"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="10-digit number"
                  value={profile.deliveryAddress.mobileNumber}
                  onChange={(event) => handleAddressChange(event, 10)}
                />
              </label>
              <label className="account-field">
                <span>PIN code</span>
                <input
                  type="tel"
                  name="pinCode"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  placeholder="6-digit PIN code"
                  value={profile.deliveryAddress.pinCode}
                  onChange={(event) => handleAddressChange(event, 6)}
                />
              </label>
            </div>
          </section>

          <div className="account-form-actions">
            <div className="account-feedback" aria-live="polite">
              {formError && <span className="account-message account-message-error" role="alert">{formError}</span>}
              {savedMessage && <span className="account-message account-message-success"><FiCheck /> {savedMessage}</span>}
            </div>
            <button className="account-save-button" type="submit" disabled={saving}>
              <FiSave /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        <form className="account-form account-password-form" onSubmit={handlePasswordUpdate}>
          <section className="account-section" aria-labelledby="password-heading">
            <div className="account-section-heading">
              <span className="account-section-icon"><FiShield /></span>
              <div>
                <h2 id="password-heading">Password & security</h2>
                <p>Update your password without leaving account settings.</p>
              </div>
            </div>
            <div className="account-fields-grid">
              <label className="account-field">
                <span>New password</span>
                <span className="account-password-input">
                  <FiLock aria-hidden="true" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={4}
                    placeholder="At least 4 characters"
                    value={newPassword}
                    onChange={handlePasswordInput(setNewPassword)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    onClick={() => setShowNewPassword((visible) => !visible)}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </span>
              </label>
              <label className="account-field">
                <span>Confirm new password</span>
                <span className="account-password-input">
                  <FiLock aria-hidden="true" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter it again"
                    value={confirmPassword}
                    onChange={handlePasswordInput(setConfirmPassword)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </span>
              </label>
            </div>
            <div className="account-form-actions">
              <div className="account-feedback" aria-live="polite">
                {passwordFormError && <span className="account-message-error" role="alert">{passwordFormError}</span>}
                {!passwordFormError && passwordUpdateError && (
                  <span className="account-message-error" role="alert">
                    {Array.isArray(passwordUpdateError) ? passwordUpdateError.join(" ") : passwordUpdateError}
                  </span>
                )}
                {passwordSuccessMessage && <span className="account-message account-message-success"><FiCheck /> {passwordSuccessMessage}</span>}
              </div>
              <button className="account-save-button" type="submit" disabled={passwordSaving}>
                <FiLock /> {passwordSaving ? "Updating..." : "Update password"}
              </button>
            </div>
          </section>
        </form>

        <section className="account-danger-zone" aria-labelledby="delete-account-heading">
          <div className="account-danger-copy">
            <span className="account-danger-icon"><FiShield /></span>
            <div>
              <h2 id="delete-account-heading">Delete account</h2>
              <p>Remove your profile and reviews. Historical order records may be retained for service and recordkeeping.</p>
            </div>
          </div>
          <button type="button" className="account-delete-button" onClick={() => setShowDeleteDialog(true)}>
            Delete account
          </button>
        </section>
      </main>
      <Footer />

      {showDeleteDialog && (
        <div className="account-dialog-backdrop" onClick={() => !deleting && setShowDeleteDialog(false)}>
          <section
            className="account-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-heading"
            aria-describedby="confirm-delete-description"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="account-dialog-close"
              aria-label="Close delete account dialog"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              <FiX />
            </button>
            <span className="account-dialog-warning"><FiAlertTriangle /></span>
            <h2 id="confirm-delete-heading">Delete your account?</h2>
            <p id="confirm-delete-description">This permanently removes your profile and reviews. Type DELETE to confirm.</p>
            <label className="account-field">
              <span>Confirmation</span>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                autoComplete="off"
                autoFocus
              />
            </label>
            {deleteError && <p className="account-message-error" role="alert">{deleteError}</p>}
            <div className="account-dialog-actions">
              <button type="button" className="account-cancel-button" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                Keep account
              </button>
              <button type="button" className="account-confirm-delete" onClick={handleDelete} disabled={deleteConfirmation !== "DELETE" || deleting}>
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default AccountSettings;