import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiCheckSquare, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

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

  useEffect(() => {
    const getCriteria = async () => {
      try {
        const data = await criteriaService.index();

        setCriteria(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getCriteria();
  }, []);

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

  const handleDeleteCriteria = async (majorcriteriaid) => {
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
      await criteriaService.remove(majorcriteriaid);

      setCriteria((prev) =>
        prev.filter((item) => item.majorcriteriaid !== majorcriteriaid),
      );

      Swal.fire({
        title: "Deleted!",

        text: "The criteria has been deleted.",

        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",

        text: "Failed to delete the criteria.",

        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading criteria..." />
      </div>
    );
  }

  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiCheckSquare />}
        eyebrow="Audit setup"
        title="Criteria"
        subtitle="Define the major criteria used to build audit points."
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiCheckSquare />
            All criteria
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

                <th>Edit</th>

                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {criteria.length === 0 && (
                <tr>
                  <td colSpan={4} className="ag-empty-state">
                    No criteria yet.
                  </td>
                </tr>
              )}

              {criteria.map((item, index) => (
                <tr key={item.majorcriteriaid}>
                  <td data-label="Sl. No.">{index + 1}</td>

                  <td data-label="Criteria">{item.majorcriterianame}</td>

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

                  <td data-label="Delete">
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn delete"
                        title="Delete"
                        onClick={() =>
                          handleDeleteCriteria(item.majorcriteriaid)
                        }
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
