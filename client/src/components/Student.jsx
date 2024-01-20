import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { Button, Row, Typography, Card, App } from "antd";
import CourseCardMain from "./misc/CourseCard";
import Navbar from "./misc/Navbar";
import { useTracker } from "../context/TrackerProvider";

const { Title } = Typography;

const Student = () => {
  const { notification } = App.useApp();
  const { user } = useAuth();
  const { courses, setCourses } = useTracker();

  useEffect(() => {
    localStorage.removeItem("courseInfo");
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("submissionInfo");
    localStorage.removeItem("testCases");
    fetchAllCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAllCourses = async () => {
    const courseIDs = user?.courses?.map((course) => course.courseID) || [];
    if (courseIDs.length === 0) return;

    const url = `/api/tracker/studentCourses?courseIds=${courseIDs.join(
      ","
    )}`;

    try {
      const res = await axios.get(url);
      setCourses(res.data);
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
        <Title level={2} className="text-center text-3xl font-extrabold">
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
        <div className="text-center flex justify-center gap-4">
          {courses?.length > 8 && (
            <Button size="large" className=" font-semibold text-black">
              View All Courses
            </Button>
          )}
        </div>
        {(!courses || courses.length === 0) && (
          <Card
            hoverable
            className=" m-auto rounded-xl shadow-md bg-white h-[275px] w-[360px] flex md:w-[400px] items-center justify-center"
          >
            <Title level={3} className="text-center mt-6">
              You have no courses!
            </Title>
          </Card>
        )}
      </div>
    </>
  );
};

export default Student;
