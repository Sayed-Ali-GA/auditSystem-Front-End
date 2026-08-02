import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import locationService from "../../../services/locationServices";
import LocationForm from "./LocationForm";


const Location = () => {

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState(null);

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


  const handleAddLocation = async (locationData) => {
  try {

    if (editingLocation) {

      const updatedLocation = await locationService.update(
        editingLocation.locationid,
        locationData
      );


      setLocations((prev) =>
        prev.map((location) =>
          location.locationid === editingLocation.locationid
            ? updatedLocation
            : location
        )
      );


      setEditingLocation(null);


      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Location updated successfully.",
      });


    } else {

      const newLocation = await locationService.create(locationData);


      setLocations((prev) => [
        ...prev,
        newLocation
      ]);


      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Location added successfully.",
      });

    }


  } catch (error) {
    console.log(error);
  }
};



  const handleDeleteLocation = async (locationid) => {
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
        await locationService.remove(locationid);
    
        setLocations((prev) =>
          prev.filter((locations) => locations.locationid !== locationid)
        );
    
        Swal.fire({
          title: "Deleted!",
          text: `"The Location has been deleted."`,
          icon: "success",
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "This location is assigned to one or more.",
          icon: "error",
        });
      }
    };
  





  return (
        <>

          <h2>
            {editingLocation ? "Edit Location" : "Add New Location"}
          </h2>

          <LocationForm
              handleAddLocation={handleAddLocation}
              editingLocation={editingLocation}
          />


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


                    <button onClick={() => setEditingLocation(location)}>
                        Edit
                    </button>

                  <td>
                    <button onClick={() => handleDeleteLocation(location.locationid)}>
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



export default Location;
