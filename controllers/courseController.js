const asyncHandler = require("express-async-handler");
const { Course } = require("../models/courseModel");

// -----------------------------
// Course Management Controllers
// -----------------------------

// Create a new course
const courseCreate = asyncHandler(async (req, res) => {
  const { name, description, semester, instructor, courseID, section } =
    req.body;

  if (
    !courseID ||
    !name ||
    !description ||
    !semester ||
    !instructor ||
    !section
  ) {
    res.status(400);
    throw new Error("Please enter all the fields!");
  }
  const courseExists = await Course.findOne({
    courseID,
    semester,
    instructor,
    section,
  });
  if (courseExists) {
    res.status(400);
    throw new Error("This course already exists!");
  }
  const course = await Course.create({
    courseID,
    name,
    description,
    semester,
    instructor,
    section,
  });

  if (course) {
    res.status(201).json({
      _id: course._id,
      courseID: course.courseID,
      name: course.name,
      description: course.description,
      semester: course.semester,
      section: course.section,
      instructor: course.instructor,
    });
  }
});

// Get all courses for an instructor
const getCourses = asyncHandler(async (req, res) => {
  const instructorId = req.query.instructor; // Assuming instructor ID comes from query string
  const courses = await Course.find({ instructor: instructorId });
  res.status(200).json(courses);
});

// Get a single course by ID
const getSingleCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.courseID; // Assuming course ID comes from URL parameter
  const course = await Course.findById(courseId);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.status(200).json(course);
});

// Get courses for a student
const getStudentCourses = asyncHandler(async (req, res) => {
  try {
    // Assuming the student's course IDs are passed as a comma-separated string in the query parameter
    const courseIds = req.query.courseIds;
    if (!courseIds) {
      res.status(400);
      throw new Error("No course IDs provided");
    }

    // Split the courseIds string into an array
    const courseIDArray = courseIds.split(",");

    const promises = courseIDArray.map((courseID) => {
      return Course.findById(courseID);
    });

    const courseInformation = await Promise.all(promises);
    res.status(200).json(courseInformation);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  courseCreate,
  getCourses,
  getSingleCourse,
  getStudentCourses,
};
