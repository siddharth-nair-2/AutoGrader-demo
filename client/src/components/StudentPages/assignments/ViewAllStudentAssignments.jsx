import React, { useEffect, useState } from "react";
import { useTracker } from "../../../context/TrackerProvider";
import { App, Card, Row } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../misc/Navbar";
import Heading from "../../misc/Heading";
import AssignmentCard from "../../misc/AssignmentCard";
import Title from "antd/es/typography/Title";

const ViewAllStudentAssignments = () => {
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [assignments, setAssignments] = useState([]);
  const { notification } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("testInfo");
    localStorage.removeItem("moduleInfo");
    localStorage.removeItem("submissionInfo");
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await axios.get(
        `http://localhost:5000/api/tracker/allAssignments/visible?courseID=${
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
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))
          ) : (
            <Card className="text-center p-6">
              <Title level={4}>You have no assignments for this course!</Title>
            </Card>
          )}
        </Row>
      </div>
    </>
  );
};

export default ViewAllStudentAssignments;
