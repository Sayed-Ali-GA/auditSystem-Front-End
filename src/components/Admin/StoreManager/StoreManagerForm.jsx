import { useState, useEffect } from "react";
import Select from "react-select";
import { FiUser, FiHash, FiTag, FiMapPin, FiSave } from "react-icons/fi";




const StoreManagerForm = ({brands, locations, handleAddStoreManager, editingStoreManager}) => {
    const [storeManagerData, setStoreManagerData] = useState({
    OracleID: "",
    StoreManagerName: "",
    BrandID: "",
    LocationID: ""
});



    useEffect(() => {

        if(editingStoreManager){

            setStoreManagerData({
                OracleID: editingStoreManager.oracleid,
                StoreManagerName: editingStoreManager.storemanagername,
                BrandID: editingStoreManager.brandid,
                LocationID: editingStoreManager.locationid
            });

        } else {

            setStoreManagerData({
                OracleID:"",
                StoreManagerName:"",
                BrandID:"",
                LocationID:""
            });

        }

    },[editingStoreManager]);



    const handleChange = (exc) => {
        setStoreManagerData({
      ...storeManagerData,
      [exc.target.name]: exc.target.value
    });
  };


  const handleSubmit = async (exs) => {
    exs.preventDefault();

    await handleAddStoreManager(storeManagerData);

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
        <form onSubmit={handleSubmit}>

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
                    <label htmlFor="oracleid"><FiHash /> Oracle ID</label>
                    <input
                        type="number"
                        name="OracleID"
                        placeholder="102553"
                        onChange={handleChange}
                        value={storeManagerData.OracleID}
                        required
                    />
                </div>

                <div className="ag-field">
                    <label htmlFor="BrandID"><FiTag /> Brand</label>
                    <Select
                        classNamePrefix="ag-rs"
                        className="ag-select"
                        options={brandOptions}
                        placeholder="Search brand..."
                        value={brandOptions.find(
                            (option) => option.value === storeManagerData.BrandID
                        ) || null}
                        onChange={(selectedOption) =>
                            setStoreManagerData({
                            ...storeManagerData,
                            BrandID: selectedOption ? selectedOption.value : ''
                        })
                    }
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
                        value={locationOptions.find(
                            (option) => option.value === storeManagerData.LocationID
                        ) || null}
                        onChange={(selectedOption) =>
                            setStoreManagerData({
                            ...storeManagerData,
                            LocationID: selectedOption ? selectedOption.value : ''
                         })
                    }
                        isSearchable
                    />
                </div>

            </div>

            <div className="ag-form-actions">
               <button type="submit" className="ag-btn ag-btn-primary">
                    <FiSave />
                    {editingStoreManager
                        ? "Update store manager"
                        : "Add store manager"
                    }
                </button>
            </div>

        </form>
    )


}

export default StoreManagerForm;