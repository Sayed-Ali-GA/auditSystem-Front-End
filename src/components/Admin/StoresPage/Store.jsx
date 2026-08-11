import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiEdit2, FiTrash2, FiPlus, FiClipboard } from "react-icons/fi";

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

  useEffect(() => {
    const getStores = async () => {
      try {
        const data = await storeServices.index();

        setStores(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getStores();
  }, []);

  useEffect(() => {
    const getBrands = async () => {
      try {
        const data = await brandService.index();

        setBrands(data);
      } catch (error) {
        console.log(error);
      }
    };

    getBrands();
  }, []);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await locationServices.index();

        setLocations(data);
      } catch (error) {
        console.log(error);
      }
    };

    getLocations();
  }, []);

  useEffect(() => {
    const getOpsManagers = async () => {
      try {
        const data = await OpsManagerServices.index();

        setOpsManagers(data);
      } catch (error) {
        console.log(error);
      }
    };

    getOpsManagers();
  }, []);

  useEffect(() => {
    const getStoreManagers = async () => {
      try {
        const data = await storeManagerServices.index();

        setStoreManagers(data);
      } catch (error) {
        console.log(error);
      }
    };

    getStoreManagers();
  }, []);

  const openAddModal = () => {
    setEditingStore(null);

    setIsModalOpen(true);
  };

  const openEditModal = (store) => {
    setEditingStore(store);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);

    setEditingStore(null);
  };

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
      Swal.fire({
        icon: "error",

        title: "Error!",

        text: "Something went wrong.",
      });
    }
  };

  const handleDeleteStore = async (storeserial) => {
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
      await storeServices.remove(storeserial);

      setStores((prev) =>
        prev.filter((item) => item.storeserial !== storeserial),
      );

      Swal.fire({
        title: "Deleted!",

        text: "The Store has been deleted.",

        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",

        text: "Failed to delete the Store.",

        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading stores..." />
      </div>
    );
  }

  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiShoppingBag />}
        eyebrow="Network"
        title="Stores"
        subtitle="Manage stores and their brand, location and management assignments."
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiShoppingBag />
            All stores
          </div>

          <button
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add store
          </button>
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Sl. No.</th>

                <th>Store code</th>

                <th>Brand</th>

                <th>Location</th>

                <th>Ops manager</th>

                <th>Store manager</th>

                <th>Audits</th>

                <th>Edit</th>

                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {stores.length === 0 && (
                <tr>
                  <td colSpan={9} className="ag-empty-state">
                    No stores yet.
                  </td>
                </tr>
              )}

              {stores.map((store, index) => (
                <tr key={store.storeserial}>
                  <td>{index + 1}</td>

                  <td>{store.storecode}</td>

                  <td>{store.brandname}</td>

                  <td>{store.locationname}</td>

                  <td>{store.opsmanagername}</td>

                  <td>{store.storemanagername}</td>

                  <td>
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

                  <td>
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(store)}
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
                        onClick={() => handleDeleteStore(store.storeserial)}
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