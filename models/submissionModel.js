const mongoose = require("mongoose");

// Submission Schema
const SubmissionsSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      require: [true, "Student name required"],
      minLength: [1, "Student name must be atleast 1 character long"],
      maxLength: [64, "Student name must be less than 65 characters long"],
    },
    studentID: {
      type: String,
      require: [true, "Student ID required"],
    },
    assignmentID: {
      type: String,
      require: [true, "Assignment ID required"],
    },
    courseID: {
      type: String,
      require: [true, "Course ID required"],
    },
    questionID: {
      type: String,
      require: [true, "Question ID required"],
    },
    questionNum: {
      type: String,
      require: [true, "Question Number required"],
    },
    questionInfo: {
      type: String,
      require: [true, "Question Information required"],
    },
    languageName: {
      type: String,
      require: [true, "Language Information required"],
    },
    testCases: {
      type: String,
      require: [true, "Test Cases Information required"],
    },
    answer: {
      type: String,
      require: [true, "Answer Required"],
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model("Submission", SubmissionsSchema);

module.exports = {
  Submission,
};
