const asyncHandler = require("express-async-handler");
const { Assignment } = require("../models/assignmentModel");
const { Submission } = require("../models/submissionModel");
const { Plagiarism } = require("../models/plagiarismModel");
const { TheoryAssignment } = require("../models/theoryAssignmentModel");

// -----------------------------
// Assignment Management Controllers
// -----------------------------

// Create a new assignment
const AssignmentCreate = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    due_date,
    courseID,
    questions,
    visibleToStudents,
    instructorFiles,
  } = req.body;

  if (
    !courseID ||
    !name ||
    !description ||
    !due_date ||
    !questions ||
    visibleToStudents === null
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const theoryAssignmentExists = await TheoryAssignment.findOne({
    courseID,
    name,
  });
  const existingAssignment = await Assignment.findOne({ courseID, name });

  if (theoryAssignmentExists || existingAssignment) {
    return res.status(409).json({
      message: "An assignment with this name already exists in this course.",
    });
  }

  let finalDue = new Date(due_date);
  const assignment = await Assignment.create({
    courseID,
    name,
    description,
    due_date: finalDue,
    visibleToStudents,
    questions,
    instructorFiles,
  });

  if (assignment) {
    res.status(201).json({
      _id: assignment._id,
      courseID: assignment.courseID,
      name: assignment.name,
      description: assignment.description,
      due_date: finalDue,
      questions: assignment.questions,
    });
  }
});

// Update an existing assignment
const updateAssignment = asyncHandler(async (req, res) => {
  try {
    const assignmentID = req.params.assignmentID;
    const { visibleToStudents } = req.body;

    const assignment = await Assignment.updateOne(
      { _id: assignmentID },
      { visibleToStudents },
      { new: true }
    );

    if (!assignment) {
      res.status(404).send("Assignment not found");
    } else {
      res.status(200).json(assignment);
    }
  } catch (error) {
    res.status(400).json({ message: error.message || "Server Error" });
  }
});

// Delete an assignment
const AssignmentDelete = asyncHandler(async (req, res) => {
  const assignmentID = req.params.assignmentID;

  try {
    await Assignment.deleteOne({ _id: assignmentID });
    await Submission.deleteMany({ assignmentID });
    await Plagiarism.deleteMany({ assignmentID });

    res
      .status(200)
      .send(
        "The assignment and related submissions and plagiarism checks were deleted!"
      );
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get assignments for a course
const getAssignments = asyncHandler(async (req, res) => {
  const courseID = req.query.courseID;

  try {
    const assignments = await Assignment.find({ courseID: courseID });

    if (assignments.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get assignments visible to students
const getStudentAssignments = asyncHandler(async (req, res) => {
  const courseID = req.query.courseID;

  try {
    const assignments = await Assignment.find({
      courseID,
      visibleToStudents: true,
    });

    if (assignments.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

module.exports = {
  AssignmentCreate,
  updateAssignment,
  getAssignments,
  getStudentAssignments,
  AssignmentDelete,
};
