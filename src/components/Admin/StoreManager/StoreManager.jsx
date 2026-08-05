import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiMail } from "react-icons/fi";

import storeManagerService from "../../../services/StoreManagerServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";

import StoreManagerForm from "./StoreManagerForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";

const StoreManagers = () => {
  const [storeManagers, setStoreManagers] = useState([]);

  const [brands, setBrands] = useState([]);

  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [editingStoreManager, setEditingStoreManager] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getStoreManagers = async () => {
      try {
        const data = await storeManagerService.index();

        setStoreManagers(data);
      } catch (error) {
        console.log(error);

        setError("Cannot connect to server");
      } finally {
        setLoading(false);
      }
    };

    getStoreManagers();
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
      Swal.fire({
        icon: "error",

        title: "Error!",

        text: "Something went wrong.",
      });
    }
  };

  const handleDeleteStoreManager = async (storemanagerid) => {
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
      await storeManagerService.remove(storemanagerid);

      setStoreManagers((prev) =>
        prev.filter((item) => item.storemanagerid !== storemanagerid),
      );

      Swal.fire({
        title: "Deleted!",

        text: "The Store Manager has been deleted.",

        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",

        text: "Cannot delete this Store Manager.",

        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading store managers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ag-main">
        <div className="ag-card">
          <div className="ag-error-banner">{error}</div>

          <p>
            Please send an email to IT for support.
            <a href="mailto:example.com">
              <FiMail /> Send email
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiUser />}
        eyebrow="Team"
        title="Store Managers"
        subtitle="Manage store managers and their brand / location assignment."
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiUser />
            All store managers
          </div>

          <button
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add store manager
          </button>
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

                <th>Edit</th>

                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {storeManagers.length === 0 && (
                <tr>
                  <td colSpan={7} className="ag-empty-state">
                    No store managers yet.
                  </td>
                </tr>
              )}

              {storeManagers.map((storeManager, index) => (
                <tr key={storeManager.storemanagerid}>
                  <td>{index + 1}</td>

                  <td>{storeManager.storemanagername}</td>

                  <td>{storeManager.oracleid}</td>

                  <td>{storeManager.brandname}</td>

                  <td>{storeManager.locationname}</td>

                  <td>
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(storeManager)}
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
                          handleDeleteStoreManager(storeManager.storemanagerid)
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
