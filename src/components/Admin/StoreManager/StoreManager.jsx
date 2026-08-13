import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiUser,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMail,
  FiRotateCcw,
  FiArchive,
} from "react-icons/fi";

import storeManagerService from "../../../services/StoreManagerServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";

import StoreManagerForm from "./StoreManagerForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";
import { useNavigate } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import userService from "../../../services/UserServices";

import "../Shared/theme.css";

const StoreManagers = () => {
  const [storeManagers, setStoreManagers] = useState([]);

  const [brands, setBrands] = useState([]);

  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [editingStoreManager, setEditingStoreManager] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showArchived, setShowArchived] = useState(false);

  // =====================================================
  // LOAD STORE MANAGERS
  // =====================================================
  const loadStoreManagers = async (includeInactive = false) => {
    try {
      setLoading(true);
      setError("");

      const data = await storeManagerService.index(includeInactive);

      console.log("Store Managers:", data);

      setStoreManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Failed to load store managers:", error);

      setError("Cannot connect to server");
      setStoreManagers([]);
    } finally {
      setLoading(false);
    }
  };


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

const handleAddToUsers = (storeManager) => {
  navigate(
    `/users?role=3&oracleId=${storeManager.oracleid}&userName=${encodeURIComponent(
      storeManager.storemanagername,
    )}&locationId=${storeManager.locationid}`,
  );
};


  // =====================================================
  // LOAD STORE MANAGERS WHEN ARCHIVE FILTER CHANGES
  // =====================================================
  useEffect(() => {
    loadStoreManagers(showArchived);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

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
  // OPEN ADD MODAL
  // =====================================================
  const openAddModal = () => {
    setEditingStoreManager(null);
    setIsModalOpen(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================
  const openEditModal = (storeManager) => {
    setEditingStoreManager(storeManager);
    setIsModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStoreManager(null);
  };

  // =====================================================
  // ADD / UPDATE STORE MANAGER
  // =====================================================
  const handleAddStoreManager = async (storeManagerData) => {
    try {
      if (editingStoreManager) {
        const updatedStoreManager = await storeManagerService.update(
          editingStoreManager.storemanagerid,
          storeManagerData,
        );

        setStoreManagers((prev) =>
          prev.map((item) =>
            item.storemanagerid === editingStoreManager.storemanagerid
              ? updatedStoreManager
              : item,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Store Manager updated successfully.",
        });
      } else {
        const newStoreManager =
          await storeManagerService.create(storeManagerData);

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
  // ARCHIVE STORE MANAGER
  // =====================================================
  const handleArchiveStoreManager = async (storemanagerid) => {
    const result = await Swal.fire({
      title: "Archive this Store Manager?",
      text: "They will be hidden from active assignments but kept for historical records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await storeManagerService.remove(storemanagerid);

      // Reload from database
      await loadStoreManagers(showArchived);

      Swal.fire({
        title: "Archived!",
        text: "The Store Manager has been archived.",
        icon: "success",
      });
    } catch (error) {
      console.log("Failed to archive Store Manager:", error);

      Swal.fire({
        title: "Error!",
        text: "Cannot archive this Store Manager.",
        icon: "error",
      });
    }
  };

  // =====================================================
  // RESTORE STORE MANAGER
  // =====================================================
  const handleRestoreStoreManager = async (storemanagerid) => {
    const result = await Swal.fire({
      title: "Restore this Store Manager?",
      text: "They will become active again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, restore it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await storeManagerService.restore(storemanagerid);

      // Reload from database
      await loadStoreManagers(showArchived);

      Swal.fire({
        title: "Restored!",
        text: "The Store Manager is active again.",
        icon: "success",
      });
    } catch (error) {
      console.log("Failed to restore Store Manager:", error);

      Swal.fire({
        title: "Error!",
        text: "Could not restore this Store Manager.",
        icon: "error",
      });
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
            className="ag-btn ag-btn-ghost ag-btn-sm"
            onClick={() => setShowArchived((value) => !value)}
          >
            <FiArchive />

            {showArchived ? "Show active only" : "Show archived"}
          </button>
        }
      />

      <div className="ag-card">
        {/* =====================================================
            CARD HEADER
        ===================================================== */}
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiUser />

            {showArchived
              ? "All store managers (incl. archived)"
              : "Active store managers"}
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add store manager
          </button>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}
        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Sl. No.</th>

                <th>Name</th>

                <th>Oracle ID</th>

                <th>Brand</th>

                <th>Location</th>

                <th>Status</th>

                <th>User account</th>

                <th>Edit</th>

                <th>Archive / Restore</th>
              </tr>
            </thead>

            <tbody>
              {storeManagers.length === 0 && (
                <tr>
                  <td colSpan={8} className="ag-empty-state">
                    {showArchived
                      ? "No store managers found."
                      : "No active store managers yet."}
                  </td>
                </tr>
              )}

              {storeManagers.map((storeManager, index) => {
      
                const isActive =
                  storeManager.isactive === true ||
                  storeManager.isactive === "true" ||
                  storeManager.isactive === 1 ||
                  storeManager.isactive === "1";

                return (
                  <tr key={storeManager.storemanagerid}>
                    {/* Sl. No. */}
                    <td data-label="Sl. No.">{index + 1}</td>

                    {/* Name */}
                    <td data-label="Name">{storeManager.storemanagername}</td>

                    {/* Oracle ID */}
                    <td data-label="Oracle ID">{storeManager.oracleid}</td>

                    {/* Brand */}
                    <td data-label="Brand">{storeManager.brandname}</td>

                    {/* Location */}
                    <td data-label="Location">{storeManager.locationname}</td>

                    {/* Status */}
                    <td data-label="Status">
                      <span
                        className={`ag-badge ${
                          isActive ? "ag-badge-success" : "ag-badge-muted"
                        }`}
                      >
                        {isActive ? "Active" : "Archived"}
                      </span>
                    </td>


                    <td data-label="User account">
  {linkedOracleIds.has(Number(storeManager.oracleid)) ? (
    <span className="ag-badge ag-badge-success">Linked</span>
  ) : (
    <button
      type="button"
      className="ag-btn ag-btn-ghost ag-btn-sm"
      onClick={() => handleAddToUsers(storeManager)}
    >
      <FiUserPlus /> Add to Users
    </button>
  )}
</td>

                    {/* Edit */}
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

                    {/* Archive / Restore */}
                    <td data-label="Archive / Restore">
                      <div className="ag-row-actions">
                        {isActive ? (
                          <button
                            type="button"
                            className="ag-icon-btn delete"
                            title="Archive"
                            onClick={() =>
                              handleArchiveStoreManager(
                                storeManager.storemanagerid,
                              )
                            }
                          >
                            <FiTrash2 />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ag-icon-btn enable"
                            title="Restore"
                            onClick={() =>
                              handleRestoreStoreManager(
                                storeManager.storemanagerid,
                              )
                            }
                          >
                            <FiRotateCcw />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        icon={<FiUser />}
        title={
          editingStoreManager ? "Edit store manager" : "Add new store manager"
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
