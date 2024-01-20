const mongoose = require("mongoose");

// Submission Schema
const TheoryAssignmentSubmissionSchema = new mongoose.Schema(
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
    comment: {
      type: String,
      require: [true, "Comment Required"],
    },
    submittedFiles: [
      {
        publicId: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        filePath: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const TheoryAssignmentSubmission = mongoose.model(
  "TheoryAssignmentSubmission",
  TheoryAssignmentSubmissionSchema
);

module.exports = {
  TheoryAssignmentSubmission,
};
