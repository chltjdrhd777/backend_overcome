const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { User } = require("./model/user");
const config = require("./config/key");
const { auth } = require("./middleware/auth");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));

//? get/////////////////////////////////////////////
app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.checkedUser.id,
    isAuth: true,
    email: req.checkedUser.email,
    lastName: req.checkedUser.lastName,
    role: req.checkedUser.role,
    name: req.checkedUser.name,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.checkedUser._id },
    { token: "" },
    (err, doc) => {
      if (err) return res.json({ message: "you can't log out", err });

      return res.status(200).send({ success: true });
    }
  );
});

//? post!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);
  user.save((err, userData) => {
    if (err) {
      return res.json({ success: false });
    }
    return res.status(200).json({ success: true, userData });
  });
});

app.post("/api/users/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) return res.json({ message: "there is no user", err });

    user.comparePassword(req.body.password, (ismatch) => {
      if (!ismatch)
        return res.json({ loginstate: false, message: "wrong password" });

      user.generateToken((tokenUpdatedUser) => {
        res.cookie("x_author", tokenUpdatedUser.token).status(200).json({
          logstate: "successfully logged",
          tokenUpdatedUser,
        });
      });
    });
  });
});

const port = process.env.PORT || 5050;

app.listen(port, ()=>{
  console.log(port)
});
