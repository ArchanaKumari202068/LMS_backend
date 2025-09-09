require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const bookCategoryRoutes = require("./routes/bookCategoryRoutes");

const app = express();

// CORS
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,

//     credentials: true,
//   })
// );
const corsOptions ={
    origin:'http://localhost:5173', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Session for passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yoursecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(`✅ MongoDB Connected to: ${process.env.MONGO_URI}`)
  )
  .catch((err) => console.error(err));

// Routes
app.use("/api", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", bookCategoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server on http://localhost:${PORT}`)
);


