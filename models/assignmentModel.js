const mongoose = require("mongoose");

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Assignment name required"],
    minLength: [1, "Assignment name must be atleast 1 character long"],
    maxLength: [64, "Assignment name must be less than 65 characters long"],
  },
  description: {
    type: String,
    maxLength: [
      2000,
      "Assignment description must be less than 2001 characters long",
    ],
  },
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    require: [true, "Course ID required"],
    ref: "Course",
  },
  due_date: {
    type: mongoose.Schema.Types.Date,
    required: [true, "Due date is required"],
  },
  visibleToStudents: {
    type: Boolean,
    require: true,
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
  questions: [
    {
      questionNum: {
        type: Number,
        required: true,
      },
      questionInfo: {
        type: String,
        required: true,
        maxLength: [
          2000,
          "Question information must be less than 2000 characters.",
        ],
      },
      testCases: [
        {
          inputCase: {
            type: String,
            required: true,
          },
          expectedOutput: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
});
// Compound index for assignment name and course ID
AssignmentSchema.index({ name: 1, courseID: 1 }, { unique: true });

const Assignment = mongoose.model("Assignment", AssignmentSchema);

module.exports = {
  Assignment,
};
