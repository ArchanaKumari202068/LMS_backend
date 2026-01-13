const Book = require("../models/Book");
const { generateQrString } = require("../utils/generateQrCode");

// Create book
exports.createBook = async (req, res) => {
  try {
    const value = req.body;
    const incomingQty = Number(value.quantity || 1);

    //  Check if book with same ISBN exists
    const existingBook = value.isbn
      ? await Book.findOne({ isbn: value.isbn })
      : null;

    if (existingBook) {
      //  Increase quantity & available copies
      existingBook.quantity += incomingQty;
      existingBook.availableCopies += incomingQty;

      // optional updates
      existingBook.scannedAt = new Date();
      existingBook.scannedBy = value.scannedBy || existingBook.scannedBy;

      await existingBook.save();

      return res.status(200).json({
        success: true,
        message: "Book already exists. Quantity updated.",
        data: existingBook,
      });
    }

    //  Create NEW book
    const qrPayload = JSON.stringify({
      bookId: value.isbn,
      title: value.title,
    });

    const qrCodeString = await generateQrString(qrPayload);

    const book = new Book({
      ...value,
      quantity: incomingQty,
      availableCopies: incomingQty,
      qrCodeData: qrCodeString,
      scannedAt: new Date(),
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: "New book added successfully",
      data: book,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// exports.createBook = async (req, res) => {
//   try {
//     const value = req.body;
//     const qrPayload = JSON.stringify({
//       bookId: value.isbn,
//       title: value.title,
//     });
//     const qrCodeString = await generateQrString(qrPayload);
//     const book = new Book({
//       ...value,
//       qrCodeData: qrCodeString,
//     });
//     await book.save();
//     res.status(201).json(book);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// fetch all books (search and pagination)
exports.fetchBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search = "" } = req.query;
    const query = {};

    // Optional category filter
    if (category) query.category = category;

    // Optional search by title, author, or ISBN
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ books, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Single book fetch by MongoDB ID
exports.getBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: "Invalid book ID" });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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
