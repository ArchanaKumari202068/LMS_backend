const BookCategory = require("../models/BookCategory");

// Create new category
exports.createCategory = async (req, res) => {
  console.log("Request Body:", req.body); 
  try {
    const category = new BookCategory(req.body);
    await category.save();
    res.status(201).json(category);
    console.log(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await BookCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await BookCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await BookCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
