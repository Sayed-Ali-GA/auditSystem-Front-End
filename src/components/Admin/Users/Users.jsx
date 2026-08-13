import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import {
  FiUsers,
  FiEdit2,
  FiSlash,
  FiUnlock,
  FiTrash2,
  FiSearch,
  FiPlus,
} from "react-icons/fi";

import Select from "react-select";

import userService from "../../../services/UserServices";
import locationServices from "../../../services/locationServices";

import UserForm from "./UserForm";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";

import "../Shared/theme.css";
import "./Users.css";

const roleNames = {
  1: "Admin",
  2: "Ops Manager",
  3: "Store Manager",
  4: "Auditor",
  5: "Audit Manager",
};

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /*
   * role from URL
   *
   * /users/create?role=3
   *
   * 3 = Store Manager
   * 2 = Ops Manager
   */
  const roleFromUrl = searchParams.get("role");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await userService.index();

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load users:", error);

      setError(error.message || "Cannot load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await locationServices.index();

        setLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    };

    getLocations();
  }, []);

  // ==========================================
  // OPEN ADD USER
  // ==========================================
  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================
  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // ==========================================
  // CLOSE
  // ==========================================
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);

    // Remove ?role=...
    if (roleFromUrl) {
      setSearchParams({});
    }
  };

  // ==========================================
  // ADD / UPDATE
  // ==========================================
  const handleAddUser = async (userData) => {
    try {
      if (editingUser) {
        const updatedUser = await userService.update(
          editingUser.userid,
          {
            UserName: userData.UserName,
            LocationID: userData.LocationID,
            RoleID: userData.RoleID,

            ...(userData.Password
              ? {
                  Password: userData.Password,
                }
              : {}),
          },
        );

        setUsers((prev) =>
          prev.map((user) =>
            user.userid === editingUser.userid
              ? {
                  ...user,
                  ...updatedUser,
                }
              : user,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "User updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const newUser = await userService.create(userData);

        setUsers((prev) => [...prev, newUser]);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "User created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      closeModal();
    } catch (error) {
      console.error("Failed to save user:", error);

      throw error;
    }
  };

  // ==========================================
  // DISABLE
  // ==========================================
  const handleDisable = async (user) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Disable ${user.username}?`,
      text: "This user will not be able to login.",
      showCancelButton: true,
      confirmButtonText: "Disable",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await userService.disable(user.userid);

      await fetchUsers();

      Swal.fire({
        icon: "success",
        title: "User disabled",
        text: `${user.username} can no longer login.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Could not disable user.",
      });
    }
  };

  // ==========================================
  // ENABLE
  // ==========================================
  const handleEnable = async (user) => {
    const result = await Swal.fire({
      icon: "question",
      title: `Enable ${user.username}?`,
      text: "This user will be able to login again.",
      showCancelButton: true,
      confirmButtonText: "Enable",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await userService.enable(user.userid);

      await fetchUsers();

      Swal.fire({
        icon: "success",
        title: "User enabled",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Could not enable user.",
      });
    }
  };

  // ==========================================
  // DELETE
  // ==========================================
  const handleDelete = async (user) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Delete ${user.username}?`,
      text: "This permanently removes the user account. If this account is referenced by audits, the server may reject the operation.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.remove(user.userid);

      setUsers((prev) =>
        prev.filter((item) => item.userid !== user.userid),
      );

      if (selectedUser?.user?.userid === user.userid) {
        setSelectedUser(null);
      }

      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete user",
        text:
          error.message ||
          "This user may be linked to existing records.",
      });
    }
  };

  // ==========================================
  // SEARCH OPTIONS
  // ==========================================
  const userOptions = users.map((user) => ({
    value: user.userid,
    label: `${user.username} - ${user.oracleid}`,
    user,
  }));

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading users..." />
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <div className="ag-main">
        <div className="ag-card">
          <div className="ag-error-banner">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiUsers />}
        eyebrow="Access"
        title="Users"
        subtitle="Create system accounts and manage their access."
      />

      <div className="ag-card">
        {/* HEADER */}
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiUsers />
            All users
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add user
          </button>
        </div>

        {/* SEARCH */}
        <div
          className="ag-field"
          style={{
            maxWidth: 360,
            marginBottom: 18,
          }}
        >
          <label>
            <FiSearch />
            Search
          </label>

          <Select
            classNamePrefix="ag-rs"
            options={userOptions}
            placeholder="Search user..."
            isClearable
            value={selectedUser}
            onChange={setSelectedUser}
          />
        </div>

        {/* TABLE */}
        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Oracle ID</th>
                <th>Username</th>
                <th>Location</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {(selectedUser
                ? [selectedUser.user]
                : users
              ).map((user) => {
                const isActive =
                  user.isactive === true ||
                  user.isactive === "true" ||
                  user.isactive === 1 ||
                  user.isactive === "1";

                return (
                  <tr key={user.userid}>
                    <td data-label="Oracle ID">
                      {user.oracleid}
                    </td>

                    <td data-label="Username">
                      {user.username}
                    </td>

                    <td data-label="Location">
                      {user.locationname || "-"}
                    </td>

                    <td data-label="Role">
                      {roleNames[user.roleid] || "Unknown"}
                    </td>

                    <td data-label="Status">
                      <span
                        className={`ag-badge ${
                          isActive
                            ? "ag-badge-success"
                            : "ag-badge-muted"
                        }`}
                      >
                        {isActive ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td data-label="Actions">
                      <div className="ag-row-actions">
                        <button
                          type="button"
                          className="ag-icon-btn edit"
                          title="Edit"
                          onClick={() =>
                            openEditModal(user)
                          }
                        >
                          <FiEdit2 />
                        </button>

                        {isActive ? (
                          <button
                            type="button"
                            className="ag-icon-btn disable"
                            title="Disable"
                            onClick={() =>
                              handleDisable(user)
                            }
                          >
                            <FiSlash />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ag-icon-btn enable"
                            title="Enable"
                            onClick={() =>
                              handleEnable(user)
                            }
                          >
                            <FiUnlock />
                          </button>
                        )}

                        <button
                          type="button"
                          className="ag-icon-btn delete"
                          title="Delete"
                          onClick={() =>
                            handleDelete(user)
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="ag-empty-state"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        icon={<FiUsers />}
        title={
          editingUser
            ? "Edit user"
            : roleFromUrl === "2"
              ? "Add Ops Manager"
              : roleFromUrl === "3"
                ? "Add Store Manager"
                : "Add new user"
        }
      >
        <UserForm
          editingUser={editingUser}
          locations={locations}
          handleAddUser={handleAddUser}
          onCancelEdit={closeModal}
          forcedRole={roleFromUrl}
        />
      </Modal>
    </div>
  );
};

export default Users;