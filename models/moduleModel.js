const mongoose = require("mongoose");

// Module Schema
const ModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Module title is required"],
      minLength: [1, "Test name must be atleast 1 character long"],
      maxLength: [64, "Test name must be less than 65 characters long"],
    },
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    content: {
      type: String,
      maxLength: [16777216, "Content exceeds maximum length"], // 16MB, the maximum BSON document size
    },
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    theoryAssignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TheoryAssignment",
      },
    ],
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      },
    ],
    files: [
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
  { timestamps: true }
);

// Ensure unique title within the same course
ModuleSchema.index({ title: 1, courseID: 1 }, { unique: true });

// Create models
const Module = mongoose.model("Module", ModuleSchema);

module.exports = {
  Module,
};
