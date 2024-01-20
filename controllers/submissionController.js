const asyncHandler = require("express-async-handler");
const { Submission } = require("../models/submissionModel");

// -----------------------------
// Submission Management Controllers
// -----------------------------

// Create a new submission
const createSubmission = asyncHandler(async (req, res) => {
  const {
    studentName,
    studentID,
    assignmentID,
    courseID,
    questionID,
    questionNum,
    questionInfo,
    languageName,
    testCases,
    answer,
  } = req.body;

  if (
    !studentName ||
    !studentID ||
    !assignmentID ||
    !courseID ||
    !questionID ||
    !questionNum ||
    !questionInfo ||
    !languageName ||
    !testCases ||
    !answer
  ) {
    res.status(400);
    throw new Error("Please enter all the fields!");
  }
  const submission = await Submission.create({
    studentName,
    studentID,
    assignmentID,
    courseID,
    questionID,
    questionNum,
    questionInfo,
    languageName,
    testCases,
    answer,
  });

  if (submission) {
    res.status(201).json({
      _id: submission._id,
      studentName: submission.studentName,
      studentID: submission.studentID,
      assignmentID: submission.assignmentID,
      courseID: submission.courseID,
      questionID: submission.questionID,
      questionNum: submission.questionNum,
      questionInfo: submission.questionInfo,
      languageName: submission.languageName,
      testCases: submission.testCases,
      answer: submission.answer,
    });
  }
});

// Compare a student's submission
const compareSubmission = asyncHandler(async (req, res) => {
  try {
    const { studentID, questionID } = req.query;
    const submissions = await Submission.find({ studentID, questionID });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get all submissions for an assignment
const getAllSubmissions = asyncHandler(async (req, res) => {
  try {
    const { courseID, assignmentID } = req.query;
    const submissions = await Submission.find({ courseID, assignmentID });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get custom submissions
const getCustomSubmissions = asyncHandler(async (req, res) => {
  try {
    const { courseID, assignmentID, questionID, languageName, studentID } =
      req.query;
    const submissions = await Submission.find({
      courseID,
      assignmentID,
      questionID,
      languageName,
    });

    const finalSubmissions = submissions.filter(
      (submission) => submission.studentID !== studentID
    );
    res.status(200).json(finalSubmissions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Update a submission
const updateSubmission = asyncHandler(async (req, res) => {
  try {
    const { courseID, assignmentID, questionID, studentID } = req.query;
    const { answer, languageName, testCases } = req.body;

    const updatedSubmission = await Submission.findOneAndUpdate(
      { courseID, assignmentID, questionID, studentID },
      { answer, languageName, testCases },
      { new: true }
    );

    if (!updatedSubmission) {
      res.status(404).send("Submission not found");
    } else {
      res.status(200).json(updatedSubmission);
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

module.exports = {
  createSubmission,
  compareSubmission,
  getAllSubmissions,
  getCustomSubmissions,
  updateSubmission,
};
