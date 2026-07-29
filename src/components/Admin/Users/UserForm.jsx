import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import userService from "../../../services/UserServices";

const initialUser = {
    OracleID: "",
    UserName: "",
    Password: "",
    LocationID: null,
    RoleID: ""
};

const UserForm = ({ editingUser, onCancelEdit, onSuccess, locations = [] }) => {
    const [formData, setFormData] = useState(initialUser);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (editingUser) {
            setFormData({
                OracleID: editingUser.oracleid || "",
                UserName: editingUser.username || "",
                Password: "", 
                LocationID: editingUser.locationid || null,
                RoleID: editingUser.roleid || ""
            });
        } else {
            setFormData(initialUser);
        }
        setFormError("");
    }, [editingUser]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const locationOptions = locations.map((location) => ({
        value: location.locationid,
        label: location.locationname,
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!editingUser) {
            if (!formData.OracleID || !formData.UserName || !formData.Password || !formData.LocationID || !formData.RoleID) {
                setFormError("Please fill all fields");
                return;
            }
        } else {
            if (!formData.UserName || !formData.LocationID || !formData.RoleID) {
                setFormError("Please fill all fields");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            if (editingUser) {
                await userService.update(editingUser.userid, {
                    UserName: formData.UserName,
                    LocationID: formData.LocationID,
                    RoleID: formData.RoleID,
                    ...(formData.Password && { Password: formData.Password })
                });
            } else {
                await userService.create(formData);
            }

            Swal.fire({
                icon: "success",
                title: editingUser ? "User Updated" : "User Created",
                timer: 1500,
                showConfirmButton: false
            });

            setFormData(initialUser);
            if (onSuccess) onSuccess();
        } catch (error) {
            setFormError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3>{editingUser ? "Edit User" : "Create User"}</h3>

            <form onSubmit={handleSubmit}>
                {formError && <p style={{ color: "red" }}>{formError}</p>}

                {!editingUser && (
                    <div style={{ marginBottom: "10px" }}>
                        <input
                            type="number"
                            name="OracleID"
                            placeholder="Oracle ID"
                            value={formData.OracleID}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div style={{ marginBottom: "10px" }}>
                    <input
                        type="text"
                        name="UserName"
                        placeholder="User Name"
                        value={formData.UserName}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <input
                        type="password"
                        name="Password"
                        placeholder={editingUser ? "New Password (optional)" : "Password"}
                        value={formData.Password}
                        onChange={handleChange}
                    />
                </div>

             
                <div style={{ marginBottom: "10px" }}>
                    <label>Select Location:</label>
                    <Select
                        options={locationOptions}
                        placeholder="Search Location..."
                        value={
                            locationOptions.find(
                                (option) => option.value === formData.LocationID
                            ) || null
                        }
                        onChange={(selectedOption) =>
                            setFormData({
                                ...formData,
                                LocationID: selectedOption ? selectedOption.value : null
                            })
                        }
                        isSearchable
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <select
                        name="RoleID"
                        value={formData.RoleID}
                        onChange={handleChange}
                    >
                        <option value="">Select Role</option>
                        <option value="2">Ops Manager</option>
                        <option value="3">Auditor</option>
                    </select>
                </div>

                <div>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingUser ? "Update User" : "Create User"}
                    </button>

                    {editingUser && (
                        <button 
                            type="button" 
                            onClick={onCancelEdit} 
                            style={{ marginLeft: "10px" }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UserForm;