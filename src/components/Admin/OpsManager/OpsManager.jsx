import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiUserCheck,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRotateCcw,
  FiArchive,
} from "react-icons/fi";

import OpsManagerService from "../../../services/OpsManagerServices";
import OpsManagerForm from "./OpsManagerForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import { useNavigate } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import userService from "../../../services/UserServices";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";
import "./OpsManager.css";

const OpsManager = () => {
  const [opsManagers, setOpsManagers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingOpsManager, setEditingOpsManager] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showArchived, setShowArchived] = useState(false);

  // =========================
  // LOAD OPS MANAGERS
  // =========================
  const loadOpsManagers = async (includeInactive) => {
    try {
      setLoading(true);

      const data = await OpsManagerService.index(includeInactive);

      setOpsManagers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpsManagers(showArchived);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);



  const navigate = useNavigate();
const [linkedOracleIds, setLinkedOracleIds] = useState(new Set());

useEffect(() => {
  const loadUsers = async () => {
    try {
      const data = await userService.index();
      setLinkedOracleIds(new Set(data.map((u) => Number(u.oracleid))));
    } catch (error) {
      console.log(error);
    }
  };
  loadUsers();
}, []);

const handleAddToUsers = (opsManager) => {
  navigate(
    `/users?role=2&oracleId=${opsManager.oracleid}&userName=${encodeURIComponent(
      opsManager.opsmanagername,
    )}`,
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
          opsManagerData,
        );

        setOpsManagers((prev) =>
          prev.map((item) =>
            item.opsmanagerid === editingOpsManager.opsmanagerid
              ? updatedOpsManager
              : item,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Ops Manager updated successfully.",
        });
      } else {
        const newOpsManager = await OpsManagerService.create(opsManagerData);

        setOpsManagers((prev) => [...prev, newOpsManager]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Ops Manager added successfully.",
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
  const handleArchiveOpsManager = async (opsmanagerid) => {
    const result = await Swal.fire({
      title: "Archive this Ops Manager?",
      text: "They will be hidden from active assignments but kept for historical records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await OpsManagerService.remove(opsmanagerid);

      setOpsManagers((prev) =>
        prev.filter((item) => item.opsmanagerid !== opsmanagerid),
      );

      Swal.fire({
        title: "Archived!",
        text: "The Ops Manager has been archived.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Could not archive this Ops Manager.",
        icon: "error",
      });
    }
  };

  // =========================
  // RESTORE
  // =========================
  const handleRestoreOpsManager = async (opsmanagerid) => {
    try {
      await OpsManagerService.restore(opsmanagerid);

      setOpsManagers((prev) =>
        prev.filter((item) => item.opsmanagerid !== opsmanagerid),
      );

      Swal.fire({
        title: "Restored!",
        text: "The Ops Manager is active again.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Could not restore this Ops Manager.",
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
            <FiUserCheck />

            {showArchived
              ? "All ops managers (incl. archived)"
              : "Active ops managers"}
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

                <th>Status</th>

                <th>User account</th>

                <th>Edit</th>

                <th>Archive / Restore</th>
              </tr>
            </thead>

            <tbody>
              {opsManagers.length === 0 && (
                <tr>
                  <td colSpan={6} className="ag-empty-state">
                    {showArchived
                      ? "No Ops Managers found."
                      : "No active Ops Managers yet."}
                  </td>
                </tr>
              )}

              {opsManagers.map((opsManager, index) => (
                <tr key={opsManager.opsmanagerid}>
                  <td data-label="Sl. No.">{index + 1}</td>

                  <td data-label="Name">{opsManager.opsmanagername}</td>

                  <td data-label="Oracle ID">{opsManager.oracleid}</td>

                  <td data-label="Status">
                    <span
                      className={`ag-badge ${
                        opsManager.isactive
                          ? "ag-badge-success"
                          : "ag-badge-muted"
                      }`}
                    >
                      {opsManager.isactive ? "Active" : "Archived"}
                    </span>
                  </td>


                  <td data-label="User account">
  {linkedOracleIds.has(Number(opsManager.oracleid)) ? (
    <span className="ag-badge ag-badge-success">Linked</span>
  ) : (
    <button
      type="button"
      className="ag-btn ag-btn-ghost ag-btn-sm"
      onClick={() => handleAddToUsers(opsManager)}
    >
      <FiUserPlus /> Add to Users
    </button>
  )}
</td>

                  <td data-label="Edit">
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(opsManager)}
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>

                  <td data-label="Archive / Restore">
                    <div className="ag-row-actions">
                      {opsManager.isactive ? (
                        <button
                          className="ag-icon-btn delete"
                          title="Archive"
                          onClick={() =>
                            handleArchiveOpsManager(opsManager.opsmanagerid)
                          }
                        >
                          <FiTrash2 />
                        </button>
                      ) : (
                        <button
                          className="ag-icon-btn enable"
                          title="Restore"
                          onClick={() =>
                            handleRestoreOpsManager(opsManager.opsmanagerid)
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
        icon={<FiUserCheck />}
        title={editingOpsManager ? "Edit ops manager" : "Add new ops manager"}
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
