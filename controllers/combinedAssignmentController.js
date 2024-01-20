const asyncHandler = require("express-async-handler");
const { Assignment } = require("../models/assignmentModel");
const { TheoryAssignment } = require("../models/theoryAssignmentModel");

// Combined Assignments Controller

// Get combined assignments for a course
const getCombinedAssignments = asyncHandler(async (req, res) => {
  const courseID = req.query.courseID; // Get courseID from query parameters

  if (!courseID) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  try {
    // Fetch assignments and theory assignments
    const assignments = await Assignment.find({ courseID });
    const theoryAssignments = await TheoryAssignment.find({ courseID });

    // Combine the results
    const combinedAssignments = [...assignments, ...theoryAssignments];

    if (combinedAssignments.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(combinedAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get combined assignments visible to students
const getStudentVisibleAssignments = asyncHandler(async (req, res) => {
  const courseID = req.query.courseID; // Get courseID from query parameters

  if (!courseID) {
    res.status(400).json({ message: "Course ID is required" });
    return;
  }

  try {
    // Fetch assignments and theory assignments visible to students
    const assignments = await Assignment.find({
      courseID,
      visibleToStudents: true,
    });
    const theoryAssignments = await TheoryAssignment.find({
      courseID,
      visibleToStudents: true,
    });

    // Combine the results
    const combinedAssignments = [...assignments, ...theoryAssignments];

    if (combinedAssignments.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(combinedAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Filter assignments by date
const filterAssignmentsByDate = asyncHandler(async (req, res) => {
  const { startDate, endDate, courseID } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({ message: "Start date and end date are required." });
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    const assignments = await Assignment.find({
      courseID,
      due_date: { $gte: start, $lte: end },
    });

    const theoryAssignments = await TheoryAssignment.find({
      courseID,
      due_date: { $gte: start, $lte: end },
    });

    const combinedAssignments = [...assignments, ...theoryAssignments];
    res.status(200).json(combinedAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Search Assignments by name
const searchAssignmentsByName = asyncHandler(async (req, res) => {
  const { name, courseID } = req.query;

  if (!name) {
    res
      .status(400)
      .json({ message: "Assignment name is required for search." });
    return;
  }

  try {
    const regex = new RegExp(name, "i"); // 'i' for case-insensitive

    const assignments = await Assignment.find({
      courseID,
      name: { $regex: regex },
    });

    const theoryAssignments = await TheoryAssignment.find({
      courseID,
      name: { $regex: regex },
    });

    const combinedAssignments = [...assignments, ...theoryAssignments];
    res.status(200).json(combinedAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

module.exports = {
  getCombinedAssignments,
  getStudentVisibleAssignments,
  searchAssignmentsByName,
  filterAssignmentsByDate,
};
