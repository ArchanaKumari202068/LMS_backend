const express = require("express");
const router = express.Router();
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  fetchBooks,
} = require("../controllers/bookController");

router.post("/", createBook);
router.get("/", getBooks);
router.get("/:id", getBook);
router.get("/books/:id",fetchBooks)
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;
