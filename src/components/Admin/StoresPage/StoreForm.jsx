import { useState, useEffect } from "react";
import Select from "react-select";
import {
  FiHash,
  FiTag,
  FiMapPin,
  FiUserCheck,
  FiUser,
  FiMail,
  FiSave,
  FiKey,
} from "react-icons/fi";

const emptyStoreData = {
  StoreCode: "",
  Email: "",
  BrandID: null,
  LocationID: null,
  OpsManagerID: null,
  StoreManagerID: null,
  LoginPassword: "",
};

const StoreForm = ({
  opsManagers,
  brands,
  locations,
  handleAddStore,
  storeManagers,
  editingStore,
}) => {
  const [storeData, setStoreData] = useState(emptyStoreData);

  useEffect(() => {
    if (editingStore) {
      setStoreData({
        StoreCode: editingStore.storecode ?? "",
        Email: editingStore.email ?? "",
        BrandID: editingStore.brandid ?? null,
        LocationID: editingStore.locationid ?? null,
        OpsManagerID: editingStore.opsmanagerid ?? null,
        StoreManagerID: editingStore.storemanagerid ?? null,

        // مهم:
        // لا نسترجع الباسورد القديم من الـ backend
        LoginPassword: "",
      });
    } else {
      setStoreData({ ...emptyStoreData });
    }
  }, [editingStore]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!storeData.StoreCode.trim()) {
      return;
    }

    if (!storeData.BrandID) {
      return;
    }

    if (!storeData.LocationID) {
      return;
    }

    if (!storeData.OpsManagerID) {
      return;
    }

    if (!storeData.StoreManagerID) {
      return;
    }

    const payload = {
      StoreCode: storeData.StoreCode.trim(),
      Email: storeData.Email.trim(),
      BrandID: storeData.BrandID,
      LocationID: storeData.LocationID,
      OpsManagerID: storeData.OpsManagerID,
      StoreManagerID: storeData.StoreManagerID,
    };

    // فقط إذا المستخدم كتب باسورد جديد نرسله
    if (storeData.LoginPassword.trim()) {
      payload.LoginPassword = storeData.LoginPassword;
    }

    await handleAddStore(payload);

    // بعد الإضافة فقط نفرغ الفورم
    if (!editingStore) {
      setStoreData({ ...emptyStoreData });
    }
  };

  const filteredStoreManagers = storeManagers.filter((storeManager) => {
    const matchBrand =
      !storeData.BrandID ||
      storeManager.brandid === storeData.BrandID;

    const matchLocation =
      !storeData.LocationID ||
      storeManager.locationid === storeData.LocationID;

    return matchBrand && matchLocation;
  });

  const brandOptions = brands.map((brand) => ({
    value: brand.brandid,
    label: brand.brandname,
  }));

  const locationOptions = locations.map((location) => ({
    value: location.locationid,
    label: location.locationname,
  }));

  const opsManagerOptions = opsManagers.map((opsManager) => ({
    value: opsManager.opsmanagerid,
    label: opsManager.opsmanagername,
  }));

  const storeManagerOptions = filteredStoreManagers.map((storeManager) => ({
    value: storeManager.storemanagerid,
    label: storeManager.storemanagername,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="ag-form-grid">

        {/* Store Code */}
        <div className="ag-field">
          <label>
            <FiHash /> Store code
          </label>

          <input
            type="text"
            name="StoreCode"
            placeholder="BHA-LC-1045"
            onChange={handleChange}
            value={storeData.StoreCode}
            required
          />
        </div>

        {/* Store Email */}
        <div className="ag-field">
          <label>
            <FiMail /> Store email
          </label>

          <input
            type="email"
            name="Email"
            placeholder="store@apparelgroup.com"
            onChange={handleChange}
            value={storeData.Email}
          />
        </div>

        {/* Brand */}
        <div className="ag-field">
          <label>
            <FiTag /> Brand
          </label>

          <Select
            classNamePrefix="ag-rs"
            className="ag-select"
            options={brandOptions}
            placeholder="Search brand..."
            value={
              brandOptions.find(
                (option) => option.value === storeData.BrandID
              ) || null
            }
            onChange={(selectedOption) =>
              setStoreData((prev) => ({
                ...prev,
                BrandID: selectedOption
                  ? selectedOption.value
                  : null,
                StoreManagerID: null,
              }))
            }
            isSearchable
          />
        </div>

        {/* Location */}
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
                (option) => option.value === storeData.LocationID
              ) || null
            }
            onChange={(selectedOption) =>
              setStoreData((prev) => ({
                ...prev,
                LocationID: selectedOption
                  ? selectedOption.value
                  : null,
              }))
            }
            isSearchable
          />
        </div>

        {/* Ops Manager */}
        <div className="ag-field">
          <label>
            <FiUserCheck /> Ops manager
          </label>

          <Select
            classNamePrefix="ag-rs"
            className="ag-select"
            options={opsManagerOptions}
            placeholder="Search ops managers..."
            value={
              opsManagerOptions.find(
                (option) =>
                  option.value === storeData.OpsManagerID
              ) || null
            }
            onChange={(selectedOption) =>
              setStoreData((prev) => ({
                ...prev,
                OpsManagerID: selectedOption
                  ? selectedOption.value
                  : null,
              }))
            }
            isSearchable
          />
        </div>

        {/* Store Manager */}
        <div className="ag-field">
          <label>
            <FiUser /> Store manager
          </label>

          <Select
            classNamePrefix="ag-rs"
            className="ag-select"
            options={storeManagerOptions}
            placeholder="Search store managers..."
            value={
              storeManagerOptions.find(
                (option) =>
                  option.value === storeData.StoreManagerID
              ) || null
            }
            onChange={(selectedOption) =>
              setStoreData((prev) => ({
                ...prev,
                StoreManagerID: selectedOption
                  ? selectedOption.value
                  : null,
              }))
            }
            isSearchable
          />
        </div>
      </div>

      {/* Password */}
      <div
        className="ag-field"
        style={{ marginTop: 8 }}
      >
        <label>
          <FiKey />{" "}
          {editingStore
            ? "Store login password (leave blank to keep unchanged)"
            : "Store login password (optional)"}
        </label>

        <input
          type="password"
          name="LoginPassword"
          placeholder={
            editingStore
              ? "Enter new password only if you want to change it"
              : "Set now, or skip and set later"
          }
          onChange={handleChange}
          value={storeData.LoginPassword}
          autoComplete="new-password"
        />
      </div>

      {/* Actions */}
      <div className="ag-form-actions">
        <button
          type="submit"
          className="ag-btn ag-btn-primary"
        >
          <FiSave />

          {editingStore
            ? "Update store"
            : "Add store"}
        </button>
      </div>
    </form>
  );
};

export default StoreForm;