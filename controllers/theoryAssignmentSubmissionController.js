const asyncHandler = require("express-async-handler");
const {
  TheoryAssignmentSubmission,
} = require("../models/theoryAssignmentSubmissionModel");

// Theory Assignment Submission Management Controllers

// Create a new theory assignment submission
const createTheoryAssignmentSubmission = asyncHandler(async (req, res) => {
  const {
    studentName,
    studentID,
    assignmentID,
    courseID,
    comment,
    submittedFiles,
  } = req.body;

  if (!studentName || !studentID || !assignmentID || !courseID || !comment) {
    res.status(400).json({ message: "Please enter all the fields!" });
    throw new Error("Please enter all the fields!");
  }
  const existingSubmission = await TheoryAssignmentSubmission.findOne({
    studentID,
    assignmentID,
  });

  if (existingSubmission) {
    res.status(400).json({ message: "Duplicate submission not allowed." });
    throw new Error("Duplicate submission not allowed.");
  }

  const submission = await TheoryAssignmentSubmission.create({
    studentName,
    studentID,
    assignmentID,
    courseID,
    comment,
    submittedFiles,
  });

  if (submission) {
    res.status(201).json(submission);
  } else {
    res.status(400);
    throw new Error("Invalid submission data");
  }
});

// Get all theory assignment submissions for an assignment
const getAllTheoryAssignmentSubmissions = asyncHandler(async (req, res) => {
  try {
    const { courseID, assignmentID } = req.query;
    const submissions = await TheoryAssignmentSubmission.find({
      courseID,
      assignmentID,
    });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get a specific theory assignment submission
const getTheoryAssignmentSubmission = asyncHandler(async (req, res) => {
  try {
    const { studentID, assignmentID } = req.query;
    const submission = await TheoryAssignmentSubmission.findOne({
      studentID,
      assignmentID,
    });
    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Update a theory assignment submission
const updateTheoryAssignmentSubmission = asyncHandler(async (req, res) => {
  try {
    const { studentID, assignmentID } = req.query;
    const { comment, submittedFiles } = req.body;

    const updatedSubmission = await TheoryAssignmentSubmission.findOneAndUpdate(
      { studentID, assignmentID },
      { comment, submittedFiles },
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
  createTheoryAssignmentSubmission,
  getAllTheoryAssignmentSubmissions,
  getTheoryAssignmentSubmission,
  updateTheoryAssignmentSubmission,
};
