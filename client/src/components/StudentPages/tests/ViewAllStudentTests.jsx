import React, { useEffect, useState } from "react";
import TestCard from "../../misc/TestCard";
import { App, Card, Row } from "antd";
import Title from "antd/es/typography/Title";
import Heading from "../../misc/Heading";
import Navbar from "../../misc/Navbar";
import axios from "axios";
import { useTracker } from "../../../context/TrackerProvider";
import { useNavigate } from "react-router-dom";

const ViewAllStudentTests = () => {
  const { selectedCourse, setSelectedCourse, user } = useTracker();
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();
  const { notification } = App.useApp();

  useEffect(() => {
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("testInfo");
    localStorage.removeItem("moduleInfo");
    localStorage.removeItem("submissionInfo");
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTests = async () => {
    try {
      const courseId = JSON.parse(localStorage.getItem("courseInfo"))._id;
      const studentId = user._id;

      // Fetch all tests for the course
      const { data: testsData } = await axios.get(
        `http://localhost:5000/api/tracker/tests/student/${courseId}`
      );

      // Fetch all submissions by the student
      const { data: submissionsData } = await axios.get(
        `http://localhost:5000/api/tracker/test-submissions/student/${studentId}`
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
      <div className="h-full overflow-auto bg-gray-100 p-6 py-2">
        <Heading
          link={"/course"}
          title={`${selectedCourse?.name.toUpperCase()}`}
          size={2}
        />
        <Row gutter={[16, 16]} justify="center" className=" gap-4">
          {tests.length > 0 ? (
            tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                isCompleted={test.isCompleted}
              />
            ))
          ) : (
            <Card className="text-center p-6">
              <Title level={4}>You have no tests for this course!</Title>
            </Card>
          )}
        </Row>
      </div>
    </>
  );
};

export default ViewAllStudentTests;
