import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome } from "react-icons/fi";
import "./NotFound.css";

const NotFound = () => (
  <div className="ag-notfound">
    <div className="ag-notfound-icon">
      <FiAlertTriangle />
    </div>
    <h1>404</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" className="ag-btn ag-btn-primary">
      <FiHome />
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;