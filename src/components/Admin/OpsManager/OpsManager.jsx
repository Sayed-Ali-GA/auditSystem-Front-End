import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiUserCheck,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUserPlus,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import OpsManagerService from "../../../services/OpsManagerServices";
import OpsManagerForm from "./OpsManagerForm";
import userService from "../../../services/UserServices";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";
import "./OpsManager.css";

const OpsManager = () => {
  const [opsManagers, setOpsManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOpsManager, setEditingOpsManager] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [linkedOracleIds, setLinkedOracleIds] = useState(new Set());

  const navigate = useNavigate();

  // =========================
  // LOAD OPS MANAGERS
  // =========================
  const loadOpsManagers = async () => {
    try {
      setLoading(true);

      const data = await OpsManagerService.index();

      setOpsManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Ops Managers Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not load Ops Managers.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpsManagers();
  }, []);

  // =========================
  // LOAD USER ACCOUNTS
  // =========================
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.index();

        setLinkedOracleIds(
          new Set(
            data
              .map((user) => Number(user.oracleid))
              .filter((id) => !Number.isNaN(id))
          )
        );
      } catch (error) {
        console.error("Load Users Error:", error);
      }
    };

    loadUsers();
  }, []);

  // =========================
  // ADD TO USERS
  // =========================
  const handleAddToUsers = (opsManager) => {
    navigate(
      `/users?role=2&oracleId=${opsManager.oracleid}&userName=${encodeURIComponent(
        opsManager.opsmanagername
      )}`
    );
  };

  // =========================
  // MODAL
  // =========================
  const openAddModal = () => {
    setEditingOpsManager(null);
    setIsModalOpen(true);
  };

  const openEditModal = (opsManager) => {
    setEditingOpsManager(opsManager);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOpsManager(null);
  };

  // =========================
  // ADD / UPDATE
  // =========================
  const handleAddOpsManager = async (opsManagerData) => {
    try {
      if (editingOpsManager) {
        const updatedOpsManager = await OpsManagerService.update(
          editingOpsManager.opsmanagerid,
          opsManagerData
        );

        setOpsManagers((prev) =>
          prev.map((item) =>
            item.opsmanagerid === editingOpsManager.opsmanagerid
              ? updatedOpsManager
              : item
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Ops Manager updated successfully.",
        });
      } else {
        const newOpsManager =
          await OpsManagerService.create(opsManagerData);

        setOpsManagers((prev) => [...prev, newOpsManager]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Ops Manager added successfully.",
        });
      }

      closeModal();
    } catch (error) {
      console.error("Save Ops Manager Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong.",
      });
    }
  };

  // =========================
  // DELETE OPS MANAGER — PERMANENT
  // =========================
  const handleDelete = async (opsmanagerid) => {
    const result = await Swal.fire({
      title: "Delete this Ops Manager permanently?",
      text: "This cannot be undone. The Ops Manager will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(opsmanagerid);

      await OpsManagerService.remove(opsmanagerid);

      setOpsManagers((prev) =>
        prev.filter(
          (item) =>
            Number(item.opsmanagerid) !== Number(opsmanagerid)
        )
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Ops Manager permanently deleted.",
      });
    } catch (error) {
      console.error("Delete Ops Manager Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not delete the Ops Manager.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading ops managers..." />
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiUserCheck />}
        eyebrow="Team"
        title="Ops Managers"
        subtitle="Manage operations managers assigned to stores."
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiUserCheck />
            All ops managers
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add ops manager
          </button>
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Name</th>
                <th>Oracle ID</th>
                <th>User account</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {opsManagers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ag-empty-state">
                    No Ops Managers yet.
                  </td>
                </tr>
              ) : (
                opsManagers.map((opsManager, index) => (
                  <tr key={opsManager.opsmanagerid}>
                    <td data-label="Sl. No.">
                      {index + 1}
                    </td>

                    <td data-label="Name">
                      {opsManager.opsmanagername}
                    </td>

                    <td data-label="Oracle ID">
                      {opsManager.oracleid}
                    </td>

                    <td data-label="User account">
                      {linkedOracleIds.has(
                        Number(opsManager.oracleid)
                      ) ? (
                        <span className="ag-badge ag-badge-success">
                          Linked
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="ag-btn ag-btn-ghost ag-btn-sm"
                          onClick={() =>
                            handleAddToUsers(opsManager)
                          }
                        >
                          <FiUserPlus />
                          Add to Users
                        </button>
                      )}
                    </td>

                    <td data-label="Edit">
                      <div className="ag-row-actions">
                        <button
                          type="button"
                          className="ag-icon-btn edit"
                          title="Edit"
                          onClick={() =>
                            openEditModal(opsManager)
                          }
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
                            handleDelete(
                              opsManager.opsmanagerid
                            )
                          }
                          disabled={
                            deletingId ===
                            opsManager.opsmanagerid
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
        icon={<FiUserCheck />}
        title={
          editingOpsManager
            ? "Edit ops manager"
            : "Add new ops manager"
        }
      >
        <OpsManagerForm
          handleAddOpsManager={handleAddOpsManager}
          editingOpsManager={editingOpsManager}
        />
      </Modal>
    </div>
  );
};

export default OpsManager;