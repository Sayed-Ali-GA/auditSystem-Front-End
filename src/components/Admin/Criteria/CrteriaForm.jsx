import { useState, useEffect } from "react";

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

            <p>
                <label htmlFor="majorcriterianame">
                    Enter Criteria:
                </label>

                <input
                    type="text"
                    name="majorcriterianame"
                    value={crteriaData.majorcriterianame}
                    onChange={handleChange}
                    placeholder="e.g. Store Closing"
                    required
                />
            </p>


            <button type="submit">
                {editingCriteria ? "Update Criteria" : "Save Criteria"}
            </button>

        </form>
    );
};

export default CrteriaForm;