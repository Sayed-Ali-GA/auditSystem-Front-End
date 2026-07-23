import { useState } from "react";
import Select from "react-select";




const StoreManagerForm = ({brands, locations, handleAddStoreManager}) => {
    const [storeManagerData, setStoreManagerData] = useState({
    OracleID: "",
    StoreManagerName: "",
    BrandID: "",
    LocationID: ""
});


    
    const handleChange = (exc) => {
        setStoreManagerData({
      ...storeManagerData,
      [exc.target.name]: exc.target.value
    });
  };


  const handleSubmit = async (exs) => {
    exs.preventDefault();

    await handleAddStoreManager(storeManagerData);
     console.log(storeManagerData);

    setStoreManagerData({
    OracleID: "",
    StoreManagerName: "",
    BrandID: "",
    LocationID: ""
});
  };


  
    const brandOptions = brands.map((brand) => ({
        value: brand.brandid,
        label: brand.brandname,
    }));


    const locationOptions = locations.map((location) => ({
        value: location.locationid,
        label: location.locationname,
    }));



    return(
        <>
            <form onSubmit={handleSubmit}>
                    <p>
                        <label htmlFor="StoreManagerName">Enter Ops Manager Name:</label>
                                <input 
                                        type="text" 
                                        name="StoreManagerName" 
                                        placeholder="e.g. Sayed Ali" 
                                        onChange={handleChange}
                                        value={storeManagerData.StoreManagerName}
                                        required
                                />
                    </p>


                    <p>
                        <label htmlFor="oracleid">Enter Oracle ID:</label>
                                <input 
                                    type="Number" 
                                    name="OracleID"
                                    placeholder="102553"
                                    onChange={handleChange}
                                    value={storeManagerData.OracleID}
                                    required
                                />
                    </p>



                    <div>
                        <label htmlFor="BrandID">Select Brand:</label>
                           <Select
                                options={brandOptions}
                                placeholder="Search Brand..."
                                value={brandOptions.find(
                                    (option) => option.value === storeManagerData.BrandID
                                )}
                                onChange={(selectedOption) =>
                                    setStoreManagerData({
                                    ...storeManagerData,
                                    BrandID: selectedOption ? selectedOption.value : ''
                                })
                            }
                                isSearchable
                            />
                    </div>



                    <div>
                        <label htmlFor="LocationID">Select Location:</label>
                           <Select
                                options={locationOptions}
                                placeholder="Search Location..."
                                value={locationOptions.find(
                                    (option) => option.value === storeManagerData.LocationID
                                )}
                                onChange={(selectedOption) =>
                                    setStoreManagerData({
                                    ...storeManagerData,
                                    LocationID: selectedOption ? selectedOption.value : ''
                                 })
                            }
                                isSearchable
                            />
                    </div>



                <p>
                    <button type="submit">
                        Add Store Manager
                    </button>
                </p>

            </form>
        </>
    )


}

export default StoreManagerForm;
