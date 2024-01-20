const express = require("express");
const {
  registerUser,
  authenticateUser,
  searchUsers,
  getStudentsForCourse,
  addCourseToUser,
  getAllStudents,
  removeCourseFromUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// User Registration and Authentication
router.post("", registerUser);
router.post("/login", authenticateUser);

// Course Enrollment
router.put("/:userID/courses/add/:courseID", addCourseToUser);
router.put("/:userID/courses/remove/:courseID", removeCourseFromUser);

// User Information Retrieval
router.get("/students", getAllStudents);
router.get("/students/course/:courseID", getStudentsForCourse);
router.get("", protect, searchUsers);


/* FIX ON FRONTEND */
// router.route("/").post(registerUser).get(protect, searchUsers ); - DONE
// router.route("/allStudents").get(getAllStudents); - DONE
// router.route("/courseStudentsGet").post(getStudentsForCourse); - DONE
// router.route("/addCourseToStudents").put(addCourseToUser); - DONE
// router.route("/removeCourseStudent").put(removeCourseFromUser); - DONE
// router.post("/login", authenticateUser); - DONE

module.exports = router;
