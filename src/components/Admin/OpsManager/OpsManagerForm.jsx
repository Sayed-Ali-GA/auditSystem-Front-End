import { useState } from "react";


const OpsManagerForm = ({handleAddOpsManager}) => {
    const [opsManagerData, setOpsManagerData]  = useState({
        OracleID: '',
        OpsManagerName: ''
    });


    
      const handleChange = (exc) => {
    setOpsManagerData({
      ...opsManagerData,
      [exc.target.name]: exc.target.value
    });
  };


  const handleSubmit = async (exs) => {
    exs.preventDefault();

    await handleAddOpsManager(opsManagerData);

    setOpsManagerData({
        OracleID: '',
        OpsManagerName: ''
    });
  };


    return(
        <>
            <form onSubmit={handleSubmit}>
                    <p>
                        <label htmlFor="OpsManagerName">Enter Ops Manager Name:</label>
                                <input 
                                        type="text" 
                                        name="OpsManagerName" 
                                        placeholder="e.g. Sayed Ali" 
                                        onChange={handleChange}
                                        value={opsManagerData.OpsManagerName}
                                        required
                                />
                    </p>


                    <p>
                        <label htmlFor="OracleID">Enter Oracle ID:</label>
                                <input 
                                    type="Number" 
                                    name="OracleID"
                                    placeholder="102553"
                                    onChange={handleChange}
                                    value={opsManagerData.OracleID}
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

export default OpsManagerForm;
