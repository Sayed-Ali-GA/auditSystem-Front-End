import { FiLoader } from "react-icons/fi";

/**
 * Consistent loading indicator used across every admin page.
 * Usage: if (loading) return <LoadingState label="Loading brands..." />;
 */
const LoadingState = ({ label = "Loading..." }) => (
    <div className="ag-loading" role="status" aria-live="polite">
        <span className="ag-spinner" />
        {label}
    </div>
);

export default LoadingState;