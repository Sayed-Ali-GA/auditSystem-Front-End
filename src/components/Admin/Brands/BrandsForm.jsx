import { useState, useEffect } from "react";

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

      <p>
        <label htmlFor="BrandName">Enter Brand Name:</label>

        <input
          type="text"
          name="BrandName"
          value={brandData.BrandName}
          onChange={handleChange}
          required
          placeholder="e.g. R & B"
        />
      </p>

      <button type="submit">
        {editingBrand ? "Update Brand" : "Save Brand"}
      </button>

    </form>
  );
};

export default BrandForm;