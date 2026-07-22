const BASE_URL = `${import.meta.env.VITE_API_URL}/OpsManagers`;



const index = async () => {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch ops managers");
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Error fetching ops managers:", error);
    throw error;
  }
};







const create = async (opsManagerData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/OpsManagers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opsManagerData),
    });

    if (!response.ok) {
      throw new Error("Failed to create Ops Manager");
    }

    return await response.json();

  } catch (error) {
    console.error("Error creating Ops Manager:", error);
    throw error;
  }
};

export default {
  index,
  create,
};


