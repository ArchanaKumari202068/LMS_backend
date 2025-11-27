// controllers/issueController.js
const IssuedBook = require('../models/IssuedBook');
const Book = require('../models/Book');
const User = require('../models/User');

const REGISTRATION_FEE_AMOUNT = 500; // adjust as your policy

// list issued logs
exports.listIssued = async (req,res) => {
  try {
    const { page = 1, limit = 12, status, search } = req.query;
    const q = {};
    if(status) q.status = status;
    // simple search across populated fields will be handled after .find + filter if needed
    const skip = (page-1)*limit;
    const issued = await IssuedBook.find(q).populate('user').populate('book').sort({ issuedAt: -1 }).skip(skip).limit(+limit).lean();
    const total = await IssuedBook.countDocuments(q);
    res.json({ issued, total, page:+page, limit:+limit });
  } catch(err){ res.status(500).json({ message: 'Server error' }); }
};

// issue book endpoint
// POST /api/admin/issued
// body: { userId, bookId, payNow: number (amount user pays now, optional), days: number }
exports.issueBook = async (req,res) => {
  try {
    const { userId, bookId, payNow = 0, days = 14 } = req.body;
    if(!userId || !bookId) return res.status(400).json({ message: 'Missing params' });

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if(!user || !book) return res.status(404).json({ message: 'User or Book not found' });

    if(user.isBlocked) return res.status(403).json({ message: 'User blocked - cannot issue books' });

    // enforce registration fee paid
    if(!user.registrationFeePaid || user.registrationFeeAmount < REGISTRATION_FEE_AMOUNT){
      return res.status(403).json({ message: `Registration fee ₹${REGISTRATION_FEE_AMOUNT} required to borrow` });
    }

    if(book.availableCopies <= 0) return res.status(400).json({ message: 'Book not available' });

    // Determine payment requirement
    const bookValue = book.value || 0;
    const availableAdvance = user.advanceBalance || 0;
    let usedAdvance = 0;
    let paidFromNow = 0;
    let remainingDue = 0;

    // first use advanceBalance up to bookValue
    if(availableAdvance >= bookValue){
      usedAdvance = bookValue;
      paidFromNow = 0;
      remainingDue = 0;
    } else {
      usedAdvance = availableAdvance;
      const need = bookValue - usedAdvance;
      // user can pay some amount now (payNow)
      if(payNow >= need){
        paidFromNow = need;
        remainingDue = 0;
      } else {
        paidFromNow = Math.max(0, payNow);
        remainingDue = Math.max(0, need - paidFromNow);
      }
    }

    if(remainingDue > 0){
      // Not enough funds provided - respond with amount due
      return res.status(400).json({ message: 'Insufficient funds. Remaining due to issue this book.', remainingDue });
    }

    // all good: deduct usedAdvance from user
    user.advanceBalance = Math.max(0, user.advanceBalance - usedAdvance);
    // note: paidFromNow should be handled via payment gateway or recorded (here we just store it)
    await user.save();

    // create issued record
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + parseInt(days));
    const issuedRec = await IssuedBook.create({
      user: user._id,
      book: book._id,
      dueDate,
      paidAtIssue: paidFromNow,
      usedAdvanceAtIssue: usedAdvance
    });

    // decrement available copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    res.json({ success: true, issuedRec });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// return book endpoint
// PATCH /api/admin/issued/:id/return
exports.returnBook = async (req,res) => {
  try {
    const { id } = req.params;
    const rec = await IssuedBook.findById(id).populate('book').populate('user');
    if(!rec) return res.status(404).json({ message: 'Record not found' });
    if(rec.returnedAt) return res.status(400).json({ message: 'Already returned' });

    const now = new Date();
    rec.returnedAt = now;

    // calculate overdue days and fine
    const due = rec.dueDate;
    const msPerDay = 1000*60*60*24;
    let diffDays = Math.ceil((now - due)/msPerDay);
    if(diffDays < 0) diffDays = 0;
    const finePerDay = 5; // rupees per day (adjust as needed)
    const fine = diffDays * finePerDay;
    rec.fine = fine;
    rec.status = fine > 0 ? 'overdue' : 'returned';

    await rec.save();

    // increment book available copies
    const book = await Book.findById(rec.book._id);
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    await book.save();

    // refund logic: Only refundable advance is returned.
    // We assume registration fee is non-refundable. refund the usedAdvanceAtIssue back to user (minus fine).
    const user = await User.findById(rec.user._id);
    let refundAmount = rec.usedAdvanceAtIssue || 0;
    // Deduct fine from refund; if refund not sufficient, deduct from user's advanceBalance (or record outstanding fine)
    if(fine > 0){
      if(refundAmount >= fine){
        refundAmount = refundAmount - fine;
        // fine covered by refund
      } else {
        // use refundable portion and deduct remaining fine from user's advanceBalance or mark as outstanding
        const remainingFine = fine - refundAmount;
        refundAmount = 0;
        // reduce user's advanceBalance if possible
        if(user.advanceBalance >= remainingFine){
          user.advanceBalance -= remainingFine;
        } else {
          // mark outstanding fine (could add field). For simple case, set unpaidFine
          user.unpaidFine = (user.unpaidFine || 0) + (remainingFine - user.advanceBalance);
          user.advanceBalance = 0;
        }
      }
    }

    // add refundAmount back to user's advanceBalance (this is the refundable deposit return)
    user.advanceBalance = (user.advanceBalance || 0) + refundAmount;
    await user.save();

    res.json({ success: true, rec, refundAmount, fine });
  } catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};
