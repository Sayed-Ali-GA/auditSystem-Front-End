import { useEffect, useState, useCallback, useMemo } from "react";
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

const ROLE_FILTER_OPTIONS = Object.entries(roleNames).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

const isUserActive = (user) =>
  user.isactive === true ||
  user.isactive === "true" ||
  user.isactive === 1 ||
  user.isactive === "1";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

const SkeletonRows = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <tr className="ag-skeleton-row" key={`skeleton-${index}`}>
        {Array.from({ length: 6 }).map((__, cellIndex) => (
          <td key={cellIndex}>
            <div
              className="ag-skeleton-bar"
              style={{ width: cellIndex === 5 ? "70%" : "85%" }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState(null);

  /*
   * role from URL
   *
   * /users/create?role=3
   *
   * 3 = Store Manager
   * 2 = Ops Manager
   */
  const roleFromUrl = searchParams.get("role");

  const oracleIdFromUrl = searchParams.get("oracleId");
  const userNameFromUrl = searchParams.get("userName");
  const locationIdFromUrl = searchParams.get("locationId");

  useEffect(() => {
    if (oracleIdFromUrl) {
      setEditingUser(null);
      setIsModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oracleIdFromUrl]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await userService.index();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(err.message || "Cannot load users.");
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
      } catch (err) {
        console.error("Failed to load locations:", err);
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

    if (roleFromUrl || oracleIdFromUrl) {
      setSearchParams({});
    }
  };

  // ==========================================
  // ADD / UPDATE
  // ==========================================
  const handleAddUser = async (userData) => {
    try {
      if (editingUser) {
        const updatedUser = await userService.update(editingUser.userid, {
          UserName: userData.UserName,
          LocationID: userData.LocationID,
          RoleID: userData.RoleID,
          Email: userData.Email,

          ...(userData.Password
            ? {
                Password: userData.Password,
              }
            : {}),
        });

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
    } catch (err) {
      console.error("Failed to save user:", err);

      throw err;
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
      confirmButtonColor: "#dc2626",
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
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not disable user.",
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
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not enable user.",
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

      setUsers((prev) => prev.filter((item) => item.userid !== user.userid));

      if (selectedUser?.user?.userid === user.userid) {
        setSelectedUser(null);
      }

      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete user",
        text: err.message || "This user may be linked to existing records.",
      });
    }
  };

  // ==========================================
  // SEARCH OPTIONS (quick jump-to-user)
  // ==========================================
  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.userid,
        label: `${user.username} - ${user.oracleid}`,
        user,
      })),
    [users],
  );

  // ==========================================
  // FILTERING
  // ==========================================
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      if (selectedUser && user.userid !== selectedUser.value) return false;

      if (statusFilter === "active" && !isUserActive(user)) return false;
      if (statusFilter === "disabled" && isUserActive(user)) return false;

      if (roleFilter && String(user.roleid) !== roleFilter.value) return false;

      if (!term) return true;

      const haystack = [
        user.username,
        user.oracleid,
        user.email,
        user.locationname,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [users, selectedUser, statusFilter, roleFilter, searchTerm]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    statusFilter !== "all" ||
    Boolean(roleFilter) ||
    Boolean(selectedUser);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter(null);
    setSelectedUser(null);
  };

  // ==========================================
  // ERROR (no data at all)
  // ==========================================
  if (error && users.length === 0 && !loading) {
    return (
      <div className="ag-main">
        <PageHeader
          icon={<FiUsers />}
          eyebrow="Access"
          title="Users"
          subtitle="Create system accounts and manage their access."
        />

        <div className="ag-card">
          <div className="ag-error-banner" role="alert">
            {error}
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-ghost"
            onClick={fetchUsers}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const prefillData = oracleIdFromUrl
    ? {
        oracleId: oracleIdFromUrl,
        userName: userNameFromUrl || "",
        role: roleFromUrl || "",
        locationId: locationIdFromUrl ? Number(locationIdFromUrl) : null,
      }
    : null;

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
            {!loading && (
              <span className="ag-card-title-count">
                {filteredUsers.length} of {users.length}
              </span>
            )}
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

        {/* TOOLBAR: search + filters */}
        <div className="ag-toolbar">
          <div className="ag-search-field">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name, Oracle ID, email, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users"
            />
          </div>

          <div
            className="ag-filter-group"
            role="group"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`ag-chip ${statusFilter === filter.value ? "is-active" : ""}`}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="ag-role-filter">
            <Select
              classNamePrefix="ag-rs"
              options={ROLE_FILTER_OPTIONS}
              placeholder="Filter by role"
              isClearable
              value={roleFilter}
              onChange={setRoleFilter}
              aria-label="Filter by role"
            />
          </div>

          <div style={{ minWidth: 220, flex: "1 1 220px", maxWidth: 320 }}>
            <Select
              classNamePrefix="ag-rs"
              options={userOptions}
              placeholder="Jump to a specific user..."
              isClearable
              value={selectedUser}
              onChange={setSelectedUser}
              aria-label="Jump to a specific user"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="ag-toolbar-reset"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {error && users.length > 0 && (
          <div className="ag-error-banner" role="alert">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Oracle ID</th>
                <th>Location</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && <SkeletonRows />}

              {!loading &&
                filteredUsers.map((user) => {
                  const active = isUserActive(user);

                  return (
                    <tr key={user.userid}>
                      <td data-label="User">
                        <div className="ag-user-cell">
                          <span className="ag-avatar">
                            {getInitials(user.username)}
                          </span>
                          <div>
                            <div className="ag-user-name">{user.username}</div>
                            {user.email && (
                              <div className="ag-user-sub">{user.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td data-label="Oracle ID" className="ag-mono">
                        {user.oracleid}
                      </td>

                      <td data-label="Location">{user.locationname || "-"}</td>

                      <td data-label="Role">
                        <span className="ag-role-pill">
                          {roleNames[user.roleid] || "Unknown"}
                        </span>
                      </td>

                      <td data-label="Status">
                        <span
                          className={`ag-badge ${active ? "ag-badge-success" : "ag-badge-muted"}`}
                        >
                          {active ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <div className="ag-row-actions">
                          <button
                            type="button"
                            className="ag-icon-btn edit"
                            title="Edit"
                            aria-label={`Edit ${user.username}`}
                            onClick={() => openEditModal(user)}
                          >
                            <FiEdit2 />
                          </button>

                          {active ? (
                            <button
                              type="button"
                              className="ag-icon-btn disable"
                              title="Disable"
                              aria-label={`Disable ${user.username}`}
                              onClick={() => handleDisable(user)}
                            >
                              <FiSlash />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="ag-icon-btn enable"
                              title="Enable"
                              aria-label={`Enable ${user.username}`}
                              onClick={() => handleEnable(user)}
                            >
                              <FiUnlock />
                            </button>
                          )}

                          <button
                            type="button"
                            className="ag-icon-btn delete"
                            title="Delete"
                            aria-label={`Delete ${user.username}`}
                            onClick={() => handleDelete(user)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="ag-empty-state">
                    <div className="ag-empty-state-title">No users yet</div>
                    Add your first system account to get started.
                  </td>
                </tr>
              )}

              {!loading && users.length > 0 && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="ag-empty-state">
                    <div className="ag-empty-state-title">
                      No users match your filters
                    </div>
                    Try a different search term or{" "}
                    <button
                      type="button"
                      className="ag-toolbar-reset"
                      style={{ display: "inline", padding: 0 }}
                      onClick={resetFilters}
                    >
                      clear filters
                    </button>
                    .
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
          prefillData={prefillData}
        />
      </Modal>
    </div>
  );
};

export default Users;
