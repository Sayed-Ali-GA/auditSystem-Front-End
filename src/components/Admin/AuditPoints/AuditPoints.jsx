import { useEffect, useState } from "react";
import { Link } from "react-router-dom";




import auditPointServices from "../../../services/AuditPointsServices"


const AuditPoint = () => {
    const [AuditPints, setAuditPoints] = useState([])
    const [loading, setLoading] = useState(true);


    useEffect (() => {
        const getAuditPoint = async () => {
            try {
                const data = await auditPointServices.index();
                    setAuditPoints(data);
            } catch (error) {
                console.log(error)
            }
             finally {
                setLoading(false);
             }

        };
        getAuditPoint();
    }, []);



    console.log("Audit: ", AuditPints)

    if (!AuditPints) {
        return <h2>It's Emty</h2>
    }

  return(
    <>
<h1>Audit Point</h1>

<table>
  <thead>
    <tr>
       <th>#ID</th> 
      <th>Criteria</th>
      <th>Sub Point</th>
      <th>Audit Point</th>
      <th>Risk Matrix</th>
      <th>Weightage</th>
      <th>Edit</th>
      <th>Delete</th>
    </tr>
  </thead>

  <tbody>
    {AuditPints.map((auditPoint) => (
      <tr key={auditPoint.auditpointid}>
        <td>{auditPoint.auditpointid}</td>
        <td>{auditPoint.majorcriterianame}</td>
        <td>{auditPoint.subpointcriteria}</td>
        <td>{auditPoint.auditcomment}</td>
        <td>{auditPoint.riskmatrix}</td>
        <td>{auditPoint.weightage}</td>


        <td> <Link to={`/audit-points/${auditPoint.auditpointid}`}>Edit</Link> </td>
        <td><Link to={`/audit-points/${auditPoint.auditpointid}/delete`}>Delete</Link></td>
      </tr>
    ))}
  </tbody>
</table>    </>
  )



}

export default AuditPoint;