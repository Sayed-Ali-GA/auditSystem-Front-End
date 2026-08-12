const BASE_URL = `${import.meta.env.VITE_API_URL}/brands`;

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
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
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




const remove = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Delete brand backend error:", data);

            throw new Error(
                data.details ||
                data.error ||
                data.message ||
                "Failed to delete brand"
            );
        }

        return data;

    } catch (error) {
        console.error("Error deleting brand:", error);
        throw error;
    }
};

const update = async (id, brandData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(brandData),
    });

    if (!response.ok) {
      throw new Error("Failed to update brand");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
};

export default {
  index,
  create,
  remove,
  update,
};