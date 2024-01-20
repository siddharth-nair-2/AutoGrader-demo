import axios from "axios";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Row, Typography, App } from "antd";

import Navbar from "./misc/Navbar";
import CourseCardMain from "./misc/CourseCard";
import { useAuth } from "../context/AuthProvider";
import { useTracker } from "../context/TrackerProvider";

const { Title } = Typography;

const Instructor = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, setCourses } = useTracker();

  useEffect(() => {
    fetchCourses();
    localStorage.removeItem("courseInfo");
    localStorage.removeItem("assignmentInfo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await axios.get(
        `/api/tracker/courses?instructor=${user._id}`
      );
      setCourses(data.data);
    } catch (error) {
      notification.error({
        message: "Error Occured!",
        description: "Failed to Load the courses",
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-[100%] overflow-auto bg-gray-100 p-6">
        <Title level={2} className="text-center mb-6 text-3xl font-extrabold">
          COURSES
        </Title>
        <Row gutter={[16, 16]} className="justify-center gap-4">
          {courses?.slice(0, 8).map((course) => (
            <div key={course._id}>
              <CourseCardMain
                course={course}
                description={course.description}
                isStudent={false}
              />
            </div>
          ))}
        </Row>
        <div className="text-center my-6 flex justify-center gap-4">
          {courses?.length > 8 && (
            <Button size="large" className=" font-semibold text-black">
              View All Courses
            </Button>
          )}
          <Button
            onClick={() => navigate("/createcourses")}
            className="bg-[#000000] text-white font-semibold flex justify-center items-center hover:bg-slate-100"
            size="large"
          >
            <PlusOutlined /> New Course
          </Button>
        </div>
      </div>
    </>
  );
};

export default Instructor;
