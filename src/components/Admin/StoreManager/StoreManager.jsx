import { useEffect, useState } from "react";
import { Link } from "react-router-dom";



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
                                <td><Link to={`/StoreManagers/${storeManager.opsmanagerid}/delete`}>Delete</Link></td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </>
    )


 }

export default StoreManagers;



