import { useState } from "react";


const LocationForm = ({handleAddLocation}) => {
    const [locationData, setLocationData]  = useState({
        LocationName: ''
    });


    
      const handleChange = (exc) => {
    setLocationData({
      ...locationData,
      [exc.target.name]: exc.target.value
    });
  };


  const handleSubmit = async (exs) => {
    exs.preventDefault();

    await handleAddLocation(locationData);

    setLocationData({
      LocationName : ""
    });
  };


    return(
        <>
            <form onSubmit={handleSubmit}>
                    <p>
                        <label htmlFor="location">Enter Location Name:</label>
                                <input 
                                        type="text" 
                                        name="LocationName" 
                                        placeholder="e.g. Manama" 
                                        onChange={handleChange}
                                        value={locationData.LocationName}
                                        required
                                />
                    </p>

                    <button type="submit">
                        Add Location
                    </button>
            </form>
        </>
    )


}

export default LocationForm;
