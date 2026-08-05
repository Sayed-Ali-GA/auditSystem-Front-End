import { useState, useEffect } from "react";
import Select from "react-select";
import { FiHash, FiTag, FiMapPin, FiUserCheck, FiUser, FiSave } from "react-icons/fi";


const StoreForm = ({ opsManagers, brands, locations, handleAddStore, storeManagers, editingStore }) => {


    useEffect(() => {

    if(editingStore){

        setStoreData({
            StoreCode: editingStore.storecode,
            BrandID: editingStore.brandid,
            LocationID: editingStore.locationid,
            OpsManagerID: editingStore.opsmanagerid,
            StoreManagerID: editingStore.storemanagerid
        });

    } else {

        setStoreData({
            StoreCode: "",
            BrandID: null,
            LocationID: null,
            OpsManagerID: null,
            StoreManagerID: null
        });

    }

},[editingStore]);



    const [storeData, setStoreData] = useState({
        StoreCode: "",
        BrandID: null,
        LocationID: null,
        OpsManagerID: null,
        StoreManagerID: null
    });


    const handleChange = (e) => {

        setStoreData({
            ...storeData,
            [e.target.name]: e.target.value
        });

    };



        const handleSubmit = async (e) => {
            e.preventDefault();

            await handleAddStore(storeData);

            if(!editingStore){

                setStoreData({
                    StoreCode: "",
                    BrandID: null,
                    LocationID: null,
                    OpsManagerID: null,
                    StoreManagerID: null
                });

            }
        };


    const filteredStoreManagers = storeManagers.filter((storeManager) => {
    const matchBrand =
        !storeData.BrandID || storeManager.brandid === storeData.BrandID;

    const matchLocation =
        !storeData.LocationID || storeManager.locationid === storeData.LocationID;

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

                <div className="ag-field">
                    <label><FiHash /> Store code</label>
                        <input
                            type="text"
                            name="StoreCode"
                            placeholder="BHA-LC-1045"
                            onChange={handleChange}
                            value={storeData.StoreCode}
                            required
                        />
                </div>


                <div className="ag-field">
                    <label><FiTag /> Brand</label>
                    <Select
                        classNamePrefix="ag-rs"
                        className="ag-select"
                        options={brandOptions}
                        placeholder="Search brand..."
                        value={
                            brandOptions.find(
                                (option) =>
                                    option.value === storeData.BrandID
                            ) || null
                        }
                        onChange={(selectedOption) =>
                            setStoreData({
                                ...storeData,
                                BrandID: selectedOption ? selectedOption.value: null,
                                 StoreManagerID: null,
                            })
                        }
                        isSearchable
                    />
                </div>

                <div className="ag-field">
                    <label><FiMapPin /> Location</label>
                    <Select
                        classNamePrefix="ag-rs"
                        className="ag-select"
                        options={locationOptions}
                        placeholder="Search location..."
                        value={
                            locationOptions.find(
                                (option) =>
                                    option.value === storeData.LocationID
                            ) || null
                        }
                        onChange={(selectedOption) =>
                            setStoreData({
                                ...storeData,
                                LocationID: selectedOption
                                    ? selectedOption.value
                                    : null

                            })
                        }
                        isSearchable
                    />
                </div>


                <div className="ag-field">
                    <label><FiUserCheck /> Ops manager</label>
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
                            setStoreData({
                                ...storeData,
                                OpsManagerID: selectedOption
                                    ? selectedOption.value
                                    : null
                            })
                        }
                        isSearchable
                    />
                </div>


                <div className="ag-field">
                    <label><FiUser /> Store manager</label>
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
                            setStoreData({
                                ...storeData,
                                StoreManagerID: selectedOption
                                    ? selectedOption.value
                                    : null
                            })
                        }
                        isSearchable
                    />
                </div>

            </div>

            <div className="ag-form-actions">
                <button type="submit" className="ag-btn ag-btn-primary">
                    <FiSave />
                    {editingStore ? "Update store" : "Add store"}
                </button>
            </div>
        </form>
    );
};

export default StoreForm;