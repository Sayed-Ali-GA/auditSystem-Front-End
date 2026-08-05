import { useEffect, useState } from "react";
import Select from "react-select";
import { FiCheckSquare, FiList, FiMessageSquare, FiPercent, FiAlertTriangle, FiSave } from "react-icons/fi";

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

            <div className="ag-form-grid">

                <div className="ag-field">
                    <label><FiCheckSquare /> Major criteria</label>

                    <Select
                        classNamePrefix="ag-rs"
                        className="ag-select"
                        options={criteriaOptions}
                        placeholder="Select major criteria"
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

                <div className="ag-field">
                    <label><FiList /> Sub point criteria</label>

                    <input
                        type="text"
                        name="subPointCriteria"
                        value={auditPointData.subPointCriteria}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="ag-field ag-field-wide">
                    <label><FiMessageSquare /> Audit comment</label>

                    <textarea
                        name="auditComment"
                        value={auditPointData.auditComment}
                        onChange={handleChange}
                        placeholder="Write..."
                        rows='5'
                        required
                    />
                </div>

                <div className="ag-field">
                    <label><FiPercent /> Weightage</label>

                    <input
                        type="number"
                        step="0.01"
                        name="weightage"
                        value={auditPointData.weightage}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="ag-field">
                    <label><FiAlertTriangle /> Risk matrix</label>

                    <Select
                        classNamePrefix="ag-rs"
                        className="ag-select"
                        options={riskOptions}
                        placeholder="Select risk level"
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

            </div>

            <div className="ag-form-actions">
                <button type="submit" className="ag-btn ag-btn-primary">
                    <FiSave />
                    {editingAuditPoint ? "Update audit point" : "Save audit point"}
                </button>
            </div>

        </form>
    );
};

export default AuditPointForm;