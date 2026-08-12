const BASE_URL = `${import.meta.env.VITE_API_URL}/StoreManagers`;

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
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
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

const remove = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to delete Store Manager");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting Store Manager:", error);
    throw error;
  }
};

const update = async (id, storeManagerData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(storeManagerData),
    });

    if (!response.ok) {
      throw new Error("Failed to update Store Manager");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating Store Manager:", error);
    throw error;
  }
};

export default {
  index,
  create,
  remove,
  update,
};