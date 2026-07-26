import { useState } from "react";
import Select from "react-select";


const StoreForm = ({ opsManagers, brands, locations, handleAddStore, storeManagers }) => {


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
        console.log(storeData);
        setStoreData({
            StoreCode: "",
            BrandID: null,
            LocationID: null,
            OpsManagerID: null,
            StoreManagerID: null
        });
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
        <>
            <form onSubmit={handleSubmit}>
                <p>
                    <label>Enter Store Code:</label>
                        <input
                            type="text"
                            name="StoreCode"
                            placeholder="BHA-LC-1045"
                            onChange={handleChange}
                            value={storeData.StoreCode}
                            required
                        />
                </p>


                <div>
                    <label>Select Brand:</label>
                    <Select
                        options={brandOptions}
                        placeholder="Search Brand..."
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

                <div>
                    <label>Select Location:</label>
                    <Select
                        options={locationOptions}
                        placeholder="Search Location..."
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


                <div>
                    <label>Select Ops Manager:</label>
                    <Select
                        options={opsManagerOptions}
                        placeholder="Search Ops Managers..."
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


                <div>
                    <label>Select Store Manager:</label>
                    <Select
                        options={storeManagerOptions}
                        placeholder="Search Store Managers..."
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

                <p>
                    <button type="submit">
                        Add Store
                    </button>
                </p>
            </form>
        </>
    );
};

export default StoreForm;