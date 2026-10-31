import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import { validateContactData } from "../utils/validators.js";

// Create a new contact
export const createContact = async (req, res) => {
    try {
        const validation = validateContactData(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const { name, email, phone, address, company } = validation.data;

        // Check whether email or phone already exists
        const existingContact = await Contact.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingContact) {
            const message =
                existingContact.email === email
                    ? "A contact with this email already exists."
                    : "A contact with this phone number already exists.";

            return res.status(409).json({
                success: false,
                message
            });
        }

        const contact = await Contact.create({
            name,
            email,
            phone,
            address,
            company
        });

        return res.status(201).json({
            success: true,
            message: "Contact created successfully.",
            data: contact
        });

    } catch (error) {
        console.error("Create contact error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create contact. Please try again."
        });
    }
};


// Get all contacts
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });

    } catch (error) {
        console.error("Get contacts error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch contacts."
        });
    }
};


// Get one contact by ID
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID."
            });
        }

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error("Get contact error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch contact."
        });
    }
};


// Update a contact
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID."
            });
        }

        const validation = validateContactData(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const { name, email, phone, address, company } = validation.data;

        // Check for duplicate email or phone on another contact
        const existingContact = await Contact.findOne({
            _id: { $ne: id },
            $or: [{ email }, { phone }]
        });

        if (existingContact) {
            const message =
                existingContact.email === email
                    ? "Another contact already uses this email."
                    : "Another contact already uses this phone number.";

            return res.status(409).json({
                success: false,
                message
            });
        }

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            {
                name,
                email,
                phone,
                address,
                company
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedContact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact updated successfully.",
            data: updatedContact
        });

    } catch (error) {
        console.error("Update contact error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update contact."
        });
    }
};


// Delete a contact
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID."
            });
        }

        const deletedContact = await Contact.findByIdAndDelete(id);

        if (!deletedContact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact deleted successfully."
        });

    } catch (error) {
        console.error("Delete contact error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete contact."
        });
    }
};