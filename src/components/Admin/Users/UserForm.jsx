import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
  FiHash,
  FiUser,
  FiLock,
  FiMapPin,
  FiShield,
  FiSave,
  FiX,
  FiAlertCircle,
  FiMail,
} from "react-icons/fi";

const initialUser = {
  OracleID: "",
  UserName: "",
  Password: "",
  LocationID: null,
  RoleID: "",
  Email: "",
};

const ROLE_OPTIONS = [
  { value: "2", label: "Ops Manager" },
  { value: "3", label: "Store Manager" },
  { value: "4", label: "Auditor" },
  { value: "5", label: "Audit Manager" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Letters (Latin or Arabic), numbers, dot, underscore, hyphen — must contain at least one letter.
// Blocks purely numeric names (e.g. "123") and unsafe/special characters.
const USERNAME_PATTERN = /^[A-Za-z\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF._-]*$/;

// Purely informational — does not block submission.
const getPasswordStrength = (password) => {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", color: "#dc2626", percent: 25 };
  if (score <= 2) return { label: "Fair", color: "#d97706", percent: 50 };
  if (score <= 3) return { label: "Good", color: "#2563eb", percent: 75 };
  return { label: "Strong", color: "#16a34a", percent: 100 };
};

const UserForm = ({
  editingUser,
  handleAddUser,
  onCancelEdit,
  locations = [],
  prefillData = null,
}) => {
  const [formData, setFormData] = useState(initialUser);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        OracleID: editingUser.oracleid || "",
        UserName: editingUser.username || "",
        Password: "",
        LocationID: editingUser.locationid || null,
        RoleID: editingUser.roleid ? String(editingUser.roleid) : "",
        Email: editingUser.email || "",
      });
    } else if (prefillData) {
      setFormData({
        OracleID: prefillData.oracleId || "",
        UserName: prefillData.userName || "",
        Password: "",
        LocationID: prefillData.locationId || null,
        RoleID: prefillData.role ? String(prefillData.role) : "",
        Email: "",
      });
    } else {
      setFormData(initialUser);
    }

    setFieldErrors({});
    setFormError("");
  }, [editingUser, prefillData]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.Password),
    [formData.Password],
  );

  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location.locationid,
        label: location.locationname,
      })),
    [locations],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the field-level error as soon as the person edits it.
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const errors = {};
    const userName = formData.UserName.trim();
    const email = formData.Email.trim();

    if (!editingUser && !String(formData.OracleID).trim()) {
      errors.OracleID = "Oracle ID is required.";
    }

    if (!userName) {
      errors.UserName = "User name is required.";
    } else if (userName.length < 3) {
      errors.UserName = "User name must be at least 3 characters.";
    } else if (!USERNAME_PATTERN.test(userName)) {
      errors.UserName =
        "Must start with a letter, and can only contain letters, numbers, dots, hyphens, or underscores.";
    }

    if (email && !EMAIL_PATTERN.test(email)) {
      errors.Email = "Enter a valid email address.";
    }

    if (!editingUser && !formData.Password) {
      errors.Password = "Password is required.";
    }
    // No length/complexity block here — the strength meter below informs the
    // person instead of stopping them from saving a weak password.

    if (!formData.LocationID) {
      errors.LocationID = "Select a location.";
    }

    if (!formData.RoleID) {
      errors.RoleID = "Select a role.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the highlighted fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      await handleAddUser({
        ...formData,
        UserName: formData.UserName.trim(),
        Email: formData.Email.trim(),
      });

      setFormData(initialUser);
      setFieldErrors({});
    } catch (error) {
      setFormError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="ag-error-banner" role="alert">
          <FiAlertCircle />
          {formError}
        </div>
      )}

      <div className="ag-form-grid">
        {!editingUser && (
          <div className="ag-field">
            <label htmlFor="OracleID">
              <FiHash />
              Oracle ID
              <span className="ag-required">*</span>
            </label>

            <input
              id="OracleID"
              type="number"
              name="OracleID"
              value={formData.OracleID}
              placeholder="Oracle ID"
              onChange={handleChange}
              readOnly={Boolean(prefillData)}
              className={fieldErrors.OracleID ? "ag-input-error" : ""}
              aria-invalid={Boolean(fieldErrors.OracleID)}
            />

            {fieldErrors.OracleID && (
              <span className="ag-field-error">
                <FiAlertCircle /> {fieldErrors.OracleID}
              </span>
            )}
          </div>
        )}

        <div className="ag-field">
          <label htmlFor="UserName">
            <FiUser />
            User name
            <span className="ag-required">*</span>
          </label>

          <input
            id="UserName"
            type="text"
            name="UserName"
            value={formData.UserName}
            placeholder="User name"
            onChange={handleChange}
            className={fieldErrors.UserName ? "ag-input-error" : ""}
            aria-invalid={Boolean(fieldErrors.UserName)}
          />

          {fieldErrors.UserName && (
            <span className="ag-field-error">
              <FiAlertCircle /> {fieldErrors.UserName}
            </span>
          )}
        </div>

        <div className="ag-field">
          <label htmlFor="Email">
            <FiMail />
            Email
          </label>

          <input
            id="Email"
            type="email"
            name="Email"
            value={formData.Email}
            placeholder="name@company.com"
            onChange={handleChange}
            className={fieldErrors.Email ? "ag-input-error" : ""}
            aria-invalid={Boolean(fieldErrors.Email)}
          />

          {fieldErrors.Email && (
            <span className="ag-field-error">
              <FiAlertCircle /> {fieldErrors.Email}
            </span>
          )}
        </div>

        <div className="ag-field">
          <label htmlFor="Password">
            <FiLock />
            Password
            {!editingUser && <span className="ag-required">*</span>}
          </label>

          <input
            id="Password"
            type="password"
            name="Password"
            value={formData.Password}
            placeholder={editingUser ? "New password (optional)" : "Password"}
            onChange={handleChange}
            className={fieldErrors.Password ? "ag-input-error" : ""}
            aria-invalid={Boolean(fieldErrors.Password)}
            autoComplete="new-password"
          />

          {fieldErrors.Password && (
            <span className="ag-field-error">
              <FiAlertCircle /> {fieldErrors.Password}
            </span>
          )}

          {passwordStrength && (
            <div className="ag-strength-meter" aria-hidden="false">
              <div className="ag-strength-track">
                <div
                  className="ag-strength-fill"
                  style={{
                    width: `${passwordStrength.percent}%`,
                    background: passwordStrength.color,
                  }}
                />
              </div>
              <span
                className="ag-strength-label"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </span>
            </div>
          )}

          {!fieldErrors.Password && !formData.Password && (
            <span className="ag-field-hint">
              {editingUser
                ? "Leave blank to keep the current password."
                : "Any password is accepted — the bar just shows its strength."}
            </span>
          )}
        </div>

        <div className="ag-field">
          <label htmlFor="LocationID">
            <FiMapPin />
            Location
            <span className="ag-required">*</span>
          </label>

          <Select
            inputId="LocationID"
            classNamePrefix="ag-rs"
            className={`ag-select ${fieldErrors.LocationID ? "ag-input-error" : ""}`}
            options={locationOptions}
            placeholder="Search location..."
            value={
              locationOptions.find(
                (option) => option.value === formData.LocationID,
              ) || null
            }
            onChange={(option) => setField("LocationID", option ? option.value : null)}
            isSearchable
          />

          {fieldErrors.LocationID && (
            <span className="ag-field-error">
              <FiAlertCircle /> {fieldErrors.LocationID}
            </span>
          )}
        </div>

        <div className="ag-field">
          <label htmlFor="RoleID">
            <FiShield />
            Role
            <span className="ag-required">*</span>
          </label>

          <Select
            inputId="RoleID"
            classNamePrefix="ag-rs"
            className={`ag-select ${fieldErrors.RoleID ? "ag-input-error" : ""}`}
            options={ROLE_OPTIONS}
            placeholder="Select role..."
            value={
              ROLE_OPTIONS.find(
                (option) => option.value === String(formData.RoleID),
              ) || null
            }
            onChange={(option) => setField("RoleID", option ? option.value : "")}
            isSearchable={false}
          />

          {fieldErrors.RoleID && (
            <span className="ag-field-error">
              <FiAlertCircle /> {fieldErrors.RoleID}
            </span>
          )}
        </div>
      </div>

      <div className="ag-form-actions">
        <button
          type="submit"
          className="ag-btn ag-btn-primary"
          disabled={isSubmitting}
        >
          <FiSave />

          {isSubmitting
            ? "Saving..."
            : editingUser
              ? "Update user"
              : "Create user"}
        </button>

        {editingUser && (
          <button
            type="button"
            className="ag-btn ag-btn-ghost"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            <FiX />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default UserForm;