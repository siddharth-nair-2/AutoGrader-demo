const asyncHandler = require("express-async-handler");
const { Plagiarism } = require("../models/plagiarismModel");

// -----------------------------
// Plagiarism Management Controllers
// -----------------------------

// Create or update a plagiarism record
const plagiarismCreate = asyncHandler(async (req, res) => {
  const {
    courseID,
    assignmentID,
    questionID,
    questionNum,
    languageName,
    student1Name,
    student_1_ID,
    student2Name,
    student_2_ID,
    similarity,
  } = req.body;

  if (
    !courseID ||
    !assignmentID ||
    !questionID ||
    !questionNum ||
    !languageName ||
    !student1Name ||
    !student_1_ID ||
    !student2Name ||
    !student_2_ID ||
    !similarity
  ) {
    res.status(400);
    throw new Error("Please enter all the fields!");
  }
  const comparisonExists = await Plagiarism.findOne({
    courseID,
    assignmentID,
    questionID,
    languageName,
    student_1_ID,
    student_2_ID,
  });
  let finalSimilarity = similarity;
  if (finalSimilarity > 100) finalSimilarity = 100;

  if (comparisonExists) {
    const submissions = await Plagiarism.updateOne(
      {
        courseID,
        assignmentID,
        questionID,
        languageName,
        student_1_ID,
        student_2_ID,
      },
      {
        similarity: finalSimilarity,
      }
    );
    if (submissions) {
      res.status(201).json({
        courseID,
        assignmentID,
        questionID,
        questionNum,
        languageName,
        student1Name,
        student_1_ID,
        student2Name,
        student_2_ID,
        similarity: finalSimilarity,
      });
    }
  } else {
    const plagiarism = await Plagiarism.create({
      courseID,
      assignmentID,
      questionID,
      questionNum,
      languageName,
      student1Name,
      student_1_ID,
      student2Name,
      student_2_ID,
      similarity: finalSimilarity,
    });

    if (plagiarism) {
      res.status(201).json({
        courseID,
        assignmentID,
        questionID,
        questionNum,
        languageName,
        student1Name,
        student_1_ID,
        student2Name,
        student_2_ID,
        similarity: finalSimilarity,
      });
    }
  }
});

// Get all plagiarism records for an assignment
const getAllPlagiarisms = asyncHandler(async (req, res) => {
  try {
    const { courseID, assignmentID } = req.query;
    const plagiarism = await Plagiarism.find({
      courseID: courseID,
      assignmentID: assignmentID,
    });

    res.status(200).send(plagiarism);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  plagiarismCreate,
  getAllPlagiarisms,
};
