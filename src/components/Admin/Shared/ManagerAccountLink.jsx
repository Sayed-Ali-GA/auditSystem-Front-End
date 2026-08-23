// src/components/Admin/Shared/ManagerAccountLink.jsx
import { useNavigate } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";

/**
 * Shows whether a manager (Ops Manager or Store Manager) already has
 * a personal login account in Users, or a button to create one.
 *
 * Account creation ALWAYS happens on the Users page — this component
 * never creates the account itself. It only shows the current state
 * and, if not linked yet, deep-links to Users with the manager's
 * Oracle ID, name and role pre-filled so the admin doesn't retype them.
 *
 * This is the single place that renders this "Linked / Add to Users"
 * cell — both OpsManager.jsx and StoreManager.jsx use it, so there is
 * one behavior to maintain instead of two copies that can drift apart.
 */
const ManagerAccountLink = ({ oracleId, name, roleId, linkedOracleIds }) => {
  const navigate = useNavigate();

  const isLinked = linkedOracleIds.has(Number(oracleId));

  if (isLinked) {
    return <span className="ag-badge ag-badge-success">Linked</span>;
  }

  const goCreateAccount = () => {
    navigate(
      `/users?role=${roleId}&oracleId=${oracleId}&userName=${encodeURIComponent(
        name || ""
      )}`
    );
  };

  return (
    <button
      type="button"
      className="ag-btn ag-btn-ghost ag-btn-sm"
      onClick={goCreateAccount}
    >
      <FiUserPlus />
      Add to Users
    </button>
  );
};

export default ManagerAccountLink;