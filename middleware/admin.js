const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  try {
    let { token } = req.cookies;

    if (!token) {
      return res.redirect("/user/login");
    }

    let data = jwt.verify(token, "token"); // Verifies the token
    console.log("data", data);

    if (data.role === "admin") {
      req.user = data; // Add user details to request
      next(); // Proceed to the next middleware
    } else {
      return res.status(403).send("Access denied! Not an admin.");
    }
  } catch (error) {
    console.error("isAdmin middleware error:", error.message);
    return res.redirect("/user/login"); // Redirect to login on error
  }
};

module.exports = isAdmin;
