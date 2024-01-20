import axios from "axios";
import { App, Card, Divider, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import AssignmentCard from "../../misc/AssignmentCard";
import Heading from "../../misc/Heading";
import Navbar from "../../misc/Navbar";
import TestCard from "../../misc/TestCard";

const StudentCourses = () => {
  const { selectedCourse, setSelectedCourse, user } = useTracker();
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();
  const { notification } = App.useApp();

  useEffect(() => {
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("assignmentAnswers");
    localStorage.removeItem("testCases");
    localStorage.removeItem("testInfo");
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    fetchAssignments();
    fetchTests();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await axios.get(
        `/api/tracker/allAssignments/visible?courseID=${
          JSON.parse(localStorage.getItem("courseInfo"))._id
        }`
      );
      setAssignments(data.data);
    } catch (error) {
      notification.error({
        message: "Error Occured!",
        description: "Failed to load the courses",
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };

  const fetchTests = async () => {
    try {
      const courseId = JSON.parse(localStorage.getItem("courseInfo"))._id;
      const studentId = user._id;

      // Fetch all tests for the course
      const { data: testsData } = await axios.get(
        `/api/tracker/tests/student/${courseId}`
      );

      // Fetch all submissions by the student
      const { data: submissionsData } = await axios.get(
        `/api/tracker/test-submissions/student/${studentId}`
      );

      // Mark tests as completed based on submissions
      const testsWithCompletion = testsData.map((test) => {
        const isCompleted = submissionsData.some(
          (submission) => submission.testId._id === test._id
        );
        const marks =
          isCompleted &&
          submissionsData.find(
            (submission) => submission.testId._id === test._id
          )?.totalMarks;
        return { ...test, isCompleted, marks };
      });

      setTests(testsWithCompletion);
    } catch (error) {
      notification.error({
        message: "Error Occurred!",
        description: "Failed to load tests",
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <Heading
          link={"/"}
          title={`${selectedCourse?.name.toUpperCase()}`}
          size={1}
        />
        <Card
          title={
            <span className=" w-full flex justify-center items-center text-2xl">
              Assignments
            </span>
          }
          className="mt-4  bg-transparent"
        >
          <Row gutter={[16, 16]} justify="center" className="gap-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))
            ) : (
              <p>No assignments for this course.</p>
            )}
          </Row>
        </Card>
        {/* Tests Section */}
        <Divider />
        <Card
          title={
            <span className=" w-full flex justify-center items-center text-2xl">
              Tests and Quizzes
            </span>
          }
          className="mt-4  bg-transparent"
        >
          <Row gutter={[16, 16]} justify="center" className="gap-4">
            {tests.length > 0 ? (
              tests.map((test) => (
                <TestCard
                  key={test._id}
                  test={test}
                  isCompleted={test.isCompleted}
                />
              ))
            ) : (
              <p>No tests or quizzes for this course.</p>
            )}
          </Row>
        </Card>
      </div>
    </>
  );
};

export default StudentCourses;
