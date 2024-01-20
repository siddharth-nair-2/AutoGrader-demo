const mongoose = require("mongoose");

// Theory Assignment Schema
const TheoryAssignmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Assignment name is required"],
      minLength: [1, "Assignment name must be at least 1 character long"],
      maxLength: [100, "Assignment name must be less than 100 characters long"],
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
      maxLength: [
        2000,
        "Assignment description must be less than 2000 characters long",
      ],
    },
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      require: [true, "Course ID required"],
      ref: "Course",
    },
    due_date: {
      type: Date,
      required: [true, "Due date is required"],
    },
    visibleToStudents: {
      type: Boolean,
      required: true,
      default: false,
    },
    instructorFiles: [
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
// Compound index for assignment name and course ID
TheoryAssignmentSchema.index({ name: 1, courseID: 1 }, { unique: true });

const TheoryAssignment = mongoose.model(
  "TheoryAssignment",
  TheoryAssignmentSchema
);

module.exports = {
  TheoryAssignment,
};
