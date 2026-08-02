import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import criteriaService from "../../../services/CriteriaServices";
import CriteriaForm from "./CrteriaForm";


const Criteria = () => {

  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCriteria, setEditingCriteria] = useState(null);


  useEffect(() => {

    const getCriteria = async () => {
      try {
        const data = await criteriaService.index();
        setCriteria(data);

      } catch (error) {
        console.log(error);

      } finally {
        setLoading(false);
      }
    };

    getCriteria();

  }, []);



  const handleAddCriteria = async (criteriaData) => {
    try {

      if (editingCriteria) {

        const updatedCriteria = await criteriaService.update(
          editingCriteria.majorcriteriaid,
          criteriaData
        );


        setCriteria((prev) =>
          prev.map((criteria) =>
            criteria.majorcriteriaid === editingCriteria.majorcriteriaid
              ? updatedCriteria
              : criteria
          )
        );


        setEditingCriteria(null);


        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Criteria updated successfully.",
        });


      } else {

        const newCriteria = await criteriaService.create(criteriaData);


        setCriteria((prev) => [
          ...prev,
          newCriteria
        ]);


        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Criteria added successfully.",
        });

      }


    } catch (error) {
      console.log(error);
    }
  };




  const handleDeleteCriteria = async (majorcriteriaid) => {

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

      await criteriaService.remove(majorcriteriaid);


      setCriteria((prev) =>
        prev.filter(
          (criteria) =>
            criteria.majorcriteriaid !== majorcriteriaid
        )
      );


      Swal.fire({
        title: "Deleted!",
        text: "The Criteria has been deleted.",
        icon: "success",
      });


    } catch (error) {

      Swal.fire({
        title: "Error!",
        text: "Failed to delete the Criteria.",
        icon: "error",
      });

    }
  };



  if (loading) {
    return <h2>Loading...</h2>;
  }



  return (
    <>

      <h2>
        {editingCriteria ? "Edit Criteria" : "Add New Criteria"}
      </h2>


      <CriteriaForm
        handleAddCriteria={handleAddCriteria}
        editingCriteria={editingCriteria}
      />



      <h1>Criteria</h1>


      <table>

        <thead>
          <tr>
            <th>Sl. No.</th>
            <th>Criteria</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>


        <tbody>

          {criteria.map((criteria) => (

            <tr key={criteria.majorcriteriaid}>

              <td>
                {criteria.majorcriteriaid}
              </td>


              <td>
                {criteria.majorcriterianame}
              </td>


              <td>
                <button
                  onClick={() => setEditingCriteria(criteria)}
                >
                  Edit
                </button>
              </td>


              <td>
                <button
                  onClick={() =>
                    handleDeleteCriteria(
                      criteria.majorcriteriaid
                    )
                  }
                >
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


export default Criteria;