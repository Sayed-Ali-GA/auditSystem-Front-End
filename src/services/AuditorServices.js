const BASE_URL = `${import.meta.env.VITE_API_URL}/Audits`;

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const index = async (storeSerial = null) => {
    try {
        let url = BASE_URL;
        if (storeSerial) {
            url += `?storeSerial=${encodeURIComponent(storeSerial)}`;
        }

        const response = await fetch(url, { headers: { ...authHeaders() } });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to fetch audits");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching audits:", error);
        throw error;
    }
};

const show = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            headers: { ...authHeaders() }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to fetch audit");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching audit:", error);
        throw error;
    }
};

const create = async (auditData) => {
    try {
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(auditData)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to create audit");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating audit:", error);
        throw error;
    }
};

const update = async (id, auditData) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(auditData)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to update audit");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating audit:", error);
        throw error;
    }
};

const remove = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
            headers: { ...authHeaders() }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to delete audit");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting audit:", error);
        throw error;
    }
};

export default { 
    index, 
    show, 
    create, 
    update, 
    remove 
};