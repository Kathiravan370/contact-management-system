const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

// CREATE - Add a new contact
router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const savedContact = await contact.save();

    res.status(201).json({
      message: "Contact created successfully",
      contact: savedContact
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Contact ID or email already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message)
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// READ - Get all contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// READ - Get one contact by contactId
router.get("/:id", async (req, res) => {
  try {
    const contact = await Contact.findOne({
      contactId: req.params.id
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// UPDATE - Update a contact
router.put("/:id", async (req, res) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { contactId: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedContact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    res.status(200).json({
      message: "Contact updated successfully",
      contact: updatedContact
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Contact ID or email already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message)
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// DELETE - Delete a contact
router.delete("/:id", async (req, res) => {
  try {
    const deletedContact = await Contact.findOneAndDelete({
      contactId: req.params.id
    });

    if (!deletedContact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    res.status(200).json({
      message: "Contact deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;