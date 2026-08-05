import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import "./Modal.css";

/**
 * Shared modal for add/edit forms across the admin console.
 *
 * <Modal isOpen={open} onClose={close} icon={<FiTag />} title="Add brand">
 *   <BrandForm ... />
 * </Modal>
 */
const Modal = ({ isOpen, onClose, title, icon, children, maxWidth = 1400 }) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ag-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="ag-modal"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ag-modal-header">
          <div className="ag-modal-title">
            {icon}
            <span>{title}</span>
          </div>

          <button
            type="button"
            className="ag-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="ag-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;