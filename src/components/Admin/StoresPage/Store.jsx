import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClipboard,
  FiKey,
  FiSearch,
  FiCheckCircle,
} from "react-icons/fi";

import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import storeServices from "../../../services/StoreServices";
import OpsManagerServices from "../../../services/OpsManagerServices";
import storeManagerServices from "../../../services/StoreManagerServices";

import StoreForm from "./StoreForm";
import StoreLoginModal from "./StoreLoginModal";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";
import "./storeExtras.css";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [opsManagers, setOpsManagers] = useState([]);
  const [storeManagers, setStoreManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingStore, setEditingStore] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [loginStore, setLoginStore] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // LOAD STORES
  // =====================================================
  const loadStores = async () => {
    try {
      setLoading(true);

      const data = await storeServices.index();

      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Failed to load stores:", error);

      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  // =====================================================
  // LOAD LOOKUP DATA (brands, locations, ops & store managers)
  // =====================================================
  useEffect(() => {
    const loadLookups = async () => {
      const [brandData, locationData, opsData, storeManagerData] =
        await Promise.allSettled([
          brandService.index(),
          locationServices.index(),
          OpsManagerServices.index(),
          storeManagerServices.index(),
        ]);

      if (brandData.status === "fulfilled") {
        setBrands(Array.isArray(brandData.value) ? brandData.value : []);
      } else {
        console.log("Failed to load brands:", brandData.reason);
      }

      if (locationData.status === "fulfilled") {
        setLocations(
          Array.isArray(locationData.value) ? locationData.value : []
        );
      } else {
        console.log("Failed to load locations:", locationData.reason);
      }

      if (opsData.status === "fulfilled") {
        setOpsManagers(Array.isArray(opsData.value) ? opsData.value : []);
      } else {
        console.log("Failed to load Ops Managers:", opsData.reason);
      }

      if (storeManagerData.status === "fulfilled") {
        setStoreManagers(
          Array.isArray(storeManagerData.value) ? storeManagerData.value : []
        );
      } else {
        console.log(
          "Failed to load Store Managers:",
          storeManagerData.reason
        );
      }
    };

    loadLookups();
  }, []);

  // =====================================================
  // SEARCH / FILTER
  // =====================================================
  const filteredStores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return stores;

    return stores.filter((store) =>
      [
        store.storecode,
        store.email,
        store.brandname,
        store.locationname,
        store.opsmanagername,
        store.storemanagername,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [stores, searchTerm]);

  // =====================================================
  // FORM MODAL (Add / Edit)
  // =====================================================
  const openAddModal = () => {
    setEditingStore(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (store) => {
    setEditingStore(store);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingStore(null);
  };

  const handleAddStore = async (storeData) => {
    try {
      if (editingStore) {
        const updatedStore = await storeServices.update(
          editingStore.storeserial,
          storeData
        );

        setStores((prev) =>
          prev.map((item) =>
            Number(item.storeserial) === Number(editingStore.storeserial)
              ? updatedStore
              : item
          )
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

      closeFormModal();
    } catch (error) {
      console.log("Failed to save store:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Something went wrong.",
      });
    }
  };

  // =====================================================
  // DELETE STORE — PERMANENT
  // =====================================================
  const handleDeleteStore = async (storeserial) => {
    const store = stores.find(
      (item) => Number(item.storeserial) === Number(storeserial)
    );

    const result = await Swal.fire({
      title: "Delete this store permanently?",
      html: `
        <p style="margin:0;">
          Are you sure you want to permanently delete
          <strong>${store?.storecode || "this store"}</strong>?
        </p>
        <p style="margin-top:10px;color:#dc2626;font-size:13px;">
          This action cannot be undone.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(storeserial);

      await storeServices.remove(storeserial);

      setStores((prev) =>
        prev.filter((item) => Number(item.storeserial) !== Number(storeserial))
      );

      Swal.fire({
        title: "Deleted!",
        text: "The store has been permanently deleted.",
        icon: "success",
      });
    } catch (error) {
      console.log("Failed to delete store:", error);

      Swal.fire({
        title: "Error!",
        text: error.message || "Could not delete this store.",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // STORE LOGIN MODAL
  // =====================================================
  const openLoginModal = (store) => {
    setLoginStore(store);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginStore(null);
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
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add store
          </button>
        }
      />

      <div className="ag-card">
        {/* ---------- CARD HEADER ---------- */}
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiShoppingBag />
            Stores
          </div>
        </div>

        {/* ---------- SEARCH TOOLBAR ---------- */}
        <div className="sx-toolbar">
          <div className="sx-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by store, email, brand, location or manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="sx-result-count">
            {filteredStores.length} of {stores.length} stores
          </span>
        </div>

        {/* ---------- TABLE ---------- */}
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
                <th>Store login</th>
                <th>Audits</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={11} className="ag-empty-state">
                    {stores.length === 0
                      ? "No stores yet."
                      : "No stores match your search."}
                  </td>
                </tr>
              )}

              {filteredStores.map((store, index) => (
                <tr key={store.storeserial}>
                  <td data-label="Sl. No.">{index + 1}</td>

                  <td data-label="Store code">
                    <strong>{store.storecode}</strong>
                  </td>

                  <td data-label="Email">{store.email || "-"}</td>

                  <td data-label="Brand">{store.brandname || "-"}</td>

                  <td data-label="Location">{store.locationname || "-"}</td>

                  <td data-label="Ops manager">
                    {store.opsmanagername || "-"}
                  </td>

                  <td data-label="Store manager">
                    {store.storemanagername || "-"}
                  </td>

                  <td data-label="Store login">
                    <div className="ag-row-actions">
                      <button
                        type="button"
                        className="ag-btn ag-btn-ghost ag-btn-sm"
                        title="Set or update store login password"
                        onClick={() => openLoginModal(store)}
                      >
                        <FiKey />
                        {store.haslogin ? "Update password" : "Set password"}
                      </button>
                      {store.haslogin ? (
                        <span className="sx-badge sx-badge-success">
                          <FiCheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="sx-badge sx-badge-muted">
                          Not set
                        </span>
                      )}
                    </div>
                  </td>

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

                  <td data-label="Delete">
                    <div className="ag-row-actions">
                      <button
                        type="button"
                        className="ag-icon-btn delete"
                        title="Delete permanently"
                        onClick={() => handleDeleteStore(store.storeserial)}
                        disabled={deletingId === store.storeserial}
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

      {/* ---------- ADD / EDIT STORE MODAL ---------- */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
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

      {/* ---------- STORE LOGIN MODAL ---------- */}
      <StoreLoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        store={loginStore}
      />
    </div>
  );
};

export default Stores;