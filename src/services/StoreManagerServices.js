const BASE_URL = `${import.meta.env.VITE_API_URL}/StoreManagers`;



const index = async () => {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch Store Managers");
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Error fetching Store Managers:", error);
    throw error;
  }
};




const create = async (storeManagerData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/StoreManagers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storeManagerData),
    });

    if (!response.ok) {
      throw new Error("Failed to create Store Manager");
    }

    return await response.json();

  } catch (error) {
    console.error("Error creating Store Manager:", error);
    throw error;
  }
};

export default {
  index,
  create,
};



