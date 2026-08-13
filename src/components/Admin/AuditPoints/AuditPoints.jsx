import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiClipboard,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRotateCcw,
  FiArchive,
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

  const [showArchived, setShowArchived] = useState(false);

  // =========================
  // LOAD AUDIT POINTS
  // =========================
  const loadAuditPoints = async (includeInactive) => {
    try {
      setLoading(true);

      const data = await auditPointServices.index(includeInactive);

      setAuditPoints(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditPoints(showArchived);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  // =========================
  // MODAL
  // =========================
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

  // =========================
  // ADD / UPDATE
  // =========================
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
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong.",
      });
    }
  };

  // =========================
  // ARCHIVE
  // =========================
  const handleArchiveAuditPoint = async (auditpointid) => {
    const result = await Swal.fire({
      title: "Archive this audit point?",
      text: "It will be hidden from active audits but kept for historical records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await auditPointServices.remove(auditpointid);

      setAuditPoints((prev) =>
        prev.filter(
          (item) => item.auditpointid !== auditpointid,
        ),
      );

      Swal.fire({
        title: "Archived!",
        text: "The audit point has been archived.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Cannot archive this audit point.",
        icon: "error",
      });
    }
  };

  // =========================
  // RESTORE
  // =========================
  const handleRestoreAuditPoint = async (auditpointid) => {
    try {
      await auditPointServices.restore(auditpointid);

      setAuditPoints((prev) =>
        prev.filter(
          (item) => item.auditpointid !== auditpointid,
        ),
      );

      Swal.fire({
        title: "Restored!",
        text: "The audit point is active again.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Could not restore this audit point.",
        icon: "error",
      });
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading audit points..." />
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiClipboard />}
        eyebrow="Audit setup"
        title="Audit Points"
        subtitle="Build the checklist auditors will follow during store visits."
        actions={
          <button
            type="button"
            className="ag-btn ag-btn-ghost ag-btn-sm"
            onClick={() => setShowArchived((v) => !v)}
          >
            <FiArchive />

            {showArchived
              ? "Show active only"
              : "Show archived"}
          </button>
        }
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiClipboard />

            {showArchived
              ? "All audit points (incl. archived)"
              : "Active audit points"}
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

                <th>Status</th>

                <th>Edit</th>

                <th>Archive / Restore</th>
              </tr>
            </thead>

            <tbody>
              {auditPoints.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="ag-empty-state"
                  >
                    {showArchived
                      ? "No audit points found."
                      : "No active audit points yet."}
                  </td>
                </tr>
              )}

              {auditPoints.map((item) => (
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
                      className={riskBadgeClass(
                        item.riskmatrix,
                      )}
                    >
                      {item.riskmatrix}
                    </span>
                  </td>

                  <td data-label="Weightage">
                    {item.weightage}
                  </td>

                  <td data-label="Status">
                    <span
                      className={`ag-badge ${
                        item.isactive
                          ? "ag-badge-success"
                          : "ag-badge-muted"
                      }`}
                    >
                      {item.isactive
                        ? "Active"
                        : "Archived"}
                    </span>
                  </td>

                  <td data-label="Edit">
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() =>
                          openEditModal(item)
                        }
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>

                  <td data-label="Archive / Restore">
                    <div className="ag-row-actions">
                      {item.isactive ? (
                        <button
                          className="ag-icon-btn delete"
                          title="Archive"
                          onClick={() =>
                            handleArchiveAuditPoint(
                              item.auditpointid,
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>
                      ) : (
                        <button
                          className="ag-icon-btn enable"
                          title="Restore"
                          onClick={() =>
                            handleRestoreAuditPoint(
                              item.auditpointid,
                            )
                          }
                        >
                          <FiRotateCcw />
                        </button>
                      )}
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