import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiUserCheck, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

import OpsManagerService from "../../../services/OpsManagerServices";
import OpsManagerForm from "./OpsManagerForm";

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

  useEffect(() => {
    const getOpsManagers = async () => {
      try {
        const data = await OpsManagerService.index();

        setOpsManagers(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getOpsManagers();
  }, []);

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
      Swal.fire({
        icon: "error",

        title: "Error!",

        text: "Something went wrong.",
      });
    }
  };

  const handleDeleteOpsManager = async (opsmanagerid) => {
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
      await OpsManagerService.remove(opsmanagerid);

      setOpsManagers((prev) =>
        prev.filter((item) => item.opsmanagerid !== opsmanagerid),
      );

      Swal.fire({
        title: "Deleted!",

        text: "The Ops Manager has been deleted.",

        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",

        text: "This Ops Manager is assigned to one or more.",

        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading ops managers..." />
      </div>
    );
  }

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

                <th>Edit</th>

                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {opsManagers.length === 0 && (
                <tr>
                  <td colSpan={5} className="ag-empty-state">
                    No ops managers yet.
                  </td>
                </tr>
              )}

              {opsManagers.map((opsManager, index) => (
                <tr key={opsManager.opsmanagerid}>
                  <td>{index + 1}</td>

                  <td>{opsManager.opsmanagername}</td>

                  <td>{opsManager.oracleid}</td>

                  <td>
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

                  <td>
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn delete"
                        title="Delete"
                        onClick={() =>
                          handleDeleteOpsManager(opsManager.opsmanagerid)
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
