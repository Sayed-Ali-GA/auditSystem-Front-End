import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import userService from "../../../services/UserServices";
import locationServices from "../../../services/locationServices";
import UserForm from "./UserForm"; 

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [locations, setLocations] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await userService.index();
            setUsers(data);
        } catch (err) {
            setError(err.message || "Failed to load users.");
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


    const handleDisable = async (user) => {
        const result = await Swal.fire({
            icon: "warning",
            title: `Disable ${user.username}?`,
            text: "User will not be able to login",
            showCancelButton: true,
            confirmButtonText: "Disable",
            confirmButtonColor: "#d33"
        });

        if (!result.isConfirmed) return;

        try {
            await userService.disable(user.userid);
            await fetchUsers();
            Swal.fire({
                icon: "success",
                title: "User Disabled",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message
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
            confirmButtonColor: "#d33"
        });

        if (!result.isConfirmed) return;

        try {
            await userService.remove(user.userid);
            await fetchUsers();
            Swal.fire({
                icon: "success",
                title: "User Deleted",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message
            });
        }
    };



    const handleEnable = async (user) => {
    const result = await Swal.fire({
        icon: "question",
        title: `Enable ${user.username}?`,
        text: "User will be able to login again",
        showCancelButton: true,
        confirmButtonText: "Enable",
        confirmButtonColor: "#28a745"
    });

    if (!result.isConfirmed) return;
    try {
        await userService.enable(user.userid);
        await fetchUsers();

        Swal.fire({
            icon: "success",
            title: "User Enabled",
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });
    }
};


    const userOptions = users.map(user => ({
        value: user.userid,
        label: `${user.username} - ${user.oracleid}`,
        user
    }));



    return (
        <div style={{ padding: "20px" }}>
            <UserForm 
                editingUser={editingUser} 
                locations={locations}
                onCancelEdit={() => setEditingUser(null)} 
                onSuccess={() => {
                    setEditingUser(null);
                    fetchUsers();
                }} 
            />

            <hr style={{ margin: "30px 0" }} />

            <label htmlFor="Search"> Search: 
                <Select
                    options={userOptions}
                    placeholder="Search by Oracle ID or Name..."
                    isClearable
                    onChange={(option) => {
                        setSelectedUser(option);
                    }}
                />
            </label>
            <h2>All Users</h2>

            {loading && <p>Loading users...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Users Table */}
            {!loading && !error && (
                <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                       {(selectedUser ? [selectedUser.user] : users).map(user => (
                            <tr key={user.userid}>
                                <td>{user.oracleid}</td>
                                <td>{user.username}</td>
                                <td>{user.locationname}</td>
                                <td>
                                    {
                                        {
                                            1: "Admin",
                                            2: "Ops Manager",
                                            3: "Auditor"
                                        }[user.roleid] || "-"
                                    }
                                </td>
                                <td>
                                    <span>
                                        {user.isactive ? "Active" : "Disabled"}
                                    </span>
                                </td>
                                <td>

                                    <button
                                        onClick={() => setEditingUser(user)}
                                        style={{ marginRight: "5px" }}
                                    >
                                        Edit
                                    </button>


                                    {user.isactive ? (
                                        <button
                                            onClick={() => handleDisable(user)}
                                            style={{ marginRight: "5px" }}
                                        >
                                            Disable
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEnable(user)}
                                            style={{ marginRight: "5px" }}
                                        >
                                            Enable
                                        </button>
                                    )}


                                    <button
                                        onClick={() => handleDelete(user)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Users;