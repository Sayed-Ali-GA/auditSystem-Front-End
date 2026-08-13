import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiCheckSquare,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRotateCcw,
  FiArchive,
} from "react-icons/fi";

import criteriaService from "../../../services/CriteriaServices";
import CriteriaForm from "./CrteriaForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";

const Criteria = () => {
  const [criteria, setCriteria] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingCriteria, setEditingCriteria] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showArchived, setShowArchived] = useState(false);

  // =========================
  // LOAD CRITERIA
  // =========================
  const loadCriteria = async (includeInactive) => {
    try {
      setLoading(true);

      const data = await criteriaService.index(includeInactive);

      setCriteria(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCriteria(showArchived);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  // =========================
  // MODAL
  // =========================
  const openAddModal = () => {
    setEditingCriteria(null);
    setIsModalOpen(true);
  };

  const openEditModal = (criteria) => {
    setEditingCriteria(criteria);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCriteria(null);
  };

  // =========================
  // ADD / UPDATE
  // =========================
  const handleAddCriteria = async (criteriaData) => {
    try {
      if (editingCriteria) {
        const updatedCriteria = await criteriaService.update(
          editingCriteria.majorcriteriaid,
          criteriaData,
        );

        setCriteria((prev) =>
          prev.map((item) =>
            item.majorcriteriaid === editingCriteria.majorcriteriaid
              ? updatedCriteria
              : item,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Criteria updated successfully.",
        });
      } else {
        const newCriteria = await criteriaService.create(criteriaData);

        setCriteria((prev) => [...prev, newCriteria]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Criteria added successfully.",
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
  const handleArchiveCriteria = async (majorcriteriaid) => {
    const result = await Swal.fire({
      title: "Archive this criteria?",
      text: "It will be hidden from new audit points but kept for historical reports.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await criteriaService.remove(majorcriteriaid);

      setCriteria((prev) =>
        prev.filter((item) => item.majorcriteriaid !== majorcriteriaid),
      );

      Swal.fire({
        title: "Archived!",
        text: "The criteria has been archived.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Could not archive this criteria.",
        icon: "error",
      });
    }
  };

  // =========================
  // RESTORE
  // =========================
  const handleRestoreCriteria = async (majorcriteriaid) => {
    try {
      await criteriaService.restore(majorcriteriaid);

      setCriteria((prev) =>
        prev.filter((item) => item.majorcriteriaid !== majorcriteriaid),
      );

      Swal.fire({
        title: "Restored!",
        text: "The criteria is active again.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Could not restore this criteria.",
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
        <LoadingState label="Loading criteria..." />
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiCheckSquare />}
        eyebrow="Audit setup"
        title="Criteria"
        subtitle="Define the major criteria used to build audit points."
        actions={
          <button
            type="button"
            className="ag-btn ag-btn-ghost ag-btn-sm"
            onClick={() => setShowArchived((v) => !v)}
          >
            <FiArchive />

            {showArchived ? "Show active only" : "Show archived"}
          </button>
        }
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiCheckSquare />

            {showArchived ? "All criteria (incl. archived)" : "Active criteria"}
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add criteria
          </button>
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Sl. No.</th>

                <th>Criteria</th>

                <th>Status</th>

                <th>Edit</th>

                <th>Archive / Restore</th>
              </tr>
            </thead>

            <tbody>
              {criteria.length === 0 && (
                <tr>
                  <td colSpan={5} className="ag-empty-state">
                    {showArchived
                      ? "No criteria found."
                      : "No active criteria yet."}
                  </td>
                </tr>
              )}

              {criteria.map((item, index) => (
                <tr key={item.majorcriteriaid}>
                  <td data-label="Sl. No.">{index + 1}</td>

                  <td data-label="Criteria">{item.majorcriterianame}</td>

                  <td data-label="Status">
                    <span
                      className={`ag-badge ${
                        item.isactive ? "ag-badge-success" : "ag-badge-muted"
                      }`}
                    >
                      {item.isactive ? "Active" : "Archived"}
                    </span>
                  </td>

                  <td data-label="Edit">
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

                  <td data-label="Archive / Restore">
                    <div className="ag-row-actions">
                      {item.isactive ? (
                        <button
                          className="ag-icon-btn delete"
                          title="Archive"
                          onClick={() =>
                            handleArchiveCriteria(item.majorcriteriaid)
                          }
                        >
                          <FiTrash2 />
                        </button>
                      ) : (
                        <button
                          className="ag-icon-btn enable"
                          title="Restore"
                          onClick={() =>
                            handleRestoreCriteria(item.majorcriteriaid)
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
        icon={<FiCheckSquare />}
        title={editingCriteria ? "Edit criteria" : "Add new criteria"}
      >
        <CriteriaForm
          handleAddCriteria={handleAddCriteria}
          editingCriteria={editingCriteria}
        />
      </Modal>
    </div>
  );
};

export default Criteria;
