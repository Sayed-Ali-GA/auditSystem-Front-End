import { useState, useEffect } from "react";


const LocationForm = ({ handleAddLocation, editingLocation }) => {

    const [locationData, setLocationData] = useState({
        LocationName: ""
    });



    useEffect(() => {

        if (editingLocation) {

            setLocationData({
                LocationName: editingLocation.locationname
            });

        } else {

            setLocationData({
                LocationName: ""
            });

        }

    }, [editingLocation]);




    const handleChange = (e) => {

        setLocationData({
            ...locationData,
            [e.target.name]: e.target.value
        });

    };




    const handleSubmit = async (e) => {

        e.preventDefault();


        await handleAddLocation(locationData);


        setLocationData({
            LocationName: ""
        });

    };




    return (

        <form onSubmit={handleSubmit}>

            <p>

                <label>
                    Enter Location Name:
                </label>


                <input
                    type="text"
                    name="LocationName"
                    value={locationData.LocationName}
                    onChange={handleChange}
                    placeholder="e.g. Manama"
                    required
                />

            </p>



            <button type="submit">
                {editingLocation ? "Update Location" : "Save Location"}
            </button>


        </form>

    );

};


export default LocationForm;