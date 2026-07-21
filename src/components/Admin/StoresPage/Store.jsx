import { useEffect, useState } from "react";
import { Link } from "react-router-dom";




import storeServices from "../../../services/StoreServices"


const Stores = () => {
    const [Stores, setStores] = useState([])
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const getStores = async () => {
            try {
                const data = await storeServices.index();
                    setStores(data);
                
            } catch (error) {
                console.log(err)
            }
             finally {
                setLoading(false);
            }

        };
         getStores();
    }, []);


    if (loading) {
        return <h2>Loading...</h2>
    }


    console.log("Stores: ", Stores)

    return (
        <>
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
                        {Stores.map((store) => (
                            <tr key={store.storeserial}>

                                <th>{store.storeserial}</th>
                                <th>{store.storecode}</th>
                                <th>{store.brandname}</th>
                                <th>{store.locationname}</th>
                                <th>{store.opsmanagername}</th>
                             
                                <td> <Link to={`/Stores/${store.storeserial}`}>Edit</Link> </td>
                                <td><Link to={`/Stores/${store.storeserial}/delete`}>Delete</Link></td>

                            </tr>
                        ))}
                </tbody>

            </table>
        </>
    )

}



export default Stores;