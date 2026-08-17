import React, { useState, useEffect } from "react";
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

const UserForm = ({
  editingUser,
  handleAddUser,
  onCancelEdit,
  locations = [],
  prefillData = null,
}) => {



  const [formData, setFormData] = useState(initialUser);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  if (editingUser) {
    setFormData({
      OracleID: editingUser.oracleid || "",
      UserName: editingUser.username || "",
      Password: "",
      LocationID: editingUser.locationid || null,
      RoleID: editingUser.roleid || "",
      Email: editingUser.email || "",
    });
  } else if (prefillData) {
    setFormData({
      OracleID: prefillData.oracleId || "",
      UserName: prefillData.userName || "",
      Password: "",
      LocationID: prefillData.locationId || null,
      RoleID: prefillData.role || "",
      Email: "",
    });
  } else {
    setFormData(initialUser);
  }

  setFormError("");
}, [editingUser, prefillData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const locationOptions = locations.map((location) => ({
    value: location.locationid,
    label: location.locationname,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!editingUser) {
      if (
        !formData.OracleID ||
        !formData.UserName ||
        !formData.Password ||
        !formData.LocationID ||
        !formData.RoleID
      ) {
        setFormError("Please fill all fields");
        return;
      }
    } else {
      if (!formData.UserName || !formData.LocationID || !formData.RoleID) {
        setFormError("Please fill all fields");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      await handleAddUser(formData);

      setFormData(initialUser);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && (
        <div className="ag-error-banner">
          <FiAlertCircle />
          {formError}
        </div>
      )}

      <div className="ag-form-grid">
        {!editingUser && (
          <div className="ag-field">
            <label>
              <FiHash />
              Oracle ID
            </label>

            <input
                  type="number"
                  name="OracleID"
                  value={formData.OracleID}
                  placeholder="Oracle ID"
                  onChange={handleChange}
                  readOnly={Boolean(prefillData)}
                />
          </div>
        )}

        <div className="ag-field">
          <label>
            <FiUser />
            User name
          </label>

          <input
            type="text"
            name="UserName"
            value={formData.UserName}
            placeholder="User name"
            onChange={handleChange}
          />
        </div>

        <div className="ag-field">
          <label>
            <FiMail />
            Email
          </label>

          <input
            type="email"
            name="Email"
            value={formData.Email}
            placeholder="name@company.com"
            onChange={handleChange}
          />
        </div>

        <div className="ag-field">
          <label>
            <FiLock />
            Password
          </label>

          <input
            type="password"
            name="Password"
            value={formData.Password}
            placeholder={editingUser ? "New password (optional)" : "Password"}
            onChange={handleChange}
          />
        </div>

        <div className="ag-field">
          <label>
            <FiMapPin />
            Location
          </label>

          <Select
            classNamePrefix="ag-rs"
            className="ag-select"
            options={locationOptions}
            placeholder="Search location..."
            value={
              locationOptions.find(
                (option) => option.value === formData.LocationID,
              ) || null
            }
            onChange={(option) =>
              setFormData({
                ...formData,
                LocationID: option ? option.value : null,
              })
            }
            isSearchable
          />
        </div>

        <div className="ag-field">
          <label>
            <FiShield />
            Role
          </label>

          <select name="RoleID" value={formData.RoleID} onChange={handleChange}>
            <option value="">Select role</option>

            <option value="2">Ops Manager</option>

            <option value="3">Store Manager</option>

            <option value="4">Auditor</option>

            <option value="5">Audit Manager</option>
          </select>
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
              ? "Update User"
              : "Create User"}
        </button>

        {editingUser && (
          <button
            type="button"
            className="ag-btn ag-btn-ghost"
            onClick={onCancelEdit}
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