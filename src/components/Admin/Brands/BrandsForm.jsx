import { useState } from "react";


const BrandForm = ({ handleAddBrand }) => {

  const [brandData, setBrandData] = useState({
    BrandName: ""
  });


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
            <label htmlFor="Brand">Enter Brand Name:</label>
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
        Save Brand
      </button>

    </form>
  );
};


export default BrandForm;