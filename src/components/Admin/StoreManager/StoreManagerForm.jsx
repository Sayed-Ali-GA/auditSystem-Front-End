import { useState, useEffect } from "react";
import Select from "react-select";
import { FiUser, FiHash, FiTag, FiMapPin, FiSave, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

const StoreManagerForm = ({ brands, locations, handleAddStoreManager, editingStoreManager }) => {
  const [storeManagerData, setStoreManagerData] = useState({
    OracleID: "",
    StoreManagerName: "",
    BrandID: "",
    LocationID: "",
    CreateLogin: false,
    Email: "",
    Password: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (editingStoreManager) {
      setStoreManagerData({
        OracleID: editingStoreManager.oracleid,
        StoreManagerName: editingStoreManager.storemanagername,
        BrandID: editingStoreManager.brandid,
        LocationID: editingStoreManager.locationid,
        CreateLogin: false,
        Email: "",
        Password: "",
      });
    } else {
      setStoreManagerData({
        OracleID: "",
        StoreManagerName: "",
        BrandID: "",
        LocationID: "",
        CreateLogin: false,
        Email: "",
        Password: "",
      });
    }
    setFormError("");
  }, [editingStoreManager]);

  const handleChange = (e) => {
    setStoreManagerData({
      ...storeManagerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (storeManagerData.CreateLogin && !storeManagerData.Password) {
      setFormError("Please enter a password for the login account.");
      return;
    }

    try {
      await handleAddStoreManager(storeManagerData);

      setStoreManagerData({
        OracleID: "",
        StoreManagerName: "",
        BrandID: "",
        LocationID: "",
        CreateLogin: false,
        Email: "",
        Password: "",
      });
    } catch (error) {
      setFormError(error.message || "Something went wrong.");
    }
  };

  const brandOptions = brands.map((brand) => ({
    value: brand.brandid,
    label: brand.brandname,
  }));

  const locationOptions = locations.map((location) => ({
    value: location.locationid,
    label: location.locationname,
  }));

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="ag-error-banner">{formError}</div>}

      <div className="ag-form-grid">
        <div className="ag-field">
          <label htmlFor="StoreManagerName"><FiUser /> Store manager name</label>
          <input
            type="text"
            name="StoreManagerName"
            placeholder="e.g. Sayed Ali"
            onChange={handleChange}
            value={storeManagerData.StoreManagerName}
            required
          />
        </div>

        <div className="ag-field">
          <label htmlFor="OracleID"><FiHash /> Oracle ID</label>
          <input
            type="number"
            name="OracleID"
            placeholder="102553"
            onChange={handleChange}
            value={storeManagerData.OracleID}
            required
            readOnly={Boolean(editingStoreManager)}
          />
        </div>

        <div className="ag-field">
          <label htmlFor="BrandID"><FiTag /> Brand</label>
          <Select
            classNamePrefix="ag-rs"
            className="ag-select"
            options={brandOptions}
            placeholder="Search brand..."
            value={brandOptions.find((o) => o.value === storeManagerData.BrandID) || null}
            onChange={(o) => setStoreManagerData({ ...storeManagerData, BrandID: o ? o.value : "" })}
            isSearchable
          />
        </div>

        <div className="ag-field">
          <label htmlFor="LocationID"><FiMapPin /> Location</label>
          <Select
            classNamePrefix="ag-rs"
            className="ag-select"
            options={locationOptions}
            placeholder="Search location..."
            value={locationOptions.find((o) => o.value === storeManagerData.LocationID) || null}
            onChange={(o) => setStoreManagerData({ ...storeManagerData, LocationID: o ? o.value : "" })}
            isSearchable
          />
        </div>
      </div>

      {/* Login account section — only when creating a new manager */}
      {!editingStoreManager && (
        <div className="ag-login-section" style={{ marginTop: 18, paddingTop: 18, borderTop: "1px dashed #e5e7eb" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={storeManagerData.CreateLogin}
              onChange={(e) =>
                setStoreManagerData({ ...storeManagerData, CreateLogin: e.target.checked })
              }
            />
            <FiUserPlus />
            Create a system login account for this manager now
          </label>

          {storeManagerData.CreateLogin && (
            <div className="ag-form-grid" style={{ marginTop: 14 }}>
              <div className="ag-field">
                <label><FiMail /> Email</label>
                <input
                  type="email"
                  name="Email"
                  placeholder="name@apparelgroup.com"
                  onChange={handleChange}
                  value={storeManagerData.Email}
                />
              </div>

              <div className="ag-field">
                <label><FiLock /> Password</label>
                <input
                  type="password"
                  name="Password"
                  placeholder="Minimum 4 characters"
                  onChange={handleChange}
                  value={storeManagerData.Password}
                  required={storeManagerData.CreateLogin}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="ag-form-actions">
        <button type="submit" className="ag-btn ag-btn-primary">
          <FiSave />
          {editingStoreManager ? "Update store manager" : "Add store manager"}
        </button>
      </div>
    </form>
  );
};

export default StoreManagerForm;