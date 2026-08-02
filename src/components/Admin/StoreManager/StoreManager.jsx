import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import storeManagerService from "../../../services/StoreManagerServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import StoreManagerForm from "./StoreManagerForm";



const StoreManagers = () => {
    const [storeManagers, setStoreManagers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingStoreManager, setEditingStoreManager] = useState(null);

    useEffect(() => {
        const getStoreManagers = async () => {
            try {
                const data = await storeManagerService.index();
                setStoreManagers(data);
            } catch (error) {
                console.log(error);
                setError("Cannot connect to server");
            } finally {
                setLoading(false);
            }
        };
        getStoreManagers();
    }, []);

    useEffect(() => {
        const getBrands = async () => {
            try {
                const data = await brandService.index();
                setBrands(data);
            } catch (error) {
                console.log("Brands Error:", error);
            }
        };
        getBrands();
    }, []);

    useEffect(() => {
        const getLocations = async () => {
            try {
                const data = await locationServices.index();
                setLocations(data);
            } catch (error) {
                console.log("Locations Error:", error);
            }
        };
        getLocations();
    }, []);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (error) {
        return (
            <div>
                <h2>{error}</h2>
                <p>Please Send Email for IT . <a href="mailto:example.com">Send</a></p>
            </div>
        );
    }

const handleAddStoreManager = async (storeManagerData) => {
    try {

        if (editingStoreManager) {

            const updatedStoreManager = await storeManagerService.update(
                editingStoreManager.storemanagerid,
                storeManagerData
            );


            setStoreManagers((prev) =>
                prev.map((storeManager) =>
                    storeManager.storemanagerid === editingStoreManager.storemanagerid
                        ? updatedStoreManager
                        : storeManager
                )
            );


            setEditingStoreManager(null);


            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Store Manager updated successfully."
            });


        } else {


            const newStoreManager = await storeManagerService.create(storeManagerData);


            setStoreManagers((prev) => [
                ...prev,
                newStoreManager
            ]);


            Swal.fire({
                icon: "success",
                title: "Added!",
                text: "Store Manager added successfully."
            });

        }


    } catch (error) {
        console.log(error);
    }
};

    const handleDeleteStoreManager = async (storemanagerid) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to undo this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return;

        try {
            await storeManagerService.remove(storemanagerid);

            setStoreManagers((prev) =>
                prev.filter(
                    (storeManager) =>
                        storeManager.storemanagerid !== storemanagerid
                )
            );

            Swal.fire({
                title: "Deleted!",
                text: "The Store Manager has been deleted.",
                icon: "success"
            });

        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Cannot delete this Store Manager.",
                icon: "error"
            });
        }
    };

    return (
        <>
           <h2>
                {editingStoreManager 
                    ? "Edit Store Manager" 
                    : "Add New Store Manager"
                }
            </h2>


            <StoreManagerForm
                brands={brands}
                locations={locations}
                handleAddStoreManager={handleAddStoreManager}
                editingStoreManager={editingStoreManager}
            />

            <h1>Store Managers</h1>

            <table>
                <thead>
                    <tr>
                        <th>Sl. No.</th>
                        <th>Name</th>
                        <th>Oracle ID</th>
                        <th>Brand</th>
                        <th>Location</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {storeManagers.map((storeManager) => (
                        <tr key={storeManager.storemanagerid}>
                            <td>{storeManager.storemanagerid}</td>
                            <td>{storeManager.storemanagername}</td>
                            <td>{storeManager.oracleid}</td>
                            <td>{storeManager.brandname}</td>
                            <td>{storeManager.locationname}</td>

                            <td>
                               <button onClick={() => setEditingStoreManager(storeManager)}>
                                    Edit
                                </button>
                            </td>

                            <td>
                                <button onClick={() => handleDeleteStoreManager(storeManager.storemanagerid)}>
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

export default StoreManagers;