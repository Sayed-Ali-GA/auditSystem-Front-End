import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import locationService from "../../../services/locationServices";



const Location = () => {

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await locationService.index();
        setLocations(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getLocations();

  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  // console.log(locations);

  return (
        <>

      <h1>Location</h1>

    <table>
        <thead>
            <tr>
                <th>Sl. No.</th>
                <th>Location</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        </thead>

        <tbody>
            {locations.map((location) => (
                <tr key={location.locationid}>
                  <td>{location.locationid}</td>
                    <td>{location.locationname}</td>
                    <td> <Link to={`/location/${location.locationid}`}>Edit</Link> </td>
                    <td><Link to={`/location/${location.locationid}/delete`}>Delete</Link></td>
                </tr>
             ))}
        </tbody>
    </table>

    </>
  );
};



export default Location;
