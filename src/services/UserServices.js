const BASE_URL = `${import.meta.env.VITE_API_URL}/users`;


// Safely parse a JSON response body, even if it's empty or not valid JSON
const parseResponseBody = async (response) => {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};



const apiRequest = async (path, options = {}, { skipAuthRedirect = false } = {}) => {

    const token = localStorage.getItem("token");

    let response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers
            }
        });
    } catch (networkError) {
        throw new Error("Network error. Please check your connection and try again.");
    }

    if (response.status === 401 && !skipAuthRedirect) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        // Stop further handling; redirect is in progress.
        throw new Error("Session expired. Please Sign in again.");
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
};


const userService = {

    login: (credentials) => apiRequest(
        "/login",
        {
            method: "POST",
            body: JSON.stringify(credentials)
        },
        { skipAuthRedirect: true }
    ),

    // Get all users
    index: () => apiRequest("", { method: "GET" }),

    // Create user
    create: (userData) => apiRequest("/createUser", {
        method: "POST",
        body: JSON.stringify(userData)
    }),

    // Update user
    update: (userID, userData) => apiRequest(`/${userID}`, {
        method: "PUT",
        body: JSON.stringify(userData)
    }),

    // Disable user
    disable: (userID) => apiRequest(`/${userID}/disable`, {
        method: "PATCH"
    }),

    enable: (userID) => apiRequest(`/${userID}/enable`, {
    method: "PATCH"
}),

    // Delete user
    remove: (userID) => apiRequest(`/${userID}`, {
        method: "DELETE"
    })

};


export default userService;