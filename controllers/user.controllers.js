const user = require("../models/user.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpgenerate = require("otp-generator");
const multer = require("multer");
const verifyToken = require("../middleware/isauth");

//  signup
const signup = async (req, res) => {
  try {
    // Check if email already exists
    let existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return res.send({ message: "User already exists" });
    }

    const { username, email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        return res.send({ message: "Error while hashing password" });
      }

      // Create new user with default role "user"
      const newUser = {
        username: username,
        email: email,
        password: hash,
        role: "user", // Default role
      };

      // Save the new user to the database
      let createdUser = await user.create(newUser);

      // Generate a JWT token
      let token = jwt.sign({ id: createdUser._id, role: createdUser.role }, "token");

      // Set the token as a cookie
      res.cookie("token", token, { httpOnly: true });

      // Redirect to the home page after successful signup
      res.redirect("/product/home");
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};
const usersignup = (req, res) => {
  res.render("signup");
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let data = await user.findOne({ email });

    if (data) {
      bcrypt.compare(password, data.password, (err, result) => {
        if (result) {
          let token = jwt.sign({ id: data._id, role: data.role }, "token");
          res.cookie("token", token); // Set token in cookies

          if (data.role === "admin") {
            return res.redirect("/user/admin");  // Redirect to admin panel
          } else {
            return res.redirect("/product/home"); // Redirect to home page
          }
        } else {
          return res.send({ msg: "Password incorrect" }); // Incorrect password
        }
      });
    } else {
      return res.send({ msg: "User not found" }); // User not found
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ msg: "Server error", error });
  }
};


// Admin login page 
const adminProfile = (req, res) => {
  res.render("adminProfile", { body: `<h3>Welcome to the Admin Panel</h3><p>Select a category from the sidebar to view its content.</p>` });
};


const userlogin = (req, res) => {
  res.render("login");
};

// user

const users = async (req, res) => {
  // console.log(req.user);
  res.send({ msg: "cheking token" });
};

// nodemailer

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kbpatel3019@gmail.com",
    pass: "sksgdkyazmqfsqji",
  },
});
const email = async (req, res) => {
  res.render("email");
};

let userdata = {}

const reset = async (req, res) => {
  let { email } = req.body;

  userdata.otp = otpgenerate.generate(6, {
    specialChars: false,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  });
  userdata.email = email;

  const mail = {
    from: "kbpatel3019@gmail.com",
    to: email,
    subject: "Forgot Password",
    html: `<h2>Verify your OTP: <strong>${userdata.otp}<strong><h2>`,
  };

  transport.sendMail(mail, (err, info) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(info);
    }
  });

  // Redirect to the OTP verification page
  res.redirect("/user/otp");
};


const verify = async (req, res) => {
  let { otp } = req.body;

  if (otp == userdata.otp) {
    res.redirect("/user/resetpass");
  } else {
    res.send("OTP does not match");
  }
};


const store = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadfile = multer({
  storage: store,
}).single("img");

const image = async (req, res) => {
  let path = path();
  path += `/${req.file.path}`;
  let User = await user.findById(req.user.id);
  User.img = path;
  console.log(path);
  await user.save();
  res.send(user);
};

const img = (req, res) => {
  res.render("img");
};

const logout = (req, res) => {
  res.clearCookie("token")
  res.redirect("/user/login")
};

const forgot = (req, res) => {
  res.render("forgot");
};
const resetpass = (req, res) => {
  res.render("resetpass")
}
const otp1 = (req, res) => {
  res.render("otp")
}

const forgotpass = async (req, res) => {
  const { newpassword, confrompassword } = req.body;

  console.log(newpassword, confrompassword);

  if (newpassword === confrompassword) {
    try {
      let updatedata = await user.findOne({ email: userdata.email });
      console.log("user", updatedata);

      if (updatedata) {
        bcrypt.hash(newpassword, 5, async (err, hash) => {
          if (err) {
            return res.send({ error: err.message });
          }

          updatedata.password = hash;
          await updatedata.save();
          console.log("data", updatedata);
          userdata = {};

          return res.send('<script>alert("Password successfully changed! Please login."); window.location.href="/user/login";</script>');
        });
      } else {
        res.send("User not found.");
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      res.status(500).send("An error occurred while changing the password.");
    }
  } else {
    res.send("Passwords do not match.");
  }
};
// to show list of user
const listuser = async (req, res) => {
  try {
    const users = await user.find()
    res.render("userslist", { users })
  }
  catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: "Error fetching players",
      data: {},
    });
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteUser = await user.findByIdAndDelete(id);
    if (deleteUser) {
      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting user", error });
  }
};

module.exports = {
  signup,
  login,
  userlogin,
  usersignup,
  users,
  reset,
  email,
  verify,
  img,
  image,
  uploadfile,
  logout,
  forgot,
  forgotpass,
  resetpass, otp1,
  listuser,
  deleteUser,
  adminProfile
};
