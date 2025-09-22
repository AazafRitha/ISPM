// backend/routes/templateRoutes.js
import express from "express";
import Template from "../models/Template.js";

const router = express.Router();

// Create template
router.post("/", async (req, res) => {
  try {
    const template = await Template.create(req.body);
    res.json({ success: true, template });
  } catch (err) {
    console.error("Error creating template:", err);
    res.status(500).json({ success: false, message: "Failed to create template" });
  }
});

// Get all templates
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 }); // newest first
    res.json({ success: true, templates });
  } catch (err) {
    console.error("Error fetching templates:", err);
    res.status(500).json({ success: false, message: "Failed to fetch templates" });
  }
});

// Update template
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Template.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, template: updated });
  } catch (err) {
    console.error("Error updating template:", err);
    res.status(500).json({ success: false, message: "Failed to update template" });
  }
});

// Delete template
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Template.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, message: "Template deleted successfully" });
  } catch (err) {
    console.error("Error deleting template:", err);
    res.status(500).json({ success: false, message: "Failed to delete template" });
  }
});

export default router;
