const BASE_URL = `${import.meta.env.VITE_API_URL}/Stores`;

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const index = async (includeInactive = false) => {
  try {
    const url = includeInactive ? `${BASE_URL}?includeInactive=true` : BASE_URL;
    const response = await fetch(url, {
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Store ");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Store :", error);
    throw error;
  }
};

const create = async (storeData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
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
      headers: { ...authHeaders() },
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
        ...authHeaders(),
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

const restore = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}/restore`, {
      method: "PATCH",
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to restore Store");
    }

    return await response.json();
  } catch (error) {
    console.error("Error restoring Store:", error);
    throw error;
  }
};

export default {
  index,
  create,
  remove,
  update,
  restore,
};