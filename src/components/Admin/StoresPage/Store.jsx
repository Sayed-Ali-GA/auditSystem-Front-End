import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";


import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import storeServices from "../../../services/StoreServices";
import OpsManagerServices from "../../../services/OpsManagerServices";
import storeManagerServices from '../../../services/StoreManagerServices'

import StoreForm from "./StoreForm";


const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [opsManagers, setOpsManagers] = useState([]);
    const [storeManagers, setStoreManagers] = useState([]);


    // Get Store Managers

        useEffect(() => {
            const getStoreManagers = async () => {
                try {
                        const data = await storeManagerServices.index();
                            setStoreManagers(data)
                } catch (error) {
                    console.log(error)
                }
            }
             getStoreManagers()
        }, []);



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


       const handleDeleteStore = async (storeserial) => {
                  const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to undo this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "Cancel",
                  });
                
                  if (!result.isConfirmed) return;
                
                  try {
                    await storeServices.remove(storeserial);
                
                    setStores((prev) =>
                      prev.filter((stores) => stores.storeserial !== storeserial)
                    );
                
                    Swal.fire({
                      title: "Deleted!",
                      text: `"The Store has been deleted."`,
                      icon: "success",
                    });
                  } catch (error) {
                    Swal.fire({
                      title: "Error!",
                      text: "Failed to delete the Store.",
                      icon: "error",
                    });
                  }
                };
    



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
                storeManagers={storeManagers}
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
                        <th>Store Manager</th>
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
                                {store.storemanagername}
                            </td>

                            <td>
                                <Link to={`/Stores/${store.storeserial}`}>
                                    Edit
                                </Link>
                            </td>

                <td>
                    <button onClick={() => handleDeleteStore(store.storeserial)}>
                       Delete
                    </button>
                </td>

                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    );
};

export default Stores;