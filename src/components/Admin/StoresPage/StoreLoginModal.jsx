import { useState } from "react";
import { FiKey, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import Swal from "sweetalert2";

import userService from "../../../services/UserServices";
import Modal from "../Shared/Modal";

import "./storeExtras.css";

const StoreLoginModal = ({ isOpen, onClose, store }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetAndClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await userService.setStoreLogin(store.storeserial, password);

      Swal.fire({
        icon: "success",
        title: "Login updated!",
        text: `The store login password for ${
          store?.storecode || "this store"
        } has been updated successfully.`,
        confirmButtonText: "Done",
      });

      resetAndClose();
    } catch (err) {
      console.error("Failed to set/update store login:", err);
      setError(
        err?.message ||
          "Could not set or update the store login password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!store) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      icon={<FiKey />}
      title={`Store login — ${store.storecode}`}
    >
      <form className="sx-form" onSubmit={handleSubmit} noValidate>
        <div className="sx-store-chip">
          <div>
            <span className="sx-store-chip-label">Store</span>
            <strong>{store.storecode}</strong>
          </div>
          <span className="sx-badge sx-badge-info">
            <FiLock size={12} />
            Store account
          </span>
        </div>

        <p className="sx-hint">
          Set a new password for the store login. The current password is
          never displayed and cannot be retrieved. Saving this password will
          create the store login if it does not exist, or update it if it
          already exists.
        </p>

        <div className="sx-field">
          <label htmlFor="store-login-password">New password</label>
          <div className="sx-password-input">
            <input
              id="store-login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="sx-password-toggle"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="sx-field">
          <label htmlFor="store-login-confirm-password">
            Confirm password
          </label>
          <input
            id="store-login-confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <span className="sx-note">Minimum 4 characters.</span>

        {error && (
          <div className="sx-error">
            <FiAlertCircle />
            {error}
          </div>
        )}

        <div className="sx-modal-actions">
          <button
            type="button"
            className="ag-btn ag-btn-ghost"
            onClick={resetAndClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ag-btn ag-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StoreLoginModal;