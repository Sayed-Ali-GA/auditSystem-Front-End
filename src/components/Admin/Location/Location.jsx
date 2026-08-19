import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

import locationService from "../../../services/locationServices";
import LocationForm from "./LocationForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =========================
  // LOAD LOCATIONS
  // =========================
  const loadLocations = async () => {
    try {
      setLoading(true);

      const data = await locationService.index();

      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Locations Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not load locations.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // =========================
  // MODAL
  // =========================
  const openAddModal = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  // =========================
  // ADD / UPDATE
  // =========================
  const handleAddLocation = async (locationData) => {
    try {
      if (editingLocation) {
        const updatedLocation = await locationService.update(
          editingLocation.locationid,
          locationData
        );

        setLocations((prev) =>
          prev.map((item) =>
            item.locationid === editingLocation.locationid
              ? updatedLocation
              : item
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Location updated successfully.",
        });
      } else {
        const newLocation =
          await locationService.create(locationData);

        setLocations((prev) => [...prev, newLocation]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Location added successfully.",
        });
      }

      closeModal();
    } catch (error) {
      console.error("Save Location Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong.",
      });
    }
  };

  // =========================
  // DELETE LOCATION — PERMANENT
  // =========================
  const handleDelete = async (locationid) => {
    const result = await Swal.fire({
      title: "Delete this location permanently?",
      text: "This cannot be undone. The location will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(locationid);

      await locationService.remove(locationid);

      setLocations((prev) =>
        prev.filter(
          (item) =>
            Number(item.locationid) !== Number(locationid)
        )
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Location permanently deleted.",
      });
    } catch (error) {
      console.error("Delete Location Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not delete the location.",
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
        <LoadingState label="Loading locations..." />
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiMapPin />}
        eyebrow="Network"
        title="Locations"
        subtitle="Manage the cities and areas used across stores."
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiMapPin />
            All locations
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add location
          </button>
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Location</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="ag-empty-state">
                    No locations yet.
                  </td>
                </tr>
              ) : (
                locations.map((location, index) => (
                  <tr key={location.locationid}>
                    <td data-label="Sl. No.">
                      {index + 1}
                    </td>

                    <td data-label="Location">
                      {location.locationname}
                    </td>

                    <td data-label="Edit">
                      <div className="ag-row-actions">
                        <button
                          type="button"
                          className="ag-icon-btn edit"
                          title="Edit"
                          onClick={() =>
                            openEditModal(location)
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
                            handleDelete(location.locationid)
                          }
                          disabled={
                            deletingId === location.locationid
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
        icon={<FiMapPin />}
        title={
          editingLocation
            ? "Edit location"
            : "Add new location"
        }
      >
        <LocationForm
          handleAddLocation={handleAddLocation}
          editingLocation={editingLocation}
        />
      </Modal>
    </div>
  );
};

export default Location;