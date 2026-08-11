import { useEffect, useState, useCallback } from "react";
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
  5: "Audit Manager"
};

const Users = () => {
  const [users, setUsers] = useState([]);

  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await userService.index();

      setUsers(data);
    } catch (error) {
      setError(error.message);
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

        setLocations(data);
      } catch (error) {
        console.log(error);
      }
    };

    getLocations();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);

    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);

    setEditingUser(null);
  };

  const handleAddUser = async (userData) => {
    try {
      if (editingUser) {
        const updatedUser = await userService.update(
          editingUser.userid,

          {
            UserName: userData.UserName,
            LocationID: userData.LocationID,
            RoleID: userData.RoleID,

            ...(userData.Password && {
              Password: userData.Password,
            }),
          },
        );

        setUsers((prev) =>
          prev.map((user) =>
            user.userid === editingUser.userid ? updatedUser : user,
          ),
        );

        Swal.fire({
          icon: "success",

          title: "Updated!",

          text: "User updated successfully.",
        });
      } else {
        const newUser = await userService.create(userData);

        setUsers((prev) => [...prev, newUser]);

        Swal.fire({
          icon: "success",

          title: "Added!",

          text: "User created successfully.",
        });
      }

      closeModal();
    } catch (error) {
      Swal.fire({
        icon: "error",

        title: "Error!",

        text: error.message,
      });
    }
  };

  const handleDisable = async (user) => {
    const result = await Swal.fire({
      icon: "warning",

      title: `Disable ${user.username}?`,

      text: "User will not be able to login",

      showCancelButton: true,

      confirmButtonText: "Disable",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.disable(user.userid);

      await fetchUsers();

      Swal.fire({
        icon: "success",

        title: "User disabled",

        timer: 1500,

        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",

        title: "Error",

        text: error.message,
      });
    }
  };

  const handleEnable = async (user) => {
    const result = await Swal.fire({
      icon: "question",

      title: `Enable ${user.username}?`,

      showCancelButton: true,

      confirmButtonText: "Enable",
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

        text: error.message,
      });
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      icon: "warning",

      title: `Delete ${user.username}?`,

      text: "This cannot be undone",

      showCancelButton: true,

      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.remove(user.userid);

      setUsers((prev) => prev.filter((item) => item.userid !== user.userid));

      Swal.fire({
        icon: "success",

        title: "Deleted",

        timer: 1500,

        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",

        title: "Error",

        text: error.message,
      });
    }
  };

  const userOptions = users.map((user) => ({
    value: user.userid,

    label: `${user.username} - ${user.oracleid}`,

    user,
  }));

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading users..." />
      </div>
    );
  }

  return (
    <div className="ag-main">
      <PageHeader
        icon={<FiUsers />}
        eyebrow="Access"
        title="Users"
        subtitle="Create system accounts and manage their access."
      />

      <div className="ag-card">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiUsers />
            All users
          </div>

          <button
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus />
            Add user
          </button>
        </div>

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
            onChange={(option) => setSelectedUser(option)}
          />
        </div>

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
              {(selectedUser ? [selectedUser.user] : users).map((user) => (
                <tr key={user.userid}>
                  <td>{user.oracleid}</td>

                  <td>{user.username}</td>

                  <td>{user.locationname}</td>

                  <td>{roleNames[user.roleid]}</td>

                  <td>
                    <span
                      className={`ag-badge ${
                        user.isactive ? "ag-badge-success" : "ag-badge-muted"
                      }`}
                    >
                      {user.isactive ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td>
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(user)}
                      >
                        <FiEdit2 />
                      </button>

                      {user.isactive ? (
                        <button
                          className="ag-icon-btn disable"
                          title="Disable"
                          onClick={() => handleDisable(user)}
                        >
                          <FiSlash />
                        </button>
                      ) : (
                        <button
                          className="ag-icon-btn enable"
                          title="Enable"
                          onClick={() => handleEnable(user)}
                        >
                          <FiUnlock />
                        </button>
                      )}

                      <button
                        className="ag-icon-btn delete"
                        title="Delete"
                        onClick={() => handleDelete(user)}
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
        icon={<FiUsers />}
        title={editingUser ? "Edit user" : "Add new user"}
      >
        <UserForm
          editingUser={editingUser}
          locations={locations}
          handleAddUser={handleAddUser}
          onCancelEdit={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Users;
