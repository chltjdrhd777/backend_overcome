const { User } = require("../model/user");

const auth = (req, res, next) => {
  let token = req.cookies.x_author;

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ message: "there is no valid user" });

    req.token = token;
    req.checkedUser = user;

    next();
  });
};

module.exports = { auth };
