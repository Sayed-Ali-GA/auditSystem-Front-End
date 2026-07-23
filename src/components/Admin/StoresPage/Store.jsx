import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import storeServices from "../../../services/StoreServices";
import OpsManagerServices from "../../../services/OpsManagerServices";

import StoreForm from "./StoreForm";


const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [opsManagers, setOpsManagers] = useState([]);


    // Get Stores
    useEffect(() => {
        const getStores = async () => {
            try {
                const data = await storeServices.index();
                setStores(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getStores();
    }, []);

    // Get Brands
    useEffect(() => {
        const getBrands = async () => {
            try {
                const data = await brandService.index();
                setBrands(data);
            } catch (error) {
                console.log(error);
            }
        };
        getBrands();
    }, []);


    // Get Locations
    useEffect(() => {
        const getLocations = async () => {
            try {
                const data = await locationServices.index();
                setLocations(data);
            } catch (error) {
                console.log(error);
            }
        };
        getLocations();
    }, []);



    // Get Ops Managers
    useEffect(() => {
        const getOpsManagers = async () => {
            try {
                const data = await OpsManagerServices.index();
                setOpsManagers(data);
            } catch (error) {
                console.log(error);
            }
        };
        getOpsManagers();
    }, []);


    if (loading) {
        return <h2>Loading...</h2>;
    }


    // Add Store
    const handleAddStore = async (storeData) => {
        try {
            const newStore = await storeServices.create(storeData);
            setStores([
                ...stores,
                newStore
            ]);
        } catch (error) {
            console.log(error);
        }
    };




    return (
        <>
            <h2>Add New Store</h2>
            <StoreForm
                brands={brands}
                locations={locations}
                opsManagers={opsManagers}
                handleAddStore={handleAddStore}
            />

            <h1>Stores</h1>
            <table>
                <thead>
                    <tr>
                        <th>Sl. No.</th>
                        <th>Store Code</th>
                        <th>Brand</th>
                        <th>Location</th>
                        <th>Ops Manager</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {stores.map((store) => (
                        <tr key={store.storeserial}>
                            <td>
                                {store.storeserial}
                            </td>

                            <td>
                                {store.storecode}
                            </td>

                            <td>
                                {store.brandname}
                            </td>

                            <td>
                                {store.locationname}
                            </td>

                            <td>
                                {store.opsmanagername}
                            </td>

                            <td>
                                <Link to={`/Stores/${store.storeserial}`}>
                                    Edit
                                </Link>
                            </td>

                            <td>
                                <Link to={`/Stores/${store.storeserial}/delete`}>
                                    Delete
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    );
};

export default Stores;