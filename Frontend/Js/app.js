
import {
    getContacts,
    createContact,
    updateContact,
    deleteContact
} from "./contactService.js";


// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const contactTableBody = document.getElementById("contactTableBody");
const contactModal = document.getElementById("contactModal");
const contactForm = document.getElementById("contactForm");

const searchInput = document.getElementById("searchInput");
const companyFilter = document.getElementById("companyFilter");
const sortSelect = document.getElementById("sortSelect");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const addContactBtn = document.getElementById("addContactBtn");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const modalTitle = document.getElementById("modalTitle");

const submitBtn = contactForm.querySelector(
    'button[type="submit"]'
);

// Pagination elements
const paginationInfo = document.getElementById("paginationInfo");
const currentPageInfo = document.getElementById("currentPageInfo");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");


// ==========================================
// 2. APPLICATION STATE
// ==========================================

// Contacts loaded from MongoDB
let contacts = [];

// Pagination configuration
const CONTACTS_PER_PAGE = 10;

let currentPage = 1;


// ==========================================
// 3. MESSAGE HANDLER
// ==========================================

function showMessage(message) {
    alert(message);
}


// ==========================================
// 4. LOAD CONTACTS FROM DATABASE
// ==========================================

async function loadContacts() {

    try {

        contactTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    Loading contacts...
                </td>
            </tr>
        `;

        // Fetch latest contacts from MongoDB
        const response = await getContacts();

        // Support either an array or { contacts: [...] }
        contacts = Array.isArray(response)
            ? response
            : response?.contacts || [];

        // Refresh company dropdown
        updateCompanyFilter();

        // Apply search, filter, sorting and pagination
        applyFilters();

        // Update dashboard statistics
        updateStatistics();

    } catch (error) {

        console.error("Load contacts error:", error);

        contactTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    Failed to load contacts.
                    Please try again.
                </td>
            </tr>
        `;

        paginationInfo.textContent = "Showing 0–0 of 0 contacts";
        currentPageInfo.textContent = "Page 1 of 1";

        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;

        showMessage(error.message || "Unable to load contacts.");
    }
}


// ==========================================
// 5. DISPLAY CONTACTS
// ==========================================

function displayContacts(contactList = contacts) {

    contactTableBody.innerHTML = "";

    // Handle empty contacts or empty search results
    if (contactList.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-search";

        cell.textContent = contacts.length === 0
            ? "No contacts added yet. Click Add Contact to get started."
            : "No contacts match your search or filters.";

        row.appendChild(cell);
        contactTableBody.appendChild(row);

        return;
    }

    // Render each contact
    contactList.forEach((contact) => {

        const row = document.createElement("tr");

        // Contact information
        const values = [
            contact.name || "-",
            contact.email || "-",
            contact.phone || "-",
            contact.company || "-"
        ];

        values.forEach((value) => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        // Action buttons
        const actionCell = document.createElement("td");

        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "action-btn edit-btn";
        editButton.textContent = "Edit";
        editButton.dataset.action = "edit";
        editButton.dataset.id = contact._id;

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = contact._id;

        actionCell.append(editButton, deleteButton);

        row.appendChild(actionCell);

        contactTableBody.appendChild(row);
    });
}


// ==========================================
// 6. UPDATE DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {

    // Total contacts
    document.getElementById("totalContacts").textContent =
        contacts.length;

    // Unique companies
    const companies = new Set(
        contacts
            .map((contact) =>
                contact.company?.trim().toLowerCase()
            )
            .filter(Boolean)
    );

    document.getElementById("totalCompanies").textContent =
        companies.size;

    // Contacts created within the last 7 days
    const sevenDaysAgo =
        Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recentCount = contacts.filter((contact) => {

        const createdAt = new Date(contact.createdAt).getTime();

        return Number.isFinite(createdAt) &&
            createdAt >= sevenDaysAgo;

    }).length;

    document.getElementById("recentContacts").textContent =
        recentCount;
}


// ==========================================
// 7. POPULATE COMPANY FILTER
// ==========================================

function updateCompanyFilter() {

    // Preserve previously selected company
    const selectedCompany = companyFilter.value;

    // Get unique company names
    const companies = [
        ...new Set(
            contacts
                .map((contact) => contact.company?.trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    // Reset dropdown
    companyFilter.innerHTML = `
        <option value="">All Companies</option>
    `;

    // Add companies dynamically
    companies.forEach((company) => {

        const option = document.createElement("option");

        option.value = company;
        option.textContent = company;

        companyFilter.appendChild(option);
    });

    // Restore selection if it still exists
    if (companies.includes(selectedCompany)) {
        companyFilter.value = selectedCompany;
    }
}


// ==========================================
// 8. APPLY SEARCH, FILTER, SORTING AND PAGINATION
// ==========================================

function applyFilters(resetPage = true) {

    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const selectedCompany = companyFilter.value;

    const sortOption = sortSelect.value;

    // Create a copy so original contacts remain unchanged
    let filteredContacts = [...contacts];


    // --------------------------------------
    // A. SEARCH
    // --------------------------------------

    if (searchTerm) {

        filteredContacts = filteredContacts.filter((contact) => {

            return (
                contact.name?.toLowerCase().includes(searchTerm) ||
                contact.email?.toLowerCase().includes(searchTerm) ||
                contact.phone?.toLowerCase().includes(searchTerm) ||
                contact.company?.toLowerCase().includes(searchTerm)
            );
        });
    }


    // --------------------------------------
    // B. COMPANY FILTER
    // --------------------------------------

    if (selectedCompany) {

        filteredContacts = filteredContacts.filter(
            (contact) =>
                contact.company?.trim() === selectedCompany
        );
    }


    // --------------------------------------
    // C. SORTING
    // --------------------------------------

    switch (sortOption) {

        case "newest":

            filteredContacts.sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            );

            break;

        case "oldest":

            filteredContacts.sort(
                (a, b) =>
                    new Date(a.createdAt || 0) -
                    new Date(b.createdAt || 0)
            );

            break;

        case "nameAsc":

            filteredContacts.sort(
                (a, b) =>
                    (a.name || "").localeCompare(b.name || "")
            );

            break;

        case "nameDesc":

            filteredContacts.sort(
                (a, b) =>
                    (b.name || "").localeCompare(a.name || "")
            );

            break;
    }


    // --------------------------------------
    // D. RESET PAGE WHEN FILTERS CHANGE
    // --------------------------------------

    if (resetPage) {
        currentPage = 1;
    }


    // --------------------------------------
    // E. CALCULATE TOTAL PAGES
    // --------------------------------------

    const totalContacts = filteredContacts.length;

    const totalPages = Math.ceil(
        totalContacts / CONTACTS_PER_PAGE
    );

    // Keep current page within valid range
    if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    }

    if (totalPages === 0) {
        currentPage = 1;
    }


    // --------------------------------------
    // F. GET CURRENT PAGE CONTACTS
    // --------------------------------------

    const startIndex =
        (currentPage - 1) * CONTACTS_PER_PAGE;

    const endIndex =
        startIndex + CONTACTS_PER_PAGE;

    const currentContacts = filteredContacts.slice(
        startIndex,
        endIndex
    );


    // --------------------------------------
    // G. DISPLAY CURRENT PAGE
    // --------------------------------------

    displayContacts(currentContacts);


    // --------------------------------------
    // H. UPDATE PAGINATION
    // --------------------------------------

    updatePagination(
        totalContacts,
        totalPages,
        startIndex
    );
}


// ==========================================
// 9. UPDATE PAGINATION INFORMATION
// ==========================================

function updatePagination(
    totalContacts,
    totalPages,
    startIndex
) {

    if (totalContacts === 0) {

        paginationInfo.textContent =
            "Showing 0–0 of 0 contacts";

    } else {

        const firstContact = startIndex + 1;

        const lastContact = Math.min(
            startIndex + CONTACTS_PER_PAGE,
            totalContacts
        );

        paginationInfo.textContent =
            `Showing ${firstContact}–${lastContact} of ${totalContacts} contacts`;
    }

    // Current page information
    currentPageInfo.textContent =
        `Page ${currentPage} of ${Math.max(totalPages, 1)}`;

    // Previous button
    prevPageBtn.disabled = currentPage <= 1;

    // Next button
    nextPageBtn.disabled =
        totalPages === 0 || currentPage >= totalPages;
}


// ==========================================
// 10. FILTER EVENT LISTENERS
// ==========================================

// Search
searchInput.addEventListener("input", () => {
    applyFilters();
});

// Company filter
companyFilter.addEventListener("change", () => {
    applyFilters();
});

// Sorting
sortSelect.addEventListener("change", () => {
    applyFilters();
});

// Reset all filters
resetFiltersBtn.addEventListener("click", () => {

    searchInput.value = "";

    companyFilter.value = "";

    sortSelect.value = "newest";

    currentPage = 1;

    applyFilters();
});


// ==========================================
// 11. PAGINATION EVENT LISTENERS
// ==========================================

// Previous page
prevPageBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        // false prevents resetting the current page to 1
        applyFilters(false);
    }
});

// Next page
nextPageBtn.addEventListener("click", () => {

    currentPage++;

    // applyFilters validates the page range
    applyFilters(false);
});


// ==========================================
// 12. OPEN MODAL
// ==========================================

function openModal() {

    contactForm.reset();

    document.getElementById("contactId").value = "";

    modalTitle.textContent = "Add New Contact";

    submitBtn.textContent = "Save Contact";

    contactModal.style.display = "flex";
}


// ==========================================
// 13. CLOSE MODAL
// ==========================================

function hideModal() {

    contactModal.style.display = "none";
}


// Modal event listeners
addContactBtn.addEventListener("click", openModal);

closeModal.addEventListener("click", hideModal);

cancelBtn.addEventListener("click", hideModal);


// ==========================================
// 14. ADD OR UPDATE CONTACT
// ==========================================

contactForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const id = document.getElementById("contactId").value;

    // Collect form data
    const contactData = {

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        address: document.getElementById("address").value.trim(),

        company: document.getElementById("company").value.trim()
    };

    // Required field validation
    if (
        !contactData.name ||
        !contactData.email ||
        !contactData.phone
    ) {

        showMessage("Please fill all required fields.");

        return;
    }

    // Indian mobile number validation
    if (!/^[6-9]\d{9}$/.test(contactData.phone)) {

        showMessage(
            "Enter a valid 10-digit Indian mobile number."
        );

        return;
    }

    try {

        submitBtn.disabled = true;

        submitBtn.textContent = "Saving...";

        if (id) {

            // Update existing contact
            await updateContact(id, contactData);

            showMessage("Contact updated successfully!");

        } else {

            // Create new contact
            await createContact(contactData);

            showMessage("Contact created successfully!");
        }

        // Close modal
        hideModal();

        // Reload latest database records
        await loadContacts();

    } catch (error) {

        console.error("Save contact error:", error);

        showMessage(error.message || "Unable to save contact.");

    } finally {

        submitBtn.disabled = false;

        // Restore correct button label
        submitBtn.textContent =
            document.getElementById("contactId").value
                ? "Update Contact"
                : "Save Contact";
    }
});


// ==========================================
// 15. EDIT AND DELETE CONTACTS
// ==========================================

contactTableBody.addEventListener("click", async function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;

    const action = button.dataset.action;


    // --------------------------------------
    // EDIT CONTACT
    // --------------------------------------

    if (action === "edit") {

        const contact = contacts.find(
            (contact) => contact._id === id
        );

        if (!contact) {

            showMessage("Contact not found.");

            return;
        }

        // Populate form fields
        document.getElementById("contactId").value =
            contact._id;

        document.getElementById("name").value =
            contact.name || "";

        document.getElementById("email").value =
            contact.email || "";

        document.getElementById("phone").value =
            contact.phone || "";

        document.getElementById("address").value =
            contact.address || "";

        document.getElementById("company").value =
            contact.company || "";

        // Update modal heading and button
        modalTitle.textContent = "Edit Contact";

        submitBtn.textContent = "Update Contact";

        contactModal.style.display = "flex";
    }


    // --------------------------------------
    // DELETE CONTACT
    // --------------------------------------

    if (action === "delete") {

        const confirmed = confirm(
            "Are you sure you want to delete this contact?"
        );

        if (!confirmed) return;

        button.disabled = true;

        try {

            await deleteContact(id);

            showMessage("Contact deleted successfully!");

            // Reload contacts from MongoDB
            await loadContacts();

        } catch (error) {

            console.error("Delete contact error:", error);

            showMessage(error.message || "Unable to delete contact.");

            button.disabled = false;
        }
    }
});


// ==========================================
// 16. INITIAL APPLICATION LOAD
// ==========================================

loadContacts();
