const express = require("express");
const router = express.Router();
const {
  createBook,
  getBook,
  updateBook,
  deleteBook,
  fetchBooks,
} = require("../controllers/bookController");

//Fetch all books (supports pagination + search)
router.get("/", fetchBooks);

// Create a new book
router.post("/create", createBook);

//Get a single book by ID
router.get("/:id", getBook);

// Update a book
router.put("/:id", updateBook);

// Delete a book
router.delete("/:id", deleteBook);

module.exports = router;
