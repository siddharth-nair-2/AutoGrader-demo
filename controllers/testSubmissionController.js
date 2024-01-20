const asyncHandler = require("express-async-handler");
const { TestSubmission } = require("../models/testSubmissionModel");
const { Test } = require("../models/testModel");

// Submit a new test
const submitTest = asyncHandler(async (req, res) => {
  const { studentId, testId, courseId, responses } = req.body;

  const test = await Test.findById(testId);
  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }

  // Calculate marks for each response
  const markedResponses = responses.map(response => {
    const question = test.questions.find(q => q.questionNum === response.questionNum);
    return {
      ...response,
      marksAwarded: calculateMarks(question, response)
    };
  });

  // Calculate total marks
  const totalMarks = markedResponses.reduce((acc, curr) => acc + curr.marksAwarded, 0);

  const newSubmission = new TestSubmission({
    studentId,
    testId,
    courseId,
    responses: markedResponses,
    totalMarks
  });

  const submission = await newSubmission.save();
  res.status(201).json(submission);
});

const calculateMarks = (question, response) => {
  if (!question || !response) return 0;

  switch (response.responseType) {
    case 'single':
      // For single choice, compare the response directly with the correct option
      const correctOption = question.options.find(option => option.isCorrect);
      return (correctOption && response.answer === correctOption.value) ? question.marks : 0;
    
    case 'multiple':
      // For multiple choice, check if all selected options are correct and no incorrect options are chosen
      const correctOptions = question.options.filter(option => option.isCorrect).map(option => option.value);
      const selectedOptions = Array.isArray(response.answer) ? response.answer : [response.answer];
      const isCorrect = correctOptions.length === selectedOptions.length &&
                        correctOptions.every(option => selectedOptions.includes(option));
      return isCorrect ? question.marks : 0;

    case 'subjective':
      return 0;

    default:
      return 0;
  }
};

// Update a test submission
const updateTestSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { responses } = req.body;

  // Find the existing submission
  const submission = await TestSubmission.findById(submissionId);
  if (!submission) {
    res.status(404);
    throw new Error("Test submission not found");
  }

  // Update the responses with new marks
  submission.responses = responses;

  // Recalculate total marks
  submission.totalMarks = submission.responses.reduce((acc, curr) => acc + curr.marksAwarded, 0);

  const updatedSubmission = await submission.save();

  res.status(200).json(updatedSubmission);
});

// Delete a test submission
const deleteTestSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  const submission = await TestSubmission.findByIdAndDelete(submissionId);

  if (!submission) {
    res.status(404);
    throw new Error("Test submission not found");
  }

  res.status(200).json({ message: "Test submission successfully deleted" });
});

// Get a specific test submission
const getTestSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  const submission = await TestSubmission.findById(submissionId).populate(
    "studentId testId courseId"
  );

  if (!submission) {
    return res.status(200).json([]);
  }

  res.status(200).json(submission);
});

// List all submissions for a specific test
const listSubmissionsForTest = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const submissions = await TestSubmission.find({ testId }).populate(
    "studentId testId courseId"
  );

  res.status(200).json(submissions);
});

// List all submissions by a specific student
const listSubmissionsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const submissions = await TestSubmission.find({ studentId }).populate(
    "testId courseId"
  );

  res.status(200).json(submissions);
});

// List all submissions for a specific course
const listSubmissionsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const submissions = await TestSubmission.find({ courseId }).populate(
    "studentId testId"
  );

  res.status(200).json(submissions);
});

// Get all test submissions
const getAllTestSubmissions = asyncHandler(async (req, res) => {
  const submissions = await TestSubmission.find({}).populate(
    "studentId testId courseId"
  );

  if (!submissions.length) {
    return res.status(200).json([]);
  }

  res.status(200).json(submissions);
});

module.exports = {
  submitTest,
  updateTestSubmission,
  deleteTestSubmission,
  getTestSubmission,
  listSubmissionsForTest,
  listSubmissionsByStudent,
  listSubmissionsForCourse,
  getAllTestSubmissions,
};
