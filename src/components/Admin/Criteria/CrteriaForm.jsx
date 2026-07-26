import { useState } from "react";

const CrteriaForm = ({handleAddCrteria}) => {
    const [crteriaData, setCrteriaData] = useState({
      majorcriterianame: ''  
    });


      const handleChange = (exc) => {
    setCrteriaData({
      ...crteriaData,
      [exc.target.name]: exc.target.value
    });
  };


  
  const handleSubmit = async (exs) => {
    exs.preventDefault();

    await handleAddCrteria(crteriaData);

    setCrteriaData({
      majorcriterianame : ""
    });
  };



    return (
        <>
            <form onSubmit={handleSubmit}>
                    <p>
                        <label htmlFor="Crteria">Enter Crteria:</label>
                            <input 
                                type="text"     
                                name="majorcriterianame"
                                value={crteriaData.majorcriterianame }
                                onChange={handleChange}
                                placeholder="e.g. Store Closing" 
                                required
                            />
                    </p>

                    <button type="submit">
                        Save Crteria
                    </button>
            </form>
        </>
    )

}

export default CrteriaForm;

