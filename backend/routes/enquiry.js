const express = require("express");
const router = express.Router();
const sendEnquiryEmail = require("../utils/sendemail");

router.post("/enquiry", async (req, res) => {
  try {
    const { name, phone, message, propertyTitle } = req.body;

    if (typeof name !== "string" || !name.trim() || typeof phone !== "string" || !phone.trim() || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Name, phone, aur message zaroori hain" });
    }

    if (name.length > 120 || phone.length > 40 || message.length > 4000 || (propertyTitle !== undefined && typeof propertyTitle !== "string")) {
      return res.status(400).json({ error: "Enquiry details are invalid or too long" });
    }

    await sendEnquiryEmail({ name, phone, message, propertyTitle });

    res.status(200).json({ success: true, message: "Enquiry successfully bhej di gayi" });
  } catch (err) {
    console.error("Enquiry delivery failed:", err.message);
    res.status(500).json({ error: "Enquiry bhejne mein masla hua" });
  }
});

module.exports = router;