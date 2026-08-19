import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiClipboard,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

import auditPointServices from "../../../services/AuditPointsServices";
import AuditPointForm from "./AuditPointForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";

const riskBadgeClass = (risk) => {
  const key = (risk || "").toLowerCase();

  if (key === "high") {
    return "ag-badge ag-badge-danger-solid";
  }

  if (key === "moderate") {
    return "ag-badge ag-badge-gold";
  }

  return "ag-badge ag-badge-success";
};

const AuditPoint = () => {
  const [auditPoints, setAuditPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAuditPoint, setEditingAuditPoint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // LOAD AUDIT POINTS
  // =====================================================
  const loadAuditPoints = async () => {
    try {
      setLoading(true);

      const data = await auditPointServices.index();

      setAuditPoints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Audit Points Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not load audit points.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditPoints();
  }, []);

  // =====================================================
  // MODAL
  // =====================================================
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

  // =====================================================
  // ADD / UPDATE
  // =====================================================
  const handleAddAuditPoint = async (auditPointData) => {
    try {
      if (editingAuditPoint) {
        const updatedAuditPoint = await auditPointServices.update(
          editingAuditPoint.auditpointid,
          auditPointData
        );

        setAuditPoints((prev) =>
          prev.map((item) =>
            item.auditpointid === editingAuditPoint.auditpointid
              ? updatedAuditPoint
              : item
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Audit point updated successfully.",
        });
      } else {
        const newAuditPoint =
          await auditPointServices.create(auditPointData);

        setAuditPoints((prev) => [...prev, newAuditPoint]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Audit point added successfully.",
        });
      }

      closeModal();
    } catch (error) {
      console.error("Save Audit Point Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong.",
      });
    }
  };

  // =====================================================
  // DELETE AUDIT POINT — PERMANENT
  // =====================================================
  const handleDelete = async (auditpointid) => {
    const result = await Swal.fire({
      title: "Delete this audit point permanently?",
      text: "This cannot be undone. The audit point will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(auditpointid);

      await auditPointServices.remove(auditpointid);

      setAuditPoints((prev) =>
        prev.filter(
          (item) =>
            Number(item.auditpointid) !== Number(auditpointid)
        )
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Audit point permanently deleted.",
      });
    } catch (error) {
      console.error("Delete Audit Point Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not delete the audit point.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading audit points..." />
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================
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
              {auditPoints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="ag-empty-state">
                    No audit points yet.
                  </td>
                </tr>
              ) : (
                auditPoints.map((item) => (
                  <tr key={item.auditpointid}>
                    <td data-label="#ID">
                      {item.auditpointid}
                    </td>

                    <td data-label="Criteria">
                      {item.majorcriterianame}
                    </td>

                    <td data-label="Sub point">
                      {item.subpointcriteria}
                    </td>

                    <td data-label="Audit point">
                      {item.auditcomment}
                    </td>

                    <td data-label="Risk matrix">
                      <span
                        className={riskBadgeClass(item.riskmatrix)}
                      >
                        {item.riskmatrix}
                      </span>
                    </td>

                    <td data-label="Weightage">
                      {item.weightage}
                    </td>

                    <td data-label="Edit">
                      <div className="ag-row-actions">
                        <button
                          type="button"
                          className="ag-icon-btn edit"
                          title="Edit"
                          onClick={() => openEditModal(item)}
                        >
                          <FiEdit2 />
                        </button>
                      </div>
                    </td>

                    <td data-label="Delete">
                      <div className="ag-row-actions">
                        <button
                          type="button"
                          className="ag-icon-btn delete"
                          title="Delete"
                          onClick={() =>
                            handleDelete(item.auditpointid)
                          }
                          disabled={
                            deletingId === item.auditpointid
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        icon={<FiClipboard />}
        title={
          editingAuditPoint
            ? "Edit audit point"
            : "Add new audit point"
        }
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