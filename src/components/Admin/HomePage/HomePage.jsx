import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiShoppingBag,
    FiTag,
    FiMapPin,
    FiUserCheck,
    FiUser,
    FiUsers,
    FiClipboard,
    FiPlayCircle,
    FiInbox,
    FiAward,
} from "react-icons/fi";

import { useAuth } from "../../Authcontext/Authcontext";

import storeServices from "../../../services/StoreServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import OpsManagerServices from "../../../services/OpsManagerServices";
import storeManagerServices from "../../../services/StoreManagerServices";
import usersServices from "../../../services/UserServices";
import auditServices from "../../../services/AuditorServices";

import { filterMyTaskAudits } from "../../../utils/auditWorkflow";

import LoadingState from "../Shared/LoadingState";
import "../Shared/theme.css";
import "./HomePage.css";

const HomePage = () => {

    const { user: currentUser } = useAuth();

    const [audits, setAudits] = useState([]);
    const [stores, setStores] = useState([]);
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [opsManagers, setOpsManagers] = useState([]);
    const [storeManagers, setStoreManagers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.RoleID !== 1) return;

        const getUsers = async () => {
            try {
                const data = await usersServices.index();
                setUsers(data);
            } catch (error) {
                console.log(error);
            }
        };
        getUsers();
    }, [currentUser?.RoleID]);


    useEffect(() => {
        if (currentUser?.RoleID !== 1) return;

        const getStoreManagers = async () => {
            try {
                const data = await storeManagerServices.index();
                setStoreManagers(data);
            } catch (error) {
                console.log(error);
            }
        };
        getStoreManagers();
    }, [currentUser?.RoleID]);

    useEffect(() => {
        const getAudits = async () => {
            try {
                const data = await auditServices.index();
                setAudits(Array.isArray(data) ? data : []);
            } catch (error) {
                console.log(error);
            }
        };
        if (currentUser) getAudits();
    }, [currentUser]);

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
        if (currentUser?.RoleID !== 1) return;

        const getBrands = async () => {
            try {
                const data = await brandService.index();
                setBrands(data);
            } catch (error) {
                console.log(error);
            }
        };
        getBrands();
    }, [currentUser?.RoleID]);

    useEffect(() => {
        if (currentUser?.RoleID !== 1) return;

        const getLocations = async () => {
            try {
                const data = await locationServices.index();
                setLocations(data);
            } catch (error) {
                console.log(error);
            }
        };
        getLocations();
    }, [currentUser?.RoleID]);

    useEffect(() => {
        if (currentUser?.RoleID !== 1) return;

        const getOpsManagers = async () => {
            try {
                const data = await OpsManagerServices.index();
                setOpsManagers(data);
            } catch (error) {
                console.log(error);
            }
        };
        getOpsManagers();
    }, [currentUser?.RoleID]);


    const roleName = {
        1: "Admin",
        2: "Ops Manager",
        3: "Store Manager",
        4: "Auditor",
        5: "Audit Manager",
    }[currentUser?.RoleID];


    const heroMessage = {
        1: {
            title: `Welcome back, ${currentUser?.UserName}`,
            description:
                "Manage users, stores, brands, locations, and audit settings from one centralized dashboard.",
        },
        2: {
            title: `Welcome back, ${currentUser?.UserName}`,
            description:
                "Monitor audit points, oversee store performance, and ensure operational excellence across your assigned locations.",
        },
        3: {
            title: `Welcome back, ${currentUser?.UserName}`,
            description:
                "Review store operations and act on audit findings related to your assigned stores.",
        },
        4: {
            title: `Welcome back, ${currentUser?.UserName}`,
            description:
                "Start your assigned audits, record observations, and submit accurate audit reports efficiently.",
        },
        5: {
            title: `Welcome back, ${currentUser?.UserName}`,
            description:
                "Review submitted audits, manage findings, and ensure audit reports are properly completed.",
        },
    };

    const hero = heroMessage[currentUser?.RoleID];

    const pendingCount = filterMyTaskAudits(audits, currentUser).length;

    if (loading) {
        return (
            <div className="ag-main">
                <LoadingState label="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="ag-main">

            <div className="ag-home-hero">
                <h1>{hero.title}</h1>

                <p>{hero.description}</p>

                <span className="ag-role-badge">
                    <FiAward /> {roleName}
                </span>
            </div>

            <div className="ag-section-title">Overview</div>

            <div className="ag-stat-grid">

                <Link to="/tasks" className="ag-stat-card">
                    <div className="ag-stat-icon"><FiInbox /></div>
                    <h3>My Tasks</h3>
                    <div className="ag-stat-value">{pendingCount}</div>
                </Link>

                {currentUser?.RoleID === 1 && (
                    <>
                        <Link to="/stores" className="ag-stat-card">
                            <div className="ag-stat-icon"><FiShoppingBag /></div>
                            <h3>Stores</h3>
                            <div className="ag-stat-value">{stores.length}</div>
                        </Link>

                        <Link to="/brands" className="ag-stat-card">
                            <div className="ag-stat-icon"><FiTag /></div>
                            <h3>Brands</h3>
                            <div className="ag-stat-value">{brands.length}</div>
                        </Link>

                        <Link to="/location" className="ag-stat-card">
                            <div className="ag-stat-icon"><FiMapPin /></div>
                            <h3>Locations</h3>
                            <div className="ag-stat-value">{locations.length}</div>
                        </Link>

                        <Link to="/opsmanagers" className="ag-stat-card">
                            <div className="ag-stat-icon"><FiUserCheck /></div>
                            <h3>Ops Managers</h3>
                            <div className="ag-stat-value">{opsManagers.length}</div>
                        </Link>

                        <Link to="/storemanagers" className="ag-stat-card">
                            <div className="ag-stat-icon"><FiUser /></div>
                            <h3>Store Managers</h3>
                            <div className="ag-stat-value">{storeManagers.length}</div>
                        </Link>

                        <Link to="/users" className="ag-stat-card">
                            <div className="ag-stat-icon"><FiUsers /></div>
                            <h3>Users</h3>
                            <div className="ag-stat-value">{users.length}</div>
                        </Link>
                    </>
                )}

                {(currentUser?.RoleID === 1 ||
                    currentUser?.RoleID === 2 ||
                    currentUser?.RoleID === 3 ||
                    currentUser?.RoleID === 5) && (
                    <Link to="/Audits" className="ag-stat-card">
                        <div className="ag-stat-icon"><FiClipboard /></div>
                        <h3>Audits</h3>
                        <div className="ag-stat-value">{audits.length}</div>
                    </Link>
                )}

                {currentUser?.RoleID === 4 && (
                    <Link to="/audit" className="ag-stat-card">
                        <div className="ag-stat-icon">
                            <FiPlayCircle />
                        </div>
                        <h3>Start Audit</h3>
                        <div className="ag-stat-value">Open</div>
                    </Link>
                )}

            </div>

        </div>
    );
};

export default HomePage;