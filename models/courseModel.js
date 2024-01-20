const mongoose = require("mongoose");

// Course Schema
const CourseSchema = new mongoose.Schema({
  courseID: {
    type: String,
    require: true,
    minLength: [1, "Course name must be atleast 1 character long"],
    maxLength: [10, "Course name must be less than 11 characters long"],
  },
  section: {
    type: String,
    require: true,
    minLength: [1, "Course section must be atleast 1 character long"],
    maxLength: [1, "Course section must be less than 2 characters long"],
  },
  name: {
    type: String,
    require: [true, "Course name required"],
    minLength: [1, "Course name must be atleast 1 character long"],
    maxLength: [64, "Course name must be less than 65 characters long"],
  },
  description: {
    type: String,
    maxLength: [
      2000,
      "Course description must be less than 2001 characters long",
    ],
  },
  semester: {
    type: String,
    require: [true, "Semester required"],
  },
  instructor: {
    type: String,
    require: [true, "Instructor ID required"],
  },
});

const Course = mongoose.model("Course", CourseSchema);

module.exports = {
  Course,
};
