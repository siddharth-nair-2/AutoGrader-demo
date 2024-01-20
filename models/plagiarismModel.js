const mongoose = require("mongoose");

// Plagiarism Schema
const PlagiarismSchema = new mongoose.Schema({
  courseID: {
    type: String,
    require: true,
  },
  assignmentID: {
    type: String,
    require: true,
  },
  questionID: {
    type: String,
    require: true,
  },
  questionNum: {
    type: Number,
    require: true,
  },
  languageName: {
    type: String,
    require: true,
  },
  student1Name: {
    type: String,
    require: [true, "Student 1 name required"],
  },
  student_1_ID: {
    type: String,
    require: [true, "Student 1 ID required"],
  },
  student2Name: {
    type: String,
    require: [true, "Student 2  required"],
  },
  student_2_ID: {
    type: String,
    require: [true, "Student 2 ID required"],
  },
  similarity: {
    type: Number,
    require: [true, "Similarity required"],
  },
});

const Plagiarism = mongoose.model("Plagiarism", PlagiarismSchema);

module.exports = {
  Plagiarism,
};
