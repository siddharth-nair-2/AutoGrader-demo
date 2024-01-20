const asyncHandler = require("express-async-handler");
const { TheoryAssignment } = require("../models/theoryAssignmentModel");
const { Assignment } = require("../models/assignmentModel");

// -----------------------------
// Theory Assignment Management Controllers
// -----------------------------

// Create a new theory assignment
const createTheoryAssignment = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    courseID,
    due_date,
    visibleToStudents,
    instructorFiles,
  } = req.body;

  if (!courseID || !name || !description || !due_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const theoryAssignmentExists = await TheoryAssignment.findOne({
    courseID,
    name,
  });

  const existingAssignment = await Assignment.findOne({ courseID, name });

  if (theoryAssignmentExists || existingAssignment) {
    return res
      .status(409)
      .json({ message: "An assignment with this name already exists in this course." });
  }

  const theoryAssignment = await TheoryAssignment.create({
    courseID,
    name,
    description,
    due_date,
    visibleToStudents,
    instructorFiles,
  });
  console.log(theoryAssignment)

  if (theoryAssignment) {
    res.status(201).json(theoryAssignment);
  } else {
    res.status(400).json({ message: "Invalid theory assignment data" });
  }
});

// Update an existing theory assignment
const updateTheoryAssignment = asyncHandler(async (req, res) => {
  const assignmentID = req.params.assignmentID;
  const updateData = req.body;

  const updatedTheoryAssignment = await TheoryAssignment.findByIdAndUpdate(
    assignmentID,
    updateData,
    { new: true }
  );

  if (!updatedTheoryAssignment) {
    return res.status(404).json({ message: "Theory assignment not found" });
  }

  res.status(200).json(updatedTheoryAssignment);
});

// Delete a theory assignment
const deleteTheoryAssignment = asyncHandler(async (req, res) => {
  const assignmentID = req.params.assignmentID;

  const theoryAssignment = await TheoryAssignment.findByIdAndDelete(
    assignmentID
  );

  if (!theoryAssignment) {
    return res.status(404).json({ message: "Theory assignment not found" });
  }

  res.status(204).send();
});

// Get theory assignments for a course
const getTheoryAssignments = asyncHandler(async (req, res) => {
  const courseID = req.query.courseID;

  const theoryAssignments = await TheoryAssignment.find({ courseID });

  if (!theoryAssignments || theoryAssignments.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(theoryAssignments);
});

// Get theory assignments visible to students
const getStudentTheoryAssignments = asyncHandler(async (req, res) => {
  const courseID = req.query.courseID;

  const theoryAssignments = await TheoryAssignment.find({
    courseID,
    visibleToStudents: true,
  });

  if (!theoryAssignments || theoryAssignments.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(theoryAssignments);
});

module.exports = {
  createTheoryAssignment,
  updateTheoryAssignment,
  deleteTheoryAssignment,
  getTheoryAssignments,
  getStudentTheoryAssignments,
};
