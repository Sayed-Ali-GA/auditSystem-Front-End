import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRotateCcw,
  FiArchive,
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

  const [showArchived, setShowArchived] = useState(false);

  // =========================
  // LOAD LOCATIONS
  // =========================
  const loadLocations = async (includeInactive) => {
    try {
      setLoading(true);

      const data = await locationService.index(includeInactive);

      setLocations(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations(showArchived);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

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
          locationData,
        );

        setLocations((prev) =>
          prev.map((item) =>
            item.locationid === editingLocation.locationid
              ? updatedLocation
              : item,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Location updated successfully.",
        });
      } else {
        const newLocation = await locationService.create(locationData);

        setLocations((prev) => [...prev, newLocation]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Location added successfully.",
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
  // ARCHIVE LOCATION
  // =========================
  const handleArchiveLocation = async (locationid) => {
    const result = await Swal.fire({
      title: "Archive this location?",
      text: "It will be hidden from new stores but kept for historical records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await locationService.remove(locationid);

      setLocations((prev) =>
        prev.filter((item) => item.locationid !== locationid),
      );

      Swal.fire({
        title: "Archived!",
        text: "The location has been archived.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Could not archive this location.",
        icon: "error",
      });
    }
  };

  // =========================
  // RESTORE LOCATION
  // =========================
  const handleRestoreLocation = async (locationid) => {
    try {
      await locationService.restore(locationid);

      setLocations((prev) =>
        prev.filter((item) => item.locationid !== locationid),
      );

      Swal.fire({
        title: "Restored!",
        text: "The location is active again.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error!",
        text: "Could not restore this location.",
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
            <FiMapPin />

            {showArchived
              ? "All locations (incl. archived)"
              : "Active locations"}
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

                <th>Status</th>

                <th>Edit</th>

                <th>Archive / Restore</th>
              </tr>
            </thead>

            <tbody>
              {locations.length === 0 && (
                <tr>
                  <td colSpan={5} className="ag-empty-state">
                    {showArchived
                      ? "No locations found."
                      : "No active locations yet."}
                  </td>
                </tr>
              )}

              {locations.map((location, index) => (
                <tr key={location.locationid}>
                  <td data-label="Sl. No.">{index + 1}</td>

                  <td data-label="Location">{location.locationname}</td>

                  <td data-label="Status">
                    <span
                      className={`ag-badge ${
                        location.isactive
                          ? "ag-badge-success"
                          : "ag-badge-muted"
                      }`}
                    >
                      {location.isactive ? "Active" : "Archived"}
                    </span>
                  </td>

                  <td data-label="Edit">
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(location)}
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>

                  <td data-label="Archive / Restore">
                    <div className="ag-row-actions">
                      {location.isactive ? (
                        <button
                          className="ag-icon-btn delete"
                          title="Archive"
                          onClick={() =>
                            handleArchiveLocation(location.locationid)
                          }
                        >
                          <FiTrash2 />
                        </button>
                      ) : (
                        <button
                          className="ag-icon-btn enable"
                          title="Restore"
                          onClick={() =>
                            handleRestoreLocation(location.locationid)
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
        icon={<FiMapPin />}
        title={editingLocation ? "Edit location" : "Add new location"}
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
