import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiTag, FiEdit2, FiTrash2, FiPlus, FiRotateCcw, FiArchive } from "react-icons/fi";

import BrandForm from "./BrandsForm";
import brandService from "../../../services/BrandServices";
import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";
import Modal from "../Shared/Modal";
import "../Shared/theme.css";


const Brands = () => {

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const loadBrands = async (includeInactive) => {
    try {
      setLoading(true);
      const data = await brandService.index(includeInactive);
      setBrands(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands(showArchived);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);


  const openAddModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };


  const handleAddBrand = async (brandData) => {
    try {
      if (editingBrand) {
        const updatedBrand = await brandService.update(
          editingBrand.brandid,
          brandData
        );

        setBrands((prev) =>
          prev.map((brand) =>
            brand.brandid === editingBrand.brandid ? updatedBrand : brand
          )
        );

        Swal.fire({ icon: "success", title: "Updated!", text: "Brand updated successfully." });
      } else {
        const newBrand = await brandService.create(brandData);
        setBrands((prev) => [...prev, newBrand]);
        Swal.fire({ icon: "success", title: "Added!", text: "Brand added successfully." });
      }

      closeModal();
    } catch (error) {
      console.log(error);
      Swal.fire({ icon: "error", title: "Error!", text: "Something went wrong." });
    }
  };


  const handleArchiveBrand = async (brandid) => {
    const result = await Swal.fire({
      title: "Archive this brand?",
      text: "It will be hidden from new stores but kept for historical reports.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await brandService.remove(brandid);
      setBrands((prev) => prev.filter((brand) => brand.brandid !== brandid));
      Swal.fire({ title: "Archived!", text: "The brand has been archived.", icon: "success" });
    } catch (error) {
      Swal.fire({ title: "Error!", text: "Could not archive this brand.", icon: "error" });
    }
  };

  const handleRestoreBrand = async (brandid) => {
    try {
      await brandService.restore(brandid);
      setBrands((prev) => prev.filter((brand) => brand.brandid !== brandid));
      Swal.fire({ title: "Restored!", text: "The brand is active again.", icon: "success" });
    } catch (error) {
      Swal.fire({ title: "Error!", text: "Could not restore this brand.", icon: "error" });
    }
  };


  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading brands..." />
      </div>
    );
  }


  return (
    <div className="ag-main">

      <PageHeader
        icon={<FiTag />}
        eyebrow="Catalog"
        title="Brands"
        subtitle="Create and manage the brands used across stores and audits."
        actions={
          <button
            type="button"
            className="ag-btn ag-btn-ghost ag-btn-sm"
            onClick={() => setShowArchived((v) => !v)}
          >
            <FiArchive />
            {showArchived ? "Show active only" : "Show archived"}
          </button>
        }
      />

      <div className="ag-card">

        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiTag />
            {showArchived ? "All brands (incl. archived)" : "Active brands"}
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-primary ag-btn-sm"
            onClick={openAddModal}
          >
            <FiPlus /> Add brand
          </button>
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Brand name</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Archive / Restore</th>
              </tr>
            </thead>

            <tbody>
              {brands.length === 0 && (
                <tr>
                  <td colSpan={5} className="ag-empty-state">No brands yet.</td>
                </tr>
              )}

              {brands.map((brand, index) => (
                <tr key={brand.brandid}>
                  <td data-label="Sl. No.">{index + 1}</td>
                  <td data-label="Brand name">{brand.brandname}</td>

                  <td data-label="Status">
                    <span className={`ag-badge ${brand.isactive ? "ag-badge-success" : "ag-badge-muted"}`}>
                      {brand.isactive ? "Active" : "Archived"}
                    </span>
                  </td>

                  <td data-label="Edit">
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(brand)}
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>

                  <td data-label="Archive / Restore">
                    <div className="ag-row-actions">
                      {brand.isactive ? (
                        <button
                          className="ag-icon-btn delete"
                          title="Archive"
                          onClick={() => handleArchiveBrand(brand.brandid)}
                        >
                          <FiTrash2 />
                        </button>
                      ) : (
                        <button
                          className="ag-icon-btn enable"
                          title="Restore"
                          onClick={() => handleRestoreBrand(brand.brandid)}
                        >
                          <FiRotateCcw />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        icon={<FiTag />}
        title={editingBrand ? "Edit brand" : "Add new brand"}
      >
        <BrandForm
          handleAddBrand={handleAddBrand}
          editingBrand={editingBrand}
        />
      </Modal>

    </div>
  );
};


export default Brands;