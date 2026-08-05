import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiMapPin, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

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

  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await locationService.index();

        setLocations(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getLocations();
  }, []);

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
      Swal.fire({
        icon: "error",

        title: "Error!",

        text: "Something went wrong.",
      });
    }
  };

  const handleDeleteLocation = async (locationid) => {
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
      await locationService.remove(locationid);

      setLocations((prev) =>
        prev.filter((item) => item.locationid !== locationid),
      );

      Swal.fire({
        title: "Deleted!",

        text: "The location has been deleted.",

        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",

        text: "This location is assigned to one or more.",

        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading locations..." />
      </div>
    );
  }

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
              {locations.length === 0 && (
                <tr>
                  <td colSpan={4} className="ag-empty-state">
                    No locations yet.
                  </td>
                </tr>
              )}

              {locations.map((location, index) => (
                <tr key={location.locationid}>
                  <td>{index + 1}</td>

                  <td>{location.locationname}</td>

                  <td>
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

                  <td>
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn delete"
                        title="Delete"
                        onClick={() =>
                          handleDeleteLocation(location.locationid)
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
