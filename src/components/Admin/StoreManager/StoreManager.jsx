import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";



import storeManagerService from "../../../services/StoreManagerServices"
import brandService from "../../../services/BrandServices"
import locationServices from "../../../services/locationServices"


import StoreManagerForm from "./StoreManagerForm"



const StoreManagers = () => {
    const [storeManagers, setStoreManagers] = useState([])
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);


    useEffect(() => {
        const getStoreManagers = async () => {
            try {
                const data = await storeManagerService.index();
                    setStoreManagers(data);
            } catch (error) {
                console.log(error)
            }
              finally {
                    setLoading(false)
            }
        };
        getStoreManagers();
    }, []); 



    
        useEffect(() => {
            const getBrands = async () => {
            const data = await brandService.index();
                setBrands(data);
        };
        getBrands();
    }, []);


    useEffect(() => {
        const getLocations = async () => {
            const data = await locationServices.index();
                setLocations(data);
        };
            getLocations()
    }, []);




    if (loading) {
        return <h2>Loading...</h2>
    }

    // console.log("Store Managers: ", StoreManagers)

     const handleAddStoreManager = async (storeManagerData) => {
        try {
            const newStoreManager = await storeManagerService.create(storeManagerData);
              setStoreManagers([
               ...storeManagers,
                newStoreManager
            ]);
    
        } catch (error) {
            console.log(error)
        }
      }


    

      const handleDeleteStoreManager = async (storemanagerid) => {
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
                await storeManagerService.remove(storemanagerid);
            
                setStoreManagers((prev) =>
                  prev.filter((storeManagers) => storeManagers.storemanagerid !== storemanagerid)
                );
            
                Swal.fire({
                  title: "Deleted!",
                  text: `"The Store Manager has been deleted."`,
                  icon: "success",
                });
              } catch (error) {
                Swal.fire({
                  title: "Error!",
                  text: "This Store Manager is assigned to one or more.",
                  icon: "error",
                });
              }
            };


    return(
        <>

        <h2>Add New Stoer Manager</h2>
            <StoreManagerForm
                brands={brands}
                locations={locations}
                handleAddStoreManager={handleAddStoreManager}
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

                                <td> <Link to={`/StoreManagers/${storeManager.opsmanagerid}`}>Edit</Link> </td>


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
    )


 }

export default StoreManagers;



