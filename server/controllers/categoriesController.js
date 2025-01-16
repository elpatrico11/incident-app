const path = require("path");
const fs = require("fs");

//Get All Categories

const getCategories = async (req, res, next) => {
  const categoriesPath = path.join(__dirname, "../data/categories.json");
  fs.readFile(categoriesPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading categories.json:", err);
      return res.status(500).json({ msg: "Błąd serwera" });
    }
    try {
      const categories = JSON.parse(data);
      res.json(categories);
    } catch (parseErr) {
      console.error("Error parsing categories.json:", parseErr);
      res.status(500).json({ msg: "Błąd serwera" });
    }
  });
};

module.exports = {
  getCategories,
};
