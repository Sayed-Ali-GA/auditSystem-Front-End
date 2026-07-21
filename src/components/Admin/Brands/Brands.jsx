import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import BrandForm from "./BrandsForm";
import brandService from "../../../services/BrandServices";


const Brands = () => {

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);


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

      const newBrand = await brandService.create(brandData);

      setBrands([
        ...brands,
        newBrand
      ]);

    } catch(error) {
      console.log(error);
    }

  };



  if (loading) {
    return <h2>Loading...</h2>;
  }



  return (
    <>

    <h2>Add New Brand</h2>
      <BrandForm 
        handleAddBrand={handleAddBrand}
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
                <Link to={`/brands/${brand.brandid}`}>
                  Edit
                </Link>
              </td>

              <td>
                <Link to={`/brands/${brand.brandid}/delete`}>
                  Delete
                </Link>
              </td>

            </tr>

          ))}

        </tbody>

      </table>


    </>
  );
};


export default Brands;