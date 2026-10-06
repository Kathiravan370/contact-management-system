let editingContactId = null;

// Load contacts when page opens
document.addEventListener("DOMContentLoaded", loadContacts);


// Form submit
document.getElementById("contactForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const contactId = document.getElementById("contactId").value.trim();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    // Phone validation
    if (!/^[0-9]{10}$/.test(phone)) {
        showMessage("Phone number must contain exactly 10 digits.", "error");
        return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    const contact = {
        contactId,
        name,
        phone,
        email
    };

    try {

        let response;

        if (editingContactId) {

            response = await fetch(`/contacts/${editingContactId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    phone,
                    email
                })
            });

        } else {

            response = await fetch("/contacts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(contact)
            });
        }

       const responseText = await response.text();

let data;

try {
    data = JSON.parse(responseText);
} catch {
    throw new Error(responseText || "Server returned an invalid response");
}

if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
}
        if (editingContactId) {
            showMessage("Contact updated successfully.", "success");
        } else {
            showMessage("Contact added successfully.", "success");
        }

        resetForm();

        loadContacts();

    } catch (error) {

        showMessage(error.message, "error");

    }

});


// Load all contacts
async function loadContacts() {

    try {

        const response = await fetch("/contacts");

        const contacts = await response.json();

        const tableBody = document.getElementById("contactsTableBody");

        tableBody.innerHTML = "";

        if (contacts.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        No contacts found
                    </td>
                </tr>
            `;

        } else {

            contacts.forEach(contact => {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><strong>${contact.contactId}</strong></td>
                    <td>${contact.name}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.email}</td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick='editContact(${JSON.stringify(contact)})'
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteContact('${contact.contactId}')"
                        >
                            Delete
                        </button>

                    </td>
                `;

                tableBody.appendChild(row);

            });

        }

        // Update statistics
        document.getElementById("totalContacts").textContent =
            contacts.length;

        document.getElementById("phoneContacts").textContent =
            contacts.filter(contact => contact.phone).length;

        document.getElementById("emailContacts").textContent =
            contacts.filter(contact => contact.email).length;

    } catch (error) {

        showMessage("Unable to load contacts.", "error");

    }

}


// Edit contact
function editContact(contact) {

    editingContactId = contact.contactId;

    document.getElementById("contactId").value =
        contact.contactId;

    document.getElementById("name").value =
        contact.name;

    document.getElementById("phone").value =
        contact.phone;

    document.getElementById("email").value =
        contact.email;

    document.getElementById("formTitle").textContent =
        "Edit Contact";

    document.getElementById("submitBtn").innerHTML =
        "✓ Update Contact";

    document.getElementById("cancelBtn").style.display =
        "inline-block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// Delete contact
async function deleteContact(contactId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `/contacts/${contactId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Delete failed");
        }

        showMessage(
            "Contact deleted successfully.",
            "success"
        );

        loadContacts();

    } catch (error) {

        showMessage(error.message, "error");

    }

}


// Cancel edit
document.getElementById("cancelBtn").addEventListener(
    "click",
    resetForm
);


// Reset form
function resetForm() {

    editingContactId = null;

    document.getElementById("contactForm").reset();

    document.getElementById("formTitle").textContent =
        "Add New Contact";

    document.getElementById("submitBtn").innerHTML =
        "<span>＋</span> Add Contact";

    document.getElementById("cancelBtn").style.display =
        "none";

}


// Show message
function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");

    messageBox.textContent = message;

    if (type === "success") {

        messageBox.style.color = "#16a34a";

    } else {

        messageBox.style.color = "#dc2626";

    }

    setTimeout(() => {

        messageBox.textContent = "";

    }, 4000);

}


// Allow only numbers in phone field
document.getElementById("phone").addEventListener(
    "input",
    function () {

        this.value = this.value
            .replace(/\D/g, "")
            .slice(0, 10);

    }
);