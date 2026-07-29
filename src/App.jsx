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

import "./App.css";
import AuditForm from "./components/Employee/Audit/AuditForm";


function AppShell() {

    const { isAuthenticated } = useAuth();

    return (
        <div className="app">

            {isAuthenticated && <Sidebar />}

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

            <Route element={<ProtectedRoute allowedRoles={[1,2]} />}>
            
                        <Route
                                path="/audit-points"
                                element={<AuditPoint />}
                        />
            </Route>


{/* ---------------------------------- Auditor ------------------------------------------------------- */}

            <Route element={<ProtectedRoute allowedRoles={[1,3]} />}>
                    
                    <Route 
                        path="/audit" 
                        element={<AuditForm />} 
                    />
            
            </Route>


                
    </Route>

                <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>

            </main>
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