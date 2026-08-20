import { useState, useEffect } from "react";
import Select from "react-select";
import {
  FiUserCheck,
  FiHash,
  FiSave,
  FiMail,
  FiLock,
  FiMapPin,
  FiUserPlus,
} from "react-icons/fi";

const OpsManagerForm = ({
  handleAddOpsManager,
  editingOpsManager,
  locations = [],
}) => {
  const [opsManagerData, setOpsManagerData] = useState({
    OracleID: "",
    OpsManagerName: "",
    CreateLogin: false,
    Email: "",
    Password: "",
    LocationID: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingOpsManager) {
      setOpsManagerData({
        OracleID: editingOpsManager.oracleid,
        OpsManagerName: editingOpsManager.opsmanagername,
        CreateLogin: false,
        Email: "",
        Password: "",
        LocationID: "",
      });
    } else {
      setOpsManagerData({
        OracleID: "",
        OpsManagerName: "",
        CreateLogin: false,
        Email: "",
        Password: "",
        LocationID: "",
      });
    }

    setFormError("");
  }, [editingOpsManager]);

  const handleChange = (e) => {
    setOpsManagerData({
      ...opsManagerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (opsManagerData.CreateLogin) {
      if (!opsManagerData.Password) {
        setFormError("Please enter a password for the login account.");
        return;
      }
      if (!opsManagerData.LocationID) {
        setFormError("Please select a location for the login account.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      await handleAddOpsManager(opsManagerData);

      setOpsManagerData({
        OracleID: "",
        OpsManagerName: "",
        CreateLogin: false,
        Email: "",
        Password: "",
        LocationID: "",
      });
    } catch (error) {
      setFormError(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationOptions = locations.map((location) => ({
    value: location.locationid,
    label: location.locationname,
  }));

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="ag-error-banner">{formError}</div>}

      <div className="ag-form-grid">
        <div className="ag-field">
          <label>
            <FiUserCheck /> Ops manager name
          </label>

          <input
            type="text"
            name="OpsManagerName"
            placeholder="e.g. Sayed Ali"
            value={opsManagerData.OpsManagerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ag-field">
          <label>
            <FiHash /> Oracle ID
          </label>

          <input
            type="number"
            name="OracleID"
            placeholder="102553"
            value={opsManagerData.OracleID}
            onChange={handleChange}
            required
            readOnly={Boolean(editingOpsManager)}
          />
        </div>
      </div>

      {/* Login account section — only when creating a new manager */}
      {!editingOpsManager && (
        <div
          className="ag-login-section"
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: "1px dashed #e5e7eb",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={opsManagerData.CreateLogin}
              onChange={(e) =>
                setOpsManagerData({
                  ...opsManagerData,
                  CreateLogin: e.target.checked,
                })
              }
            />
            <FiUserPlus />
            Create a system login account for this manager now
          </label>

          {opsManagerData.CreateLogin && (
            <div className="ag-form-grid" style={{ marginTop: 14 }}>
              <div className="ag-field">
                <label>
                  <FiMail /> Email
                </label>
                <input
                  type="email"
                  name="Email"
                  placeholder="name@apparelgroup.com"
                  onChange={handleChange}
                  value={opsManagerData.Email}
                />
              </div>

              <div className="ag-field">
                <label>
                  <FiLock /> Password
                </label>
                <input
                  type="password"
                  name="Password"
                  placeholder="Minimum 4 characters"
                  onChange={handleChange}
                  value={opsManagerData.Password}
                  required={opsManagerData.CreateLogin}
                />
              </div>

              <div className="ag-field">
                <label>
                  <FiMapPin /> Location
                </label>
                <Select
                  classNamePrefix="ag-rs"
                  className="ag-select"
                  options={locationOptions}
                  placeholder="Search location..."
                  value={
                    locationOptions.find(
                      (o) => o.value === opsManagerData.LocationID
                    ) || null
                  }
                  onChange={(o) =>
                    setOpsManagerData({
                      ...opsManagerData,
                      LocationID: o ? o.value : "",
                    })
                  }
                  isSearchable
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="ag-form-actions">
        <button
          type="submit"
          className="ag-btn ag-btn-primary"
          disabled={isSubmitting}
        >
          <FiSave />
          {isSubmitting
            ? "Saving..."
            : editingOpsManager
              ? "Update ops manager"
              : "Save ops manager"}
        </button>
      </div>
    </form>
  );
};

export default OpsManagerForm;