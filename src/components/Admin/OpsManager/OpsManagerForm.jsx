import { useState, useEffect } from "react";


const OpsManagerForm = ({ handleAddOpsManager, editingOpsManager }) => {

    const [opsManagerData, setOpsManagerData] = useState({
        OracleID: "",
        OpsManagerName: ""
    });



    useEffect(() => {

        if (editingOpsManager) {

            setOpsManagerData({
                OracleID: editingOpsManager.oracleid,
                OpsManagerName: editingOpsManager.opsmanagername
            });

        } else {

            setOpsManagerData({
                OracleID: "",
                OpsManagerName: ""
            });

        }

    }, [editingOpsManager]);



    const handleChange = (e) => {

        setOpsManagerData({
            ...opsManagerData,
            [e.target.name]: e.target.value
        });

    };



    const handleSubmit = async (e) => {

        e.preventDefault();

        await handleAddOpsManager(opsManagerData);


        setOpsManagerData({
            OracleID: "",
            OpsManagerName: ""
        });

    };



    return (

        <form onSubmit={handleSubmit}>


            <p>
                <label>
                    Enter Ops Manager Name:
                </label>

                <input
                    type="text"
                    name="OpsManagerName"
                    placeholder="e.g. Sayed Ali"
                    value={opsManagerData.OpsManagerName}
                    onChange={handleChange}
                    required
                />

            </p>



            <p>
                <label>
                    Enter Oracle ID:
                </label>

                <input
                    type="number"
                    name="OracleID"
                    placeholder="102553"
                    value={opsManagerData.OracleID}
                    onChange={handleChange}
                    required
                />

            </p>



            <button type="submit">
                {editingOpsManager ? "Update Ops Manager" : "Save Ops Manager"}
            </button>


        </form>

    );

};


export default OpsManagerForm;