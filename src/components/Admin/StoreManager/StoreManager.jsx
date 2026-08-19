import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiUser,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMail,
  FiUserPlus,
} from "react-icons/fi";

import storeManagerService from "../../../services/StoreManagerServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import userService from "../../../services/UserServices";

import StoreManagerForm from "./StoreManagerForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import { useNavigate } from "react-router-dom";

import "../Shared/theme.css";

const StoreManagers = () => {
  const [storeManagers, setStoreManagers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStoreManager, setEditingStoreManager] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkedOracleIds, setLinkedOracleIds] = useState(new Set());
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  // =====================================================
  // LOAD STORE MANAGERS
  // =====================================================
  const loadStoreManagers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await storeManagerService.index();

      setStoreManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Failed to load store managers:", error);

      setError("Cannot connect to server");
      setStoreManagers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreManagers();
  }, []);

  // =====================================================
  // LOAD USERS
  // =====================================================
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.index();

        setLinkedOracleIds(
          new Set(data.map((user) => Number(user.oracleid)))
        );
      } catch (error) {
        console.log("Failed to load users:", error);
      }
    };

    loadUsers();
  }, []);

  // =====================================================
  // LOAD BRANDS
  // =====================================================
  useEffect(() => {
    const getBrands = async () => {
      try {
        const data = await brandService.index();

        setBrands(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("Failed to load brands:", error);
      }
    };

    getBrands();
  }, []);

  // =====================================================
  // LOAD LOCATIONS
  // =====================================================
  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await locationServices.index();

        setLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("Failed to load locations:", error);
      }
    };

    getLocations();
  }, []);

  // =====================================================
  // ADD TO USERS
  // =====================================================
  const handleAddToUsers = (storeManager) => {
    navigate(
      `/users?role=3&oracleId=${storeManager.oracleid}&userName=${encodeURIComponent(
        storeManager.storemanagername
      )}&locationId=${storeManager.locationid}`
    );
  };

  // =====================================================
  // MODAL
  // =====================================================
  const openAddModal = () => {
    setEditingStoreManager(null);
    setIsModalOpen(true);
  };

  const openEditModal = (storeManager) => {
    setEditingStoreManager(storeManager);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStoreManager(null);
  };

  // =====================================================
  // ADD / UPDATE
  // =====================================================
  const handleAddStoreManager = async (storeManagerData) => {
    try {
      if (editingStoreManager) {
        const updatedStoreManager = await storeManagerService.update(
          editingStoreManager.storemanagerid,
          storeManagerData
        );

        setStoreManagers((prev) =>
          prev.map((item) =>
            item.storemanagerid === editingStoreManager.storemanagerid
              ? updatedStoreManager
              : item
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Store Manager updated successfully.",
        });
      } else {
        const newStoreManager = await storeManagerService.create(
          storeManagerData
        );

        setStoreManagers((prev) => [...prev, newStoreManager]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Store Manager added successfully.",
        });
      }

      closeModal();
    } catch (error) {
      console.log("Failed to save Store Manager:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong.",
      });
    }
  };

  // =====================================================
  // DELETE STORE MANAGER — PERMANENT
  // =====================================================
  const handleDeleteStoreManager = async (storemanagerid) => {
    const result = await Swal.fire({
      title: "Delete this Store Manager permanently?",
      text: "This cannot be undone. The Store Manager and related records will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(storemanagerid);
      setError("");

      await storeManagerService.remove(storemanagerid);

      setStoreManagers((prev) =>
        prev.filter(
          (item) =>
            Number(item.storemanagerid) !== Number(storemanagerid)
        )
      );

      Swal.fire({
        title: "Deleted!",
        text: "The Store Manager has been permanently deleted.",
        icon: "success",
      });
    } catch (error) {
      console.log("Failed to delete Store Manager:", error);

      Swal.fire({
        title: "Error!",
        text: "Could not delete this Store Manager.",
        icon: "error",
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
        <LoadingState label="Loading store managers..." />
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error) {
    return (
      <div className="ag-main">
        <div className="ag-card">
          <div className="ag-error-banner">{error}</div>

          <p>
            Please send an email to IT for support.
            <a href="mailto:example@example.com">
              <FiMail /> Send email
            </a>
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="ag-main">
              <PageHeader
            icon={<FiUser />}
            eyebrow="Team"
            title="Store Managers"
            subtitle="Manage store managers and their brand / location assignment."
            actions={
              <button
                type="button"
                className="ag-btn ag-btn-primary ag-btn-sm"
                onClick={openAddModal}
              >
                <FiPlus />
                Add store manager
              </button>
            }
          />

          <div className="ag-card">
            <div className="ag-card-title-row">
              <div className="ag-card-title">
                <FiUser />
                Store managers
              </div>
            </div>

            <div className="ag-table-wrap">
              <table className="ag-table">
                <thead>
                  <tr>
                    <th>Sl. No.</th>
                    <th>Name</th>
                    <th>Oracle ID</th>
                    <th>Brand</th>
                    <th>Location</th>
                    <th>User account</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {storeManagers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="ag-empty-state">
                        No store managers yet.
                      </td>
                    </tr>
                  )}

                  {storeManagers.map((storeManager, index) => (
                    <tr key={storeManager.storemanagerid}>
                      <td data-label="Sl. No.">{index + 1}</td>

                      <td data-label="Name">
                        {storeManager.storemanagername}
                      </td>

                      <td data-label="Oracle ID">
                        {storeManager.oracleid}
                      </td>

                      <td data-label="Brand">
                        {storeManager.brandname}
                      </td>

                      <td data-label="Location">
                        {storeManager.locationname}
                      </td>

                      <td data-label="User account">
                        {linkedOracleIds.has(Number(storeManager.oracleid)) ? (
                          <span className="ag-badge ag-badge-success">
                            Linked
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="ag-btn ag-btn-ghost ag-btn-sm"
                            onClick={() => handleAddToUsers(storeManager)}
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
                            onClick={() => openEditModal(storeManager)}
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
                            title="Delete permanently"
                            onClick={() =>
                              handleDeleteStoreManager(
                                storeManager.storemanagerid
                              )
                            }
                            disabled={
                              deletingId === storeManager.storemanagerid
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
        icon={<FiUser />}
        title={
          editingStoreManager
            ? "Edit store manager"
            : "Add new store manager"
        }
      >
        <StoreManagerForm
          brands={brands}
          locations={locations}
          handleAddStoreManager={handleAddStoreManager}
          editingStoreManager={editingStoreManager}
        />
      </Modal>
    </div>
  );
};

export default StoreManagers;