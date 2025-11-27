// controllers/userController.js
const User = require('../models/User');
const IssuedBook = require('../models/IssuedBook');

exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '' } = req.query;
    const q = search ? { $or:[ { name: new RegExp(search,'i') }, { email: new RegExp(search,'i') } ] } : {};
    const skip = (page-1)*limit;
    const [users, total] = await Promise.all([
      User.find(q).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(q)
    ]);
    // include borrowed count quickly
    const usersWithCounts = await Promise.all(users.map(async u => {
      const borrowed = await IssuedBook.countDocuments({ user: u._id, status: { $in: ['issued','overdue'] }});
      return { ...u, borrowedCount: borrowed };
    }));
    res.json({ users: usersWithCounts, total, page:+page, limit:+limit });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if(!user) return res.status(404).json({ message: 'Not found' });
    const issued = await IssuedBook.find({ user: id }).populate('book').lean();
    res.json({ user, issued });
  } catch(err){ res.status(500).json({ message: 'Server error' }); }
};

exports.updateUser = async (req,res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    // don't allow password updates here; separate flow recommended
    delete update.password;
    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    res.json({ user });
  } catch(err){ res.status(500).json({ message: 'Server error' }); }
};

exports.adjustAdvance = async (req,res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body; // type: 'credit' or 'debit'
    const user = await User.findById(id);
    if(!user) return res.status(404).json({ message: 'User not found' });
    if(type === 'credit') user.advanceBalance += Math.abs(amount);
    else user.advanceBalance = Math.max(0, user.advanceBalance - Math.abs(amount));
    await user.save();
    res.json({ success:true, advanceBalance: user.advanceBalance });
  } catch(err){ res.status(500).json({ message: 'Server error' }); }
};

exports.toggleBlock = async (req,res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if(!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success:true, isBlocked: user.isBlocked });
  } catch(err){ res.status(500).json({ message: 'Server error' }); }
};
