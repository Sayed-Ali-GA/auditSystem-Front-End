import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/Authcontext/Authcontext";
import "./Sidebar.css";

const Sidebar = () => {

    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <aside className="sidebar">

            <h2>Audit System</h2>

            <nav>

                <NavLink to="/">
                    Home
                </NavLink>


                {user?.RoleID === 1 && (
                    <>
                        <NavLink to="/users">
                             Users
                        </NavLink>

                        <NavLink to="/brands">
                            Brands
                        </NavLink>

                        <NavLink to="/criteria">
                            Criteria
                        </NavLink>

                        <NavLink to="/location">
                            Location
                        </NavLink>

                        <NavLink to="/opsmanagers">
                            Ops Managers
                        </NavLink>

                        <NavLink to="/storemanagers">
                            Store Managers
                        </NavLink>

                        <NavLink to="/stores">
                            Stores
                        </NavLink>

                        <NavLink to="/audit-points">
                            Audit Point
                        </NavLink>

                        <NavLink to="/Audits">
                            Audits
                        </NavLink>
                    </>
                    
                )}

                 {user?.RoleID === 2 && (
                    <>
                        <NavLink to="/audit-points">
                            Audit Point
                        </NavLink>

                        <NavLink to="/Audits">
                            Audits
                        </NavLink>
                    </>
                 )}



                  {user?.RoleID === 3 && (
                    <>
                        <NavLink to="/audit">
                            Audit
                        </NavLink>

                        <NavLink to="/Audits">
                            Past Audits
                        </NavLink>
                    </>
                 )}


                

            </nav>


            <button 
                type="button" 
                className="logout-button" 
                onClick={handleLogout}
            >
                Log out
            </button>

        </aside>
    );
};

export default Sidebar;