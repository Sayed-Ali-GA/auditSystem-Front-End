const BASE_URL = `${import.meta.env.VITE_API_URL}/Stores`;


const index = async () => {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch Store ");
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Error fetching Store :", error);
    throw error;
  }
};






const create = async (storeData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Stores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storeData),
    });

    if (!response.ok) {
      throw new Error("Failed to create Store");
    }

    return await response.json();

  } catch (error) {
    console.error("Error creating Store: ", error);
    throw error;
  }
};




const remove = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Store");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting Store:", error);
    throw error;
  }
};


const update = async (id, storeData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storeData),
    });

    if (!response.ok) {
      throw new Error("Failed to update Store");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating Store:", error);
    throw error;
  }
};


export default {
  index,
  create,
  remove,
  update
};