import { useEffect, useState } from "react";
import Select from "react-select";

import criteriaService from "../../../services/CriteriaServices";

const AuditPointForm = ({ handleAddAuditPoint, criteria, editingAuditPoint  }) => {
    const [criterias, setCriterias] = useState([]);

    const [auditPointData, setAuditPointData] = useState({
        MajorCriteriaID: "",
        auditComment: "",
        subPointCriteria: "",
        weightage: "",
        riskMatrix: ""
    });

    useEffect(() => {
        const getCriteria = async () => {
            try {
                const data = await criteriaService.index();
                setCriterias(data);
            } catch (error) {
                console.log(error);
            }
        };

        getCriteria();
    }, []);

    const handleChange = (e) => {
        setAuditPointData({
            ...auditPointData,
            [e.target.name]: e.target.value,
        });
    };



    useEffect(() => {
    if (editingAuditPoint) {
        setAuditPointData({
            MajorCriteriaID: editingAuditPoint.majorcriteriaid,
            auditComment: editingAuditPoint.auditcomment,
            subPointCriteria: editingAuditPoint.subpointcriteria,
            weightage: editingAuditPoint.weightage,
            riskMatrix: editingAuditPoint.riskmatrix
        });
    } else {
        setAuditPointData({
            MajorCriteriaID: "",
            auditComment: "",
            subPointCriteria: "",
            weightage: "",
            riskMatrix: ""
        });
    }

}, [editingAuditPoint]);




    const handleSubmit = async (e) => {
        e.preventDefault();

        await handleAddAuditPoint(auditPointData);

        setAuditPointData({
            MajorCriteriaID: "",
            auditComment: "",
            subPointCriteria: "",
            weightage: "",
            riskMatrix: "",
        });
    };

    const criteriaOptions = criterias.map((criteria) => ({
        value: criteria.majorcriteriaid,
        label: criteria.majorcriterianame,
    }));

    const riskOptions = [
        { value: "Low", label: "Low" },
        { value: "Moderate", label: "Moderate" },
        { value: "High", label: "High" },
    ];

    return (
        <form onSubmit={handleSubmit}>

            <div>
                <label>Major Criteria</label>

                <Select
                    options={criteriaOptions}
                    placeholder="Select Major Criteria"
                    value={
                        criteriaOptions.find(
                        (option) => option.value === auditPointData.MajorCriteriaID) || null
                    }
                    onChange={(selectedOption) =>
                        setAuditPointData({
                            ...auditPointData,
                            MajorCriteriaID: selectedOption.value,
                        })
                    }
                />
            </div>

            <br />

            <div>
                <label>Sub Point Criteria</label>

                <input
                    type="text"
                    name="subPointCriteria"
                    value={auditPointData.subPointCriteria}
                    onChange={handleChange}
                    required
                />
            </div>

            <br />

            <p>
                <label>Audit Comment:</label>

                <textarea
                    name="auditComment"
                    value={auditPointData.auditComment}
                    onChange={handleChange}
                    placeholder="Write..."
                    rows='6'
                    cols='25'
                    required
                />
            </p>

            <br />

            <div>
                <label>Weightage</label>

                <input
                    type="number"
                    step="0.01"
                    name="weightage"
                    value={auditPointData.weightage}
                    onChange={handleChange}
                    required
                />
            </div>

            <br />

            <div>
                <label>Risk Matrix</label>

                <Select
                    options={riskOptions}
                    placeholder="Select Risk Level"
                    value={
                        riskOptions.find(
                            (option) =>
                                option.value === auditPointData.riskMatrix
                        ) || null
                    }
                    onChange={(selectedOption) =>
                        setAuditPointData({
                            ...auditPointData,
                            riskMatrix: selectedOption.value,
                        })
                    }
                />
            </div>

            <br />


            <button type="submit">
                {editingAuditPoint ? "Update Audit Point" : "Save Audit Point"}
            </button>

        </form>
    );
};

export default AuditPointForm;