const asyncHandler = require("express-async-handler");
const { Test } = require("../models/testModel");

// -----------------------------
// Test Management Controllers
// -----------------------------

// Create a new test record
const createTest = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    courseID,
    scheduledAt,
    testType,
    duration,
    visibleToStudents,
    questions,
    files,
  } = req.body;

  if (
    !name ||
    !courseID ||
    !scheduledAt ||
    !duration ||
    !testType ||
    visibleToStudents === null ||
    !questions ||
    !files
  ) {
    res.status(400);
    throw new Error("Please enter all the fields!");
  }

  // Create and save the test
  const test = await Test.create({
    name,
    description: description || "",
    courseID,
    testType,
    scheduledAt,
    duration,
    visibleToStudents,
    questions,
    files,
  });

  if (test) {
    res.status(201).json({
      _id: test._id,
      name: test.name,
      testType: test.type,
      description: test.description,
      courseID: test.courseID,
      scheduledAt: test.scheduledAt,
      duration: test.duration,
      files: test.files,
      visibleToStudents: test.visibleToStudents,
      questions: test.questions,
    });
  }
});

// Update an existing test
const updateTest = asyncHandler(async (req, res) => {
  const testID = req.params.testID;
  const { visibleToStudents } = req.body;

  try {
    const updatedTest = await Test.findOneAndUpdate(
      { _id: testID },
      { visibleToStudents },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Delete a test
const deleteTest = asyncHandler(async (req, res) => {
  const testID = req.params.testID; // Get testID from URL parameters

  try {
    const deletedTest = await Test.deleteOne({ _id: testID });

    if (!deletedTest.deletedCount) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json({ message: "Test successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get tests for a course
const getTestsForCourse = asyncHandler(async (req, res) => {
  const courseID = req.params.courseID; // Get courseID from URL parameters

  try {
    const tests = await Test.find({ courseID: courseID });

    if (!tests || tests.length === 0) {
      return res
        .status(404)
        .json({ message: "No tests found for this course" });
    }

    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get tests visible to students
const getStudentTests = asyncHandler(async (req, res) => {
  const courseID = req.params.courseID; // Get courseID from URL parameters
  try {
    const tests = await Test.find({
      courseID: courseID,
      visibleToStudents: true,
    });

    if (!tests.length) {
      return res.status(404).json({
        message:
          "No tests found for this course which are avaiable for students.",
      });
    }

    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get a single test by ID
const getSingleTest = asyncHandler(async (req, res) => {
  const testID = req.params.testID;

  try {
    const test = await Test.findById(testID);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get all tests
const getAllTests = asyncHandler(async (req, res) => {
  try {
    const tests = await Test.find({});

    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: "Tests not found" });
    }
    res.status(200).send(tests);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

module.exports = {
  createTest,
  updateTest,
  deleteTest,
  getTestsForCourse,
  getStudentTests,
  getAllTests,
  getSingleTest,
};
