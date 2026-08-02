import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";


import auditPointServices from "../../../services/AuditPointsServices";
import AuditPointForm from "./AuditPointForm";

const AuditPoint = () => {
    const [auditPoints, setAuditPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAuditPoint, setEditingAuditPoint] = useState(null);


    useEffect(() => {
        const getAuditPoint = async () => {
            try {
                const data = await auditPointServices.index();
                setAuditPoints(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        getAuditPoint();
    }, []);

const handleAddAuditPoint = async (auditPointData) => {
    try {

        if (editingAuditPoint) {

            const updatedAuditPoint = await auditPointServices.update(
                editingAuditPoint.auditpointid,
                auditPointData
            );

            setAuditPoints((prev) =>
                prev.map((point) =>
                    point.auditpointid === editingAuditPoint.auditpointid
                        ? updatedAuditPoint
                        : point
                )
            );

            setEditingAuditPoint(null);


            Swal.fire({
                title: "Updated!",
                text: "The Audit Point has been updated successfully.",
                icon: "success",
                confirmButtonText: "OK"
            });


        } else {

            const createdAuditPoint = await auditPointServices.create(
                auditPointData
            );

            setAuditPoints((prev) => [
                ...prev,
                createdAuditPoint
            ]);


            Swal.fire({
                title: "Added!",
                text: "The Audit Point has been added successfully.",
                icon: "success",
                confirmButtonText: "OK"
            });

        }


    } catch (error) {

        console.log(error);

        Swal.fire({
            title: "Error!",
            text: "Something went wrong.",
            icon: "error",
            confirmButtonText: "OK"
        });

    }
};



           const handleDeleteAudit = async (auditpointid) => {
                const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to undo this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "Cancel"
                });
        
                if (!result.isConfirmed) return;
        
                try {
                    await auditPointServices.remove(auditpointid);
        
                    setAuditPoints((prev) =>
                        prev.filter(
                            (auditPoints) =>
                                auditPoints.auditpointid !== auditpointid
                        )
                    );
        
                    Swal.fire({
                        title: "Deleted!",
                        text: "The Store Manager has been deleted.",
                        icon: "success"
                    });
        
                } catch (error) {
                    Swal.fire({
                        title: "Error!",
                        text: "Cannot delete this Audit.",
                        icon: "error"
                    });
                }
            };


    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
        <h2>
            {editingAuditPoint ? "Edit Audit Point" : "Add New Audit Point"}
        </h2>

            <AuditPointForm
                handleAddAuditPoint={handleAddAuditPoint}
                editingAuditPoint={editingAuditPoint}
            />

            <br />
            <hr />
            <br />


            <h1>Audit Point</h1>

            <table>
                <thead>
                    <tr>
                        <th>#ID</th>
                        <th>Criteria</th>
                        <th>Sub Point</th>
                        <th>Audit Point</th>
                        <th>Risk Matrix</th>
                        <th>Weightage</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {auditPoints.map((auditPoint) => (
                        <tr key={auditPoint.auditpointid}>
                            <td>{auditPoint.auditpointid}</td>
                            <td>{auditPoint.majorcriterianame}</td>
                            <td>{auditPoint.subpointcriteria}</td>
                            <td>{auditPoint.auditcomment}</td>
                            <td>{auditPoint.riskmatrix}</td>
                            <td>{auditPoint.weightage}</td>

                           <td>
                                <button
                                    onClick={() => setEditingAuditPoint(auditPoint)}
                                >
                                    Edit
                                </button>
                            </td>


                            <td>
                                <button 
                                    onClick={() => handleDeleteAudit(auditPoint.auditpointid)}
                                >
                                    Delete
                                </button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default AuditPoint;