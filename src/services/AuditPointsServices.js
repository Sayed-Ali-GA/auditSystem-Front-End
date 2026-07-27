const BASE_URL = `${import.meta.env.VITE_API_URL}/audit-points`;



const index = async () => {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch audit-points");
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Error fetching audit-points:", error);
    throw error;
  }
};




const create = async (AuditPointData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/audit-point`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(AuditPointData),
    });

    if (!response.ok) {
      throw new Error("Failed to create Audit Point");
    }

    return await response.json();

  } catch (error) {
    console.error("Error creating Audit Point:", error);
    throw error;
  }
};





const remove = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Audit");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting Audit:", error);
    throw error;
  }
};


export default {
  index,
  create,
  remove,
  
};

