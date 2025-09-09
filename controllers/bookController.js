const Book = require("../models/Book");

// Create new book
exports.createBook = async (req, res) => {
  try {
    const data = {
      ...req.body,
      scannedBy: req.body.scannedBy || null,
      scannedAt: req.body.source !== "manual" ? new Date() : null,
    };

    const book = new Book(data);
    await book.save();

    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate("category", "name")
      .populate("scannedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// pagination

exports.fetchBooks = async () => {
  try {
    const res = await axios.get(`/books?page=${page}&limit=10&search=${search}`);
    const { books = [], totalPages = 1 } = res.data || {};
    setBooks(books);
    setTotalPages(totalPages || 1);
  } catch (err) {
    console.error("Error fetching books:", err);
    setBooks([]);       // fallback
    setTotalPages(1);   // fallback
  }
};


// Get single book
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("category", "name")
      .populate("scannedBy", "name email");

    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("category", "name")
      .populate("scannedBy", "name email");

    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
