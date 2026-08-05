import { useState, useEffect } from "react";
import { FiUserCheck, FiHash, FiSave } from "react-icons/fi";


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

            <div className="ag-form-grid">

                <div className="ag-field">
                    <label><FiUserCheck /> Ops manager name</label>

                    <input
                        type="text"
                        name="OpsManagerName"
                        placeholder="e.g. Sayed Ali"
                        value={opsManagerData.OpsManagerName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="ag-field">
                    <label><FiHash /> Oracle ID</label>

                    <input
                        type="number"
                        name="OracleID"
                        placeholder="102553"
                        value={opsManagerData.OracleID}
                        onChange={handleChange}
                        required
                    />
                </div>

            </div>

            <div className="ag-form-actions">
                <button type="submit" className="ag-btn ag-btn-primary">
                    <FiSave />
                    {editingOpsManager ? "Update ops manager" : "Save ops manager"}
                </button>
            </div>

        </form>

    );

};


export default OpsManagerForm;