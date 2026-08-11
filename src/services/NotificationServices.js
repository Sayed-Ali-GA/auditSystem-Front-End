const BASE_URL = `${import.meta.env.VITE_API_URL}/notifications`;

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
      throw new Error("Failed to fetch notifications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

const markRead = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}/read`, {
      method: "PATCH",
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to update notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

const markAllRead = async () => {
  try {
    const response = await fetch(`${BASE_URL}/read-all`, {
      method: "PATCH",
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to update notifications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating notifications:", error);
    throw error;
  }
};

export default { index, markRead, markAllRead };