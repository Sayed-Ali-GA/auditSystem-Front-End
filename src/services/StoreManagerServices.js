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

export default {
  index
};  


