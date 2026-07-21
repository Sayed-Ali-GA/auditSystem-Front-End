import { useEffect, useState } from "react";


import OpsManagerService from "../../../services/OpsManagerServices";
import "./OpsManager.css";
import { Link } from "react-router-dom";


const OpsManager = () => {

  const [opsManagers, setOpsManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOpsManagers = async () => {
      try {
        const data = await OpsManagerService.index();
        setOpsManagers(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getOpsManagers();

  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }



//   console.log(opsManagers);


  return (
    <>

      <h1>Ops Managers</h1>

    <table>
        <thead>
            <tr>
                <th>Sl. No.</th>
                <th>Name</th>
                <th>Oracle ID</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        </thead>

        <tbody>
            {opsManagers.map((opsManager) => (
                <tr key={opsManager.opsmanagerid}>
                    <td>{opsManager.opsmanagerid}</td>
                    <td>{opsManager.opsmanagername}</td>
                    <td>{opsManager.oracleid}</td>
                    <td> <Link to={`/opsmanagers/${opsManager.opsmanagerid}`}>Edit</Link> </td>
                    <td><Link to={`/opsmanagers/${opsManager.opsmanagerid}/delete`}>Delete</Link></td>
                </tr>
             ))}
        </tbody>
    </table>

    </>
  );
};  

export default OpsManager;
