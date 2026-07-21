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

export default {
  index
};

