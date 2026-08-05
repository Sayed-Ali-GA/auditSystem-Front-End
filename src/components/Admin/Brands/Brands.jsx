import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiTag, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

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


  useEffect(() => {
    const getBrands = async () => {
      try {
        const data = await brandService.index();
        setBrands(data);
      } catch (error) {
        console.log(error);

      } finally {
        setLoading(false);
      }
    };
    getBrands();

  }, []);


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
          brand.brandid === editingBrand.brandid
            ? updatedBrand
            : brand
        )
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Brand updated successfully.",
      });

    } else {
      const newBrand = await brandService.create(brandData);

      setBrands((prev) => [...prev, newBrand]);

      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Brand added successfully.",
      });
    }

    closeModal();

  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "Something went wrong.",
    });
  }
};



  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading brands..." />
      </div>
    );
  }



const handleDeleteBrand = async (brandid) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to undo this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    await brandService.remove(brandid);

    setBrands((prev) =>
      prev.filter((brand) => brand.brandid !== brandid)
    );

    Swal.fire({
      title: "Deleted!",
      text: "The brand has been deleted.",
      icon: "success",
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "This Brand is assigned to one or more.",
      icon: "error",
    });
  }
};



  return (
    <div className="ag-main">

      <PageHeader
        icon={<FiTag />}
        eyebrow="Catalog"
        title="Brands"
        subtitle="Create and manage the brands used across stores and audits."
      />

      <div className="ag-card">

        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiTag />
            All brands
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
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {brands.length === 0 && (
                <tr>
                  <td colSpan={4} className="ag-empty-state">No brands yet.</td>
                </tr>
              )}

              {brands.map((brand, index) => (
                <tr key={brand.brandid}>
                  <td data-label="Sl. No.">{index + 1}</td>
                  <td data-label="Brand name">{brand.brandname}</td>

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

                  <td data-label="Delete">
                    <div className="ag-row-actions">
                      <button
                        className="ag-icon-btn delete"
                        title="Delete"
                        onClick={() => handleDeleteBrand(brand.brandid)}
                      >
                        <FiTrash2 />
                      </button>
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