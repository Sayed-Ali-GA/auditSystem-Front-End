import { useEffect, useState } from "react";
import Swal from "sweetalert2";



import criteriaService from "../../../services/CriteriaServices";
import { Link } from "react-router-dom";
import CriteriaForm from "./CrteriaForm";


const Criteria = () => {

  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <h2>Loading...</h2>;
  }


  const handleAddCrteria = async (crteriaData) => {
    try {
        const newCrteria = await criteriaService.create(crteriaData);
          setCriteria([
            ...criteria,
            newCrteria
          ]);
    } catch (error) {
        console.log(error)
    }
  }





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
        prev.filter((criteria) => criteria.majorcriteriaid !== majorcriteriaid)
      );
  
      Swal.fire({
        title: "Deleted!",
        text: `"The Criteria has been deleted."`,
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


  // console.log(criteria);


  return (
        <>

        <h2>Add New Crteria</h2>
          <CriteriaForm 
            handleAddCrteria={handleAddCrteria}
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
                    <td>{criteria.majorcriteriaid}</td>
                    <td>{criteria.majorcriterianame}</td>


                    <td> <Link to={`/criteria/${criteria.opsmanagerid}`}>Edit</Link> </td>



                <td>
                    <button onClick={() => handleDeleteCriteria(criteria.majorcriteriaid)}>
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