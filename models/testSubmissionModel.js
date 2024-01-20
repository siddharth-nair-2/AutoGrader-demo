const mongoose = require("mongoose");

const TestSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Replace with your Student model
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Test", // Use your Test model
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  responses: [
    {
      questionNum: Number,
      responseType: {
        type: String,
        enum: ["single", "multiple", "subjective"],
      },
      answer: mongoose.Schema.Types.Mixed,
      marksAwarded: {
        type: Number,
        default: 0,
      },
    },
  ],
  totalMarks: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const TestSubmission = mongoose.model("TestSubmission", TestSubmissionSchema);
module.exports = {
  TestSubmission,
};
