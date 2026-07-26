import { useEffect, useState } from "react";
import Swal from "sweetalert2";


import OpsManagerService from "../../../services/OpsManagerServices";
import "./OpsManager.css";
import { Link } from "react-router-dom";
import OpsManagerForm from "./OpsManagerForm";


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



  const handleAddOpsManager = async (opsManagerData) => {
    try {
        const newOpsManager = await OpsManagerService.create(opsManagerData);
          setOpsManagers([
           ...opsManagers,
            newOpsManager
        ]);

    } catch (error) {
        console.log(error)
    }
  }
  

  const handleDeleteOpsManager = async (opsmanagerid) => {
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
          await OpsManagerService.remove(opsmanagerid);
      
          setOpsManagers((prev) =>
            prev.filter((opsManagers) => opsManagers.opsmanagerid !== opsmanagerid)
          );
      
          Swal.fire({
            title: "Deleted!",
            text: `"The Ops Manager has been deleted."`,
            icon: "success",
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "This Ops Manager is assigned to one or more.",
            icon: "error",
          });
        }
      };
    
  


  return (
    <>

    <h2>Add New Ops Manager</h2>
      <OpsManagerForm 
        handleAddOpsManager={handleAddOpsManager}
      />

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

                  <td>
                    <button onClick={() => handleDeleteOpsManager(opsManager.opsmanagerid)}>
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

export default OpsManager;
