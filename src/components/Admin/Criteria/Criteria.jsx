import { useEffect, useState } from "react";


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
                    <td><Link to={`/criteria/${criteria.opsmanagerid}/delete`}>Delete</Link></td>
                </tr>
             ))}
        </tbody>
    </table>

    </>
  );
};

export default Criteria;    