const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/categoriesController");

//Get all categories
router.get("/", getCategories);

module.exports = router;
