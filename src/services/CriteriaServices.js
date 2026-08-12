const BASE_URL = `${import.meta.env.VITE_API_URL}/MajorCriteria`;

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
      throw new Error("Failed to fetch criteria");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching criteria:", error);
    throw error;
  }
};

const create = async (criteriaData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(criteriaData),
    });

    if (!response.ok) {
      throw new Error("Failed to create Criteria");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Criteria:", error);
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
      throw new Error("Failed to delete Criteria");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting Criteria:", error);
    throw error;
  }
};

const update = async (id, criteriaData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(criteriaData),
    });

    if (!response.ok) {
      throw new Error("Failed to update Criteria");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating Criteria:", error);
    throw error;
  }
};

export default {
  index,
  create,
  remove,
  update,
};