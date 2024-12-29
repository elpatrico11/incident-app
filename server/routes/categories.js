const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/categoriesController");

// GET /api/categories - Retrieve all categories
router.get("/", getCategories);

module.exports = router;
