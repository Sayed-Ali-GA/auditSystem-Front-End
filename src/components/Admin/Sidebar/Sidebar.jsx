import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">

      <h2>Audit System</h2>

      <nav>

        <NavLink to={'/Home'}>
          Home
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

        <NavLink to="/StoreManagers">
         Store Managers
        </NavLink>

        <NavLink to="/Stores">
         Stores
        </NavLink>

        <NavLink to="/audit-points">
         Audit Point
        </NavLink>

      </nav>

    </aside>
  );
};

export default Sidebar;