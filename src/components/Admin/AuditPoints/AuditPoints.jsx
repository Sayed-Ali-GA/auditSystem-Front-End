import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiClipboard, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

import auditPointServices from "../../../services/AuditPointsServices";
import AuditPointForm from "./AuditPointForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";

const riskBadgeClass = (risk) => {
  const key = (risk || "").toLowerCase();

  if (key === "high") return "ag-badge ag-badge-danger-solid";

  if (key === "moderate") return "ag-badge ag-badge-gold";

  return "ag-badge ag-badge-success";
};

const AuditPoint = () => {
  const [auditPoints, setAuditPoints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingAuditPoint, setEditingAuditPoint] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getAuditPoints = async () => {
      try {
        const data = await auditPointServices.index();

        setAuditPoints(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getAuditPoints();
  }, []);

  const openAddModal = () => {
    setEditingAuditPoint(null);

    setIsModalOpen(true);
  };

  const openEditModal = (auditPoint) => {
    setEditingAuditPoint(auditPoint);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);

    setEditingAuditPoint(null);
  };

  const handleAddAuditPoint = async (auditPointData) => {
    try {
      if (editingAuditPoint) {
        const updatedAuditPoint = await auditPointServices.update(
          editingAuditPoint.auditpointid,

          auditPointData,
        );

        setAuditPoints((prev) =>
          prev.map((item) =>
            item.auditpointid === editingAuditPoint.auditpointid
              ? updatedAuditPoint
              : item,
          ),
        );

        Swal.fire({
          icon: "success",

          title: "Updated!",

          text: "Audit point updated successfully.",
        });
      } else {
        const newAuditPoint = await auditPointServices.create(auditPointData);

        setAuditPoints((prev) => [...prev, newAuditPoint]);

        Swal.fire({
          icon: "success",

          title: "Added!",

          text: "Audit point added successfully.",
        });
      }

      closeModal();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",

        title: "Error!",

        text: "Something went wrong.",
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

      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await auditPointServices.remove(auditpointid);

      setAuditPoints((prev) =>
        prev.filter((item) => item.auditpointid !== auditpointid),
      );

      Swal.fire({
        title: "Deleted!",

        text: "The audit point has been deleted.",

        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",

        text: "Cannot delete this audit point.",

        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading audit points..." />
      </div>
    );
  }

  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiClipboard />}
        eyebrow="Audit setup"
        title="Audit Points"
        subtitle="Build the checklist auditors will follow during store visits."
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiClipboard />
            All audit points
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add audit point
          </button>
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>#ID</th>

                <th>Criteria</th>

                <th>Sub point</th>

                <th>Audit point</th>

                <th>Risk matrix</th>

                <th>Weightage</th>

                <th>Edit</th>

                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {auditPoints.length === 0 && (
                <tr>
                  <td colSpan={8} className="ag-empty-state">
                    No audit points yet.
                  </td>
                </tr>
              )}

              {auditPoints.map((item) => (
                <tr key={item.auditpointid}>
                  <td>{item.auditpointid}</td>

                  <td>{item.majorcriterianame}</td>

                  <td>{item.subpointcriteria}</td>

                  <td>{item.auditcomment}</td>

                  <td>
                    <span className={riskBadgeClass(item.riskmatrix)}>
                      {item.riskmatrix}
                    </span>
                  </td>

                  <td>{item.weightage}</td>

                  <td>
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(item)}
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>

                  <td>
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn delete"
                        title="Delete"
                        onClick={() => handleDeleteAudit(item.auditpointid)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        icon={<FiClipboard />}
        title={editingAuditPoint ? "Edit audit point" : "Add new audit point"}
      >
        <AuditPointForm
          handleAddAuditPoint={handleAddAuditPoint}
          editingAuditPoint={editingAuditPoint}
        />
      </Modal>
    </div>
  );
};

export default AuditPoint;
