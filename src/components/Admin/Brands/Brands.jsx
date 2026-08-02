import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";


import BrandForm from "./BrandsForm";
import brandService from "../../../services/BrandServices";


const Brands = () => {

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState(null);


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

      setEditingBrand(null);

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
  } catch (error) {
    console.log(error);
  }
};



  if (loading) {
    return <h2>Loading...</h2>;
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
      text: `"The brand has been deleted."`,
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
    <>

    <h2>
        {editingBrand ? "Edit Brand" : "Add New Brand"}
    </h2>

      <BrandForm 
        handleAddBrand={handleAddBrand}
        editingBrand={editingBrand}
      />


      <h1>Brands</h1>

      <table>

        <thead>
          <tr>
            <th>Sl. No.</th>
            <th>Brand Name</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>


        <tbody>

          {brands.map((brand, index) => (

            <tr key={brand.brandid}>
              <td>{index + 1}</td>
              <td>
                {brand.brandname}
              </td>

              <td>
                <button onClick={() => setEditingBrand(brand)}>
                    Edit
              </button>
              </td>

             
           <td>
              <button onClick={() => handleDeleteBrand(brand.brandid)}>
                Delete
              </button>
          </td>

            </tr>

          ))}

        </tbody>

      </table>


    </>
  );
};


export default Brands;