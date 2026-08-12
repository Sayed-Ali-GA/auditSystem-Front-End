import { Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "./components/Authcontext/Authcontext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";

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
import Login from "./components/Login/Login";
import Reports from "./components/Admin/Reports/Reports";
import MyTasks from "./components/Employee/Audit/MyTasks";

import AuditDetails from './components/Employee/Audit/AuditDetails'
import AuditForm from "./components/Employee/Audit/AuditForm";
import AuditsList from "./components/Employee/Audit/Auditslist";
import AuditView from "./components/Employee/Audit/Auditview";
import NavBar from "./components/NavBar/NavBar";

import "./App.css";


function AppShell() {

    const { isAuthenticated } = useAuth();

    return (
        <div className="app">

        {isAuthenticated && <Sidebar />}

        <div className="main-layout">

            {isAuthenticated && <NavBar />}

            <main className="content">

                <Routes>

                    <Route element={<PublicRoute />}>

                    
                        <Route
                            path="/login"
                            element={<Login />}
                        />
                    </Route>




                    <Route element={<ProtectedRoute />}>
{/* ------------------------------- Admin ---------------------------------- */}
                        <Route
                            path="/"
                            element={<HomePage />}
                        />

            <Route element={<ProtectedRoute allowedRoles={[1]} />}>

                        
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
                        
                        <Route 
                            path="/users" 
                            element={<Users />} 
                        />
                        
                        

                    </Route>


{/* ----------------------------------  Ops Manager   ---------------------------------------------------- */}

            <Route element={<ProtectedRoute allowedRoles={[1,2,5,4]} />}>
            
                        <Route
                                path="/audit-points"
                                element={<AuditPoint />}
                        />
            </Route>


{/* ---------------------------------- Auditor ------------------------------------------------------- */}

            <Route element={<ProtectedRoute allowedRoles={[1,2,3,4,5]} />}>
                    
                    <Route 
                        path="/audit" 
                        element={<AuditForm />} 
                    />

                    <Route 
                        path="/AuditDetails/:storeId" 
                        element={<AuditDetails />} 
                    />
            
            </Route>

            
          <Route element={<ProtectedRoute allowedRoles={[1,2,3,4,5]} />}>

                    <Route
                        path="/Audits"
                        element={<AuditsList />}
                    />

                    <Route
                        path="/Audits/:id"
                        element={<AuditView />}
                    />

                    <Route
                        path="/Reports"
                        element={<Reports />}
                    />

                     <Route
                        path="/tasks"
                        element={<MyTasks />}
                    />

            </Route>


                
    </Route>

                <Route path="*" element={<h1>404 Not Found</h1>} />
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