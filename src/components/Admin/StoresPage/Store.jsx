import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClipboard,
  FiRotateCcw,
  FiArchive,
} from "react-icons/fi";

import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import storeServices from "../../../services/StoreServices";
import OpsManagerServices from "../../../services/OpsManagerServices";
import storeManagerServices from "../../../services/StoreManagerServices";

import StoreForm from "./StoreForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";

const Stores = () => {
  const [stores, setStores] = useState([]);

  const [brands, setBrands] = useState([]);

  const [locations, setLocations] = useState([]);

  const [opsManagers, setOpsManagers] = useState([]);

  const [storeManagers, setStoreManagers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingStore, setEditingStore] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showArchived, setShowArchived] = useState(false);

  // =====================================================
  // LOAD STORES
  // =====================================================
  const loadStores = async (includeInactive = false) => {
    try {
      setLoading(true);

      const data = await storeServices.index(includeInactive);

      console.log("Stores:", data);

      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Failed to load stores:", error);

      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD STORES WHEN FILTER CHANGES
  // =====================================================
  useEffect(() => {
    loadStores(showArchived);

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
  // LOAD OPS MANAGERS
  // =====================================================
  useEffect(() => {
    const getOpsManagers = async () => {
      try {
        const data = await OpsManagerServices.index();

        setOpsManagers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("Failed to load Ops Managers:", error);
      }
    };

    getOpsManagers();
  }, []);

  // =====================================================
  // LOAD STORE MANAGERS
  // =====================================================
  useEffect(() => {
    const getStoreManagers = async () => {
      try {
        const data = await storeManagerServices.index();

        setStoreManagers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("Failed to load Store Managers:", error);
      }
    };

    getStoreManagers();
  }, []);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================
  const openAddModal = () => {
    setEditingStore(null);

    setIsModalOpen(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================
  const openEditModal = (store) => {
    setEditingStore(store);

    setIsModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================
  const closeModal = () => {
    setIsModalOpen(false);

    setEditingStore(null);
  };

  // =====================================================
  // ADD / UPDATE STORE
  // =====================================================
  const handleAddStore = async (storeData) => {
    try {
      if (editingStore) {
        const updatedStore = await storeServices.update(
          editingStore.storeserial,
          storeData,
        );

        setStores((prev) =>
          prev.map((item) =>
            item.storeserial === editingStore.storeserial ? updatedStore : item,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Store updated successfully.",
        });
      } else {
        const newStore = await storeServices.create(storeData);

        setStores((prev) => [...prev, newStore]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Store added successfully.",
        });
      }

      closeModal();
    } catch (error) {
      console.log("Failed to save store:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong.",
      });
    }
  };

  // =====================================================
  // ARCHIVE STORE
  // =====================================================
  const handleArchiveStore = async (storeserial) => {
    const result = await Swal.fire({
      title: "Archive this store?",
      text: "The store will be hidden from active assignments but kept for historical audits and reports.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await storeServices.remove(storeserial);

      // Reload from database
      await loadStores(showArchived);

      Swal.fire({
        title: "Archived!",
        text: "The store has been archived.",
        icon: "success",
      });
    } catch (error) {
      console.log("Failed to archive store:", error);

      Swal.fire({
        title: "Error!",
        text: "Cannot archive this store.",
        icon: "error",
      });
    }
  };

  // =====================================================
  // RESTORE STORE
  // =====================================================
  const handleRestoreStore = async (storeserial) => {
    const result = await Swal.fire({
      title: "Restore this store?",
      text: "The store will become active again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, restore it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await storeServices.restore(storeserial);

      // Reload from database
      await loadStores(showArchived);

      Swal.fire({
        title: "Restored!",
        text: "The store is active again.",
        icon: "success",
      });
    } catch (error) {
      console.log("Failed to restore store:", error);

      Swal.fire({
        title: "Error!",
        text: "Could not restore this store.",
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
        <LoadingState label="Loading stores..." />
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiShoppingBag />}
        eyebrow="Network"
        title="Stores"
        subtitle="Manage stores and their brand, location and management assignments."
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
            <FiShoppingBag />

            {showArchived ? "All stores (incl. archived)" : "Active stores"}
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add store
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

                <th>Store code</th>

                <th>Email</th>

                <th>Brand</th>

                <th>Location</th>

                <th>Ops manager</th>

                <th>Store manager</th>

                <th>Status</th>

                <th>Audits</th>

                <th>Edit</th>

                <th>Archive / Restore</th>
              </tr>
            </thead>

            <tbody>
              {stores.length === 0 && (
                <tr>
                  <td colSpan={10} className="ag-empty-state">
                    {showArchived
                      ? "No stores found."
                      : "No active stores yet."}
                  </td>
                </tr>
              )}

              {stores.map((store, index) => {
                // Safely handle PostgreSQL boolean
                const isActive =
                  store.isactive === true ||
                  store.isactive === "true" ||
                  store.isactive === 1 ||
                  store.isactive === "1";

                return (
                  <tr key={store.storeserial}>
                    {/* Sl. No. */}
                    <td data-label="Sl. No.">{index + 1}</td>

                    {/* Store Code */}
                    <td data-label="Store code">{store.storecode}</td>

                  {/* Email for store */}
                    <td data-label="Email">{store.email || "-"}</td>

                    {/* Brand */}
                    <td data-label="Brand">{store.brandname}</td>

                    {/* Location */}
                    <td data-label="Location">{store.locationname}</td>

                    {/* Ops Manager */}
                    <td data-label="Ops manager">{store.opsmanagername}</td>

                    {/* Store Manager */}
                    <td data-label="Store manager">{store.storemanagername}</td>

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

                    {/* Audits */}
                    <td data-label="Audits">
                      <div className="ag-row-actions">
                        <Link
                          className="ag-icon-btn"
                          title={`View audits for ${store.storecode}`}
                          to={`/Audits?store=${store.storeserial}`}
                        >
                          <FiClipboard />
                        </Link>
                      </div>
                    </td>

                    {/* Edit */}
                    <td data-label="Edit">
                      <div className="ag-row-actions">
                        <button
                          type="button"
                          className="ag-icon-btn edit"
                          title="Edit"
                          onClick={() => openEditModal(store)}
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
                              handleArchiveStore(store.storeserial)
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
                              handleRestoreStore(store.storeserial)
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
          STORE MODAL
      ===================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        icon={<FiShoppingBag />}
        title={editingStore ? "Edit store" : "Add new store"}
      >
        <StoreForm
          brands={brands}
          locations={locations}
          opsManagers={opsManagers}
          storeManagers={storeManagers}
          handleAddStore={handleAddStore}
          editingStore={editingStore}
        />
      </Modal>
    </div>
  );
};

export default Stores;
