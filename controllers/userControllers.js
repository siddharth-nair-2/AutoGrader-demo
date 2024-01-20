const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../models/userModel");

// -----------------------------
// User Authentication Controllers
// -----------------------------

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, userType } = req.body;

  if (!firstName || !lastName || !email || !password || !userType) {
    return res.status(400).json({ message: "Please enter all the fields!" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "This email is already in use!" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userType,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Unable to create user!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Authenticate a user and return token
const authenticateUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (
      user &&
      (await user.matchPassword(password)) &&
      user.userType === "Student"
    ) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        courses: user.courses,
        userType: user.userType,
        token: generateToken(user._id),
      });
    } else if (
      user &&
      (await user.matchPassword(password)) &&
      user.userType === "Instructor"
    ) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// -----------------------------
// Course Enrollment Controllers
// -----------------------------

// Add a course to a user's profile
const addCourseToUser = asyncHandler(async (req, res) => {
  const userID = req.params.userID;
  const courseID = req.params.courseID;

  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (user.courses.some((course) => course.courseID === courseID)) {
      return res
        .status(400)
        .json({ message: "Student already enrolled in the course" });
    }

    user.courses.push({ courseID });
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Save operation failed:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Remove a course from a user's profile
const removeCourseFromUser = asyncHandler(async (req, res) => {
  const { userID, courseID } = req.params;

  try {
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.courses = user.courses.filter(
      (course) => course.courseID !== courseID
    );
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// -----------------------------
// User Information Retrieval Controllers
// -----------------------------

// Get all students
const getAllStudents = asyncHandler(async (req, res) => {
  try {
    const students = await User.find({ userType: "Student" });

    if (!students) {
      return res.status(404).json({ message: "No students found" });
    }

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get students for a specific course
const getStudentsForCourse = asyncHandler(async (req, res) => {
  const courseID = req.params.courseID;
  try {
    const students = await User.find({ "courses.courseID": courseID });

    if (!students) {
      return res
        .status(404)
        .json({ message: "No students found for this course" });
    }

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Retrieve all users based on a search query
const searchUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Exporting all controllers
module.exports = {
  registerUser,
  authenticateUser,
  searchUsers,
  getStudentsForCourse,
  addCourseToUser,
  getAllStudents,
  removeCourseFromUser,
};
