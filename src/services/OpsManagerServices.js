const BASE_URL = `${import.meta.env.VITE_API_URL}/OpsManagers`;

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
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
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

const remove = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to delete Ops Manager");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting Ops Manager:", error);
    throw error;
  }
};

const update = async (id, opsManagerData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(opsManagerData),
    });

    if (!response.ok) {
      throw new Error("Failed to update Ops Manager");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating Ops Manager:", error);
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
      throw new Error("Failed to restore Ops Manager");
    }

    return await response.json();
  } catch (error) {
    console.error("Error restoring Ops Manager:", error);
    throw error;
  }
};


export default {
  index,
  create,
  remove,
  update,
  restore
};