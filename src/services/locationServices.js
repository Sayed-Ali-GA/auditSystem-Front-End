const BASE_URL = `${import.meta.env.VITE_API_URL}/Location`;

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const index = async () => {
  try {
    const response = await fetch(BASE_URL, {
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

const create = async (locationData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(locationData),
    });

    if (!response.ok) {
      throw new Error("Failed to create Location");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Location:", error);
    throw error;
  }
};

const remove = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to delete Location");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting Location:", error);
    throw error;
  }
};

const update = async (id, locationData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(locationData),
    });

    if (!response.ok) {
      throw new Error("Failed to update Location");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating Location:", error);
    throw error;
  }
};

export default {
  index,
  create,
  remove,
  update,
};