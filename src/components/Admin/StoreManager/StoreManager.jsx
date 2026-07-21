import { useEffect, useState } from "react";
import { Link } from "react-router-dom";



import storeManagerService from "../../../services/StoreManagerServices"




const StoreManafers = () => {
    const [StoreManagers, setStoreManagers] = useState([])
    const [loading, setLoading] = useState(true);


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


    if (loading) {
        return <h2>Loading...</h2>
    }

    console.log("Store Managers: ", StoreManagers)


    return(
        <>
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
                        {StoreManagers.map((storeManager) => (
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

export default StoreManafers;



