import { Routes, Route } from "react-router-dom";

import {
    AuthProvider,
    useAuth,
} from "./components/Authcontext/Authcontext";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";

// Admin
import Users from "./components/Admin/Users/Users";
import Sidebar from "./components/Admin/Sidebar/Sidebar";
import Brands from "./components/Admin/Brands/Brands";
import Criteria from "./components/Admin/Criteria/Criteria";
import Location from "./components/Admin/Location/Location";
import OpsManager from "./components/Admin/OpsManager/OpsManager";
import StoreManagers from "./components/Admin/StoreManager/StoreManager";
import Stores from "./components/Admin/StoresPage/Store";
import AuditPoint from "./components/Admin/AuditPoints/AuditPoints";
import HomePage from "./components/Admin/HomePage/HomePage";
import Reports from "./components/Admin/Reports/Reports";

// Login
import Login from "./components/Login/Login";

// Employee / Audit
import MyTasks from "./components/Employee/Audit/MyTasks";
import AuditDetails from "./components/Employee/Audit/AuditDetails";
import AuditForm from "./components/Employee/Audit/AuditForm";
import AuditsList from "./components/Employee/Audit/Auditslist";
import AuditView from "./components/Employee/Audit/Auditview";

// Layout
import NavBar from "./components/NavBar/NavBar";
import NotFound from "./components/Admin/Shared/NotFound";

// Roles
import { ROLES } from "./constants/roles";

import "./App.css";


function AppShell() {

    const { isAuthenticated } = useAuth();

    return (
        <div className="app">

            {/* Sidebar */}
            {isAuthenticated && <Sidebar />}

            <div className="main-layout">

                {/* Navbar */}
                {isAuthenticated && <NavBar />}

                <main className="content">

                    <Routes>

                        {/* =====================================================
                            PUBLIC
                        ====================================================== */}

                        <Route element={<PublicRoute />}>

                            <Route
                                path="/login"
                                element={<Login />}
                            />

                        </Route>


                        {/* =====================================================
                            ALL AUTHENTICATED USERS
                        ====================================================== */}

                        <Route element={<ProtectedRoute />}>

                            {/* Home is available to everyone */}
                            <Route
                                path="/"
                                element={<HomePage />}
                            />


                            {/* =================================================
                                ADMIN
                            ================================================== */}

                            <Route
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[ROLES.ADMIN]}
                                    />
                                }
                            >

                                <Route
                                    path="/users"
                                    element={<Users />}
                                />

                                <Route
                                    path="/brands"
                                    element={<Brands />}
                                />

                                <Route
                                    path="/criteria"
                                    element={<Criteria />}
                                />

                                <Route
                                    path="/location"
                                    element={<Location />}
                                />

                                <Route
                                    path="/opsmanagers"
                                    element={<OpsManager />}
                                />

                                <Route
                                    path="/storemanagers"
                                    element={<StoreManagers />}
                                />

                                <Route
                                    path="/stores"
                                    element={<Stores />}
                                />

                            </Route>


                            {/* =================================================
                                AUDIT POINT

                                Sidebar:
                                Admin
                                Audit Manager

                                Ops Manager -> NOT visible
                                Store Manager -> NOT visible
                                Auditor -> NOT visible
                            ================================================== */}

                            <Route
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            ROLES.ADMIN,
                                            ROLES.AUDIT_MANAGER,
                                        ]}
                                    />
                                }
                            >

                                <Route
                                    path="/audit-points"
                                    element={<AuditPoint />}
                                />

                            </Route>


                            {/* =================================================
                                START AUDIT

                                Sidebar:
                                Auditor only
                            ================================================== */}

                            <Route
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            ROLES.AUDITOR,
                                        ]}
                                    />
                                }
                            >

                                <Route
                                    path="/audit"
                                    element={<AuditForm />}
                                />

                                <Route
                                    path="/AuditDetails/:storeId"
                                    element={<AuditDetails />}
                                />

                            </Route>


                            {/* =================================================
                                MY TASKS

                                Sidebar:
                                Admin
                                Ops Manager
                                Store Manager
                                Auditor
                                Audit Manager

                                Everyone except nobody.
                            ================================================== */}

                            <Route
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            ROLES.ADMIN,
                                            ROLES.OPS_MANAGER,
                                            ROLES.STORE_MANAGER,
                                            ROLES.AUDITOR,
                                            ROLES.AUDIT_MANAGER,
                                        ]}
                                    />
                                }
                            >

                                <Route
                                    path="/tasks"
                                    element={<MyTasks />}
                                />

                            </Route>


                            {/* =================================================
                                AUDITS

                                Sidebar:
                                Admin
                                Ops Manager
                                Store Manager
                                Auditor
                                Audit Manager

                                Everyone can see Audits according to
                                the Sidebar.
                            ================================================== */}

                            <Route
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            ROLES.ADMIN,
                                            ROLES.OPS_MANAGER,
                                            ROLES.STORE_MANAGER,
                                            ROLES.AUDITOR,
                                            ROLES.AUDIT_MANAGER,
                                        ]}
                                    />
                                }
                            >

                                <Route
                                    path="/Audits"
                                    element={<AuditsList />}
                                />

                                <Route
                                    path="/Audits/:id"
                                    element={<AuditView />}
                                />

                            </Route>


                            {/* =================================================
                                REPORTS

                                Sidebar:
                                Admin
                                Ops Manager
                                Store Manager
                                Auditor
                                Audit Manager

                                Everyone can see Reports according to
                                the current Sidebar.
                            ================================================== */}

                            <Route
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            ROLES.ADMIN,
                                            ROLES.OPS_MANAGER,
                                            ROLES.STORE_MANAGER,
                                            ROLES.AUDITOR,
                                            ROLES.AUDIT_MANAGER,
                                        ]}
                                    />
                                }
                            >

                                <Route
                                    path="/Reports"
                                    element={<Reports />}
                                />

                            </Route>

                        </Route>


                        {/* =====================================================
                            404
                        ====================================================== */}

                        <Route
                            path="*"
                            element={<NotFound />}
                        />

                    </Routes>

                </main>

            </div>

        </div>
    );
}


function App() {

    return (
        <AuthProvider>
            <AppShell />
        </AuthProvider>
    );
}

export default App;