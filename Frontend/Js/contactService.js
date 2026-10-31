
const API_URL =
    window.location.port === "5500"
        ? "http://localhost:5000/api/contacts"
        : "/api/contacts";

// GET ALL CONTACTS
export async function getContacts() {
    const response = await fetch(API_URL);

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch contacts");
    }

    return result.data;
}


// GET SINGLE CONTACT
export async function getContactById(id) {
    const response = await fetch(`${API_URL}/${id}`);

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Contact not found");
    }

    return result.data;
}


// CREATE CONTACT
export async function createContact(contactData) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(contactData)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to create contact");
    }

    return result.data;
}


// UPDATE CONTACT
export async function updateContact(id, contactData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(contactData)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to update contact");
    }

    return result.data;
}


// DELETE CONTACT
export async function deleteContact(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to delete contact");
    }

    return result;
}
