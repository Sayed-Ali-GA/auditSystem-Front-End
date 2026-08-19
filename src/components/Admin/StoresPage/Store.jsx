import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClipboard,
  FiKey,
} from "react-icons/fi";

import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import storeServices from "../../../services/StoreServices";
import OpsManagerServices from "../../../services/OpsManagerServices";
import storeManagerServices from "../../../services/StoreManagerServices";
import userService from "../../../services/UserServices";

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
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // LOAD STORES
  // =====================================================
  const loadStores = async () => {
    try {
      setLoading(true);

      const data = await storeServices.index();

      console.log("Stores:", data);

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
          storeData
        );

        setStores((prev) =>
          prev.map((item) =>
            Number(item.storeserial) ===
            Number(editingStore.storeserial)
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

      closeModal();
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
      (item) =>
        Number(item.storeserial) === Number(storeserial)
    );

    const result = await Swal.fire({
      title: "Delete this Store permanently?",
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
        prev.filter(
          (item) =>
            Number(item.storeserial) !== Number(storeserial)
        )
      );

      Swal.fire({
        title: "Deleted!",
        text: "The Store has been permanently deleted.",
        icon: "success",
      });
    } catch (error) {
      console.log("Failed to delete Store:", error);

      Swal.fire({
        title: "Error!",
        text:
          error.message ||
          "Could not delete this Store.",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // SET / UPDATE STORE LOGIN PASSWORD
  // =====================================================
  const handleSetStoreLogin = async (store) => {
    const { value: password } = await Swal.fire({
      title: `Set login password for ${store.storecode}`,
      html: `
        <p style="
          font-size:13px;
          color:#6b7280;
          margin:0 0 10px;
          text-align:left;
        ">
          This creates/updates a login account tied to the
          <b>store itself</b>
          (Store Code = ${store.storecode}).
          It stays the same even if the assigned Store Manager
          changes later.
        </p>
      `,
      input: "password",
      inputPlaceholder: "New login password (min 4 characters)",
      showCancelButton: true,
      confirmButtonText: "Save password",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value || value.length < 4) {
          return "Password must be at least 4 characters.";
        }
      },
    });

    if (!password) return;

    try {
      await userService.setStoreLogin(
        store.storeserial,
        password
      );

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `Login password set for store ${store.storecode}. Use Store Login on the sign-in page with this Store Code.`,
      });
    } catch (error) {
      console.log("Failed to set store login:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.message ||
          "Could not set the store login password.",
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
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add store
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
            Stores
          </div>


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
                <th>Store login</th>
                <th>Audits</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {stores.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="ag-empty-state"
                  >
                    No stores yet.
                  </td>
                </tr>
              )}

              {stores.map((store, index) => (
                <tr key={store.storeserial}>
                  {/* Sl. No. */}
                  <td data-label="Sl. No.">
                    {index + 1}
                  </td>

                  {/* Store Code */}
                  <td data-label="Store code">
                    {store.storecode}
                  </td>

                  {/* Email */}
                  <td data-label="Email">
                    {store.email || "-"}
                  </td>

                  {/* Brand */}
                  <td data-label="Brand">
                    {store.brandname}
                  </td>

                  {/* Location */}
                  <td data-label="Location">
                    {store.locationname}
                  </td>

                  {/* Ops Manager */}
                  <td data-label="Ops manager">
                    {store.opsmanagername}
                  </td>

                  {/* Store Manager */}
                  <td data-label="Store manager">
                    {store.storemanagername}
                  </td>

                  {/* Store Login */}
                  <td data-label="Store login">
                    <div className="ag-row-actions">
                      <button
                        type="button"
                        className="ag-btn ag-btn-ghost ag-btn-sm"
                        title="Set / update store login password"
                        onClick={() =>
                          handleSetStoreLogin(store)
                        }
                      >
                        <FiKey />
                        Set login
                      </button>
                    </div>
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
                        onClick={() =>
                          openEditModal(store)
                        }
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>

                  {/* Delete */}
                  <td data-label="Delete">
                    <div className="ag-row-actions">
                      <button
                        type="button"
                        className="ag-icon-btn delete"
                        title="Delete permanently"
                        onClick={() =>
                          handleDeleteStore(
                            store.storeserial
                          )
                        }
                        disabled={
                          deletingId ===
                          store.storeserial
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

      {/* =====================================================
          STORE MODAL
      ===================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        icon={<FiShoppingBag />}
        title={
          editingStore
            ? "Edit store"
            : "Add new store"
        }
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