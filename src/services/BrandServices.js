const BASE_URL = `${import.meta.env.VITE_API_URL}/brands`;

const index = async () => {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch brands");
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};


const create = async (brandData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(brandData),
    });

    if (!response.ok) {
      throw new Error("Failed to create brand");
    }

    return await response.json();

  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
};

export default {
  index,
  create,
};