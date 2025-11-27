const express = require("express");
const router = express.Router();

const {
  listUsers,
  getUserDetails,
  updateUser,
  toggleBlock,
  adjustAdvance,
} = require("../controllers/userController");

const {
  listIssued,
  issueBook,
  returnBook,
} = require("../controllers/issueController");

// ------- User Management -------
router.get("/users", listUsers);
router.get("/users/:id/details", getUserDetails);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/block", toggleBlock);
router.post("/users/:id/advance", adjustAdvance);

// ------- Issue / Return Logs -------
router.get("/issued", listIssued);
router.post("/issued", issueBook);
router.patch("/issued/:id/return", returnBook);

module.exports = router;
