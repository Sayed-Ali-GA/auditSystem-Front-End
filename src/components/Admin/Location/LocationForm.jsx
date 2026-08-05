import { useState, useEffect } from "react";
import { FiMapPin, FiSave } from "react-icons/fi";


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

            <div className="ag-form-grid">
                <div className="ag-field">
                    <label><FiMapPin /> Location name</label>

                    <input
                        type="text"
                        name="LocationName"
                        value={locationData.LocationName}
                        onChange={handleChange}
                        placeholder="e.g. Manama"
                        required
                    />
                </div>
            </div>

            <div className="ag-form-actions">
                <button type="submit" className="ag-btn ag-btn-primary">
                    <FiSave />
                    {editingLocation ? "Update location" : "Save location"}
                </button>
            </div>

        </form>

    );

};


export default LocationForm;