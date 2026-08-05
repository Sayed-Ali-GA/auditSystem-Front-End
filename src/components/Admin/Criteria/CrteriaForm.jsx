import { useState, useEffect } from "react";
import { FiCheckSquare, FiSave } from "react-icons/fi";

const CrteriaForm = ({ handleAddCriteria, editingCriteria }) => {

    const [crteriaData, setCrteriaData] = useState({
        majorcriterianame: ""
    });


    useEffect(() => {

        if (editingCriteria) {

            setCrteriaData({
                majorcriterianame: editingCriteria.majorcriterianame
            });

        } else {

            setCrteriaData({
                majorcriterianame: ""
            });

        }

    }, [editingCriteria]);



    const handleChange = (e) => {

        setCrteriaData({
            ...crteriaData,
            [e.target.name]: e.target.value
        });

    };



    const handleSubmit = async (e) => {

        e.preventDefault();

        await handleAddCriteria(crteriaData);

        setCrteriaData({
            majorcriterianame: ""
        });

    };



    return (
        <form onSubmit={handleSubmit}>

            <div className="ag-form-grid">
                <div className="ag-field">
                    <label htmlFor="majorcriterianame">
                        <FiCheckSquare /> Criteria name
                    </label>

                    <input
                        type="text"
                        id="majorcriterianame"
                        name="majorcriterianame"
                        value={crteriaData.majorcriterianame}
                        onChange={handleChange}
                        placeholder="e.g. Store Closing"
                        required
                    />
                </div>
            </div>

            <div className="ag-form-actions">
                <button type="submit" className="ag-btn ag-btn-primary">
                    <FiSave />
                    {editingCriteria ? "Update criteria" : "Save criteria"}
                </button>
            </div>

        </form>
    );
};

export default CrteriaForm;