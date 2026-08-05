import { useState, useEffect } from "react";
import { FiTag, FiSave } from "react-icons/fi";

const BrandForm = ({ handleAddBrand, editingBrand }) => {

  const [brandData, setBrandData] = useState({
    BrandName: ""
  });

  useEffect(() => {
    if (editingBrand) {
      setBrandData({
        BrandName: editingBrand.brandname
      });
    } else {
      setBrandData({
        BrandName: ""
      });
    }
  }, [editingBrand]);

  const handleChange = (e) => {
    setBrandData({
      ...brandData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleAddBrand(brandData);

    setBrandData({
      BrandName: ""
    });
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="ag-form-grid">
        <div className="ag-field">
          <label htmlFor="BrandName"><FiTag /> Brand name</label>
          <input
            type="text"
            id="BrandName"
            name="BrandName"
            value={brandData.BrandName}
            onChange={handleChange}
            required
            placeholder="e.g. R & B"
          />
        </div>
      </div>

      <div className="ag-form-actions">
        <button type="submit" className="ag-btn ag-btn-primary">
          <FiSave />
          {editingBrand ? "Update brand" : "Save brand"}
        </button>
      </div>

    </form>
  );
};

export default BrandForm;