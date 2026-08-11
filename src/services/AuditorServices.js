
const BASE_URL = `${import.meta.env.VITE_API_URL}/Audits`;



const index = async (storeSerial = null) => {
    try {
        let url = BASE_URL;

        if (storeSerial) {
            url += `?storeSerial=${encodeURIComponent(
                storeSerial
            )}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Failed to fetch audits"
            );
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Error fetching audits:",
            error
        );

        throw error;
    }
};


/*
 * ============================================================
 * GET ONE AUDIT
 * ============================================================
 */

const show = async (id) => {
    try {
        const response = await fetch(
            `${BASE_URL}/${id}`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Error fetching audit:",
            error
        );

        throw error;
    }
};


/*
 * ============================================================
 * CREATE AUDIT
 * ============================================================
 */

const create = async (auditData) => {
    try {
        const response = await fetch(
            BASE_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    auditData
                )
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to create audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Error creating audit:",
            error
        );

        throw error;
    }
};


/*
 * ============================================================
 * UPDATE AUDIT
 * ============================================================
 */

const update = async (
    id,
    auditData
) => {
    try {
        const response = await fetch(
            `${BASE_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    auditData
                )
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to update audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Error updating audit:",
            error
        );

        throw error;
    }
};


/*
 * ============================================================
 * DELETE AUDIT
 * ============================================================
 */

const remove = async (id) => {
    try {
        const response = await fetch(
            `${BASE_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to delete audit"
            );
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Error deleting audit:",
            error
        );

        throw error;
    }
};


/*
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default {
    index,
    show,
    create,
    update,
    remove
};

