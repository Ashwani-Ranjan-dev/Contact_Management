
import express from "express";

import {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact
} from "../controllers/contactController.js";

const router = express.Router();

// Create contact
router.post("/", createContact);

// Get all contacts
router.get("/", getAllContacts);

// Get single contact
router.get("/:id", getContactById);

// Update contact
router.put("/:id", updateContact);

// Delete contact
router.delete("/:id", deleteContact);

export default router;
