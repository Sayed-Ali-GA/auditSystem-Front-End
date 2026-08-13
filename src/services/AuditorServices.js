const BASE_URL = `${import.meta.env.VITE_API_URL}/Audits`;

const authHeaders = () => {
    const token = localStorage.getItem("token");

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
};


// =====================================================
// GET ALL AUDITS
// =====================================================

const index = async (storeSerial = null, includeInactive = false) => {
    try {
        let url = BASE_URL;

        const params = new URLSearchParams();

        if (storeSerial) {
            params.append("storeSerial", storeSerial);
        }

        if (includeInactive) {
            params.append("includeInactive", "true");
        }

        const queryString = params.toString();

        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await fetch(url, {
            headers: {
                ...authHeaders(),
            },
        });

        if (!response.ok) {
            const errData = await response
                .json()
                .catch(() => ({}));

            throw new Error(
                errData.message || "Failed to fetch audits"
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching audits:", error);
        throw error;
    }
};


// =====================================================
// GET ONE AUDIT
// =====================================================

const show = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            headers: {
                ...authHeaders(),
            },
        });

        if (!response.ok) {
            const errData = await response
                .json()
                .catch(() => ({}));

            throw new Error(
                errData.message || "Failed to fetch audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching audit:", error);
        throw error;
    }
};


// =====================================================
// CREATE AUDIT
// =====================================================

const create = async (auditData) => {
    try {
        const response = await fetch(BASE_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },

            body: JSON.stringify(auditData),
        });

        if (!response.ok) {
            const errData = await response
                .json()
                .catch(() => ({}));

            throw new Error(
                errData.message || "Failed to create audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error creating audit:", error);
        throw error;
    }
};


// =====================================================
// UPDATE AUDIT
// =====================================================

const update = async (id, auditData) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },

            body: JSON.stringify(auditData),
        });

        if (!response.ok) {
            const errData = await response
                .json()
                .catch(() => ({}));

            throw new Error(
                errData.message || "Failed to update audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error updating audit:", error);
        throw error;
    }
};


// =====================================================
// ARCHIVE AUDIT
// =====================================================

const remove = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",

            headers: {
                ...authHeaders(),
            },
        });

        if (!response.ok) {
            const errData = await response
                .json()
                .catch(() => ({}));

            throw new Error(
                errData.message || "Failed to archive audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error archiving audit:", error);
        throw error;
    }
};


// =====================================================
// RESTORE AUDIT
// =====================================================

const restore = async (id) => {
    try {
        const response = await fetch(
            `${BASE_URL}/${id}/restore`,
            {
                method: "PATCH",

                headers: {
                    ...authHeaders(),
                },
            }
        );

        if (!response.ok) {
            const errData = await response
                .json()
                .catch(() => ({}));

            throw new Error(
                errData.message || "Failed to restore audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error restoring audit:", error);
        throw error;
    }
};


export default {
    index,
    show,
    create,
    update,
    remove,
    restore,
};