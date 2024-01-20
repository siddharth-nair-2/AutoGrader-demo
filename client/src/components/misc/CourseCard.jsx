import React from "react";
import { useTracker } from "../../context/TrackerProvider";
import { useNavigate } from "react-router-dom";
import { HiUserGroup, HiArrowNarrowRight } from "react-icons/hi";
import { Card, Typography, Button, Tooltip } from "antd";
const { Meta } = Card;

const CourseCardMain = ({ course, description, isStudent }) => {
  const { setSelectedCourse } = useTracker();
  const navigate = useNavigate();

  const handleCourseClick = () => {
    localStorage.setItem("courseInfo", JSON.stringify(course));
    setSelectedCourse(course);
    navigate("/course");
  };

  const handleStudentsClick = () => {
    localStorage.setItem("courseInfo", JSON.stringify(course));
    setSelectedCourse(course);
    navigate("/courseStudents");
  };
  return (
    <Card
      hoverable
      className="rounded-xl shadow-md bg-white h-[275px] w-[360px] flex flex-col justify-between md:w-[400px]"
      actions={[
        !isStudent && (
          <Tooltip placement="top" title="Course Students">
            <Button
              type="text"
              icon={<HiUserGroup size={18} />}
              key="students"
              onClick={handleStudentsClick}
            />
          </Tooltip>
        ),
        <Tooltip placement="top" title="View Course">
          <Button
            type="text"
            key="open"
            onClick={handleCourseClick}
            icon={<HiArrowNarrowRight size={18} />}
          />
        </Tooltip>,
      ]}
    >
      <Meta
        title={
          <Typography.Title
            level={4}
            style={{
              color: "#6ab28a",
              marginBottom: 0,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {course.courseID}
              {course.section}
            </span>
            <Typography.Text className="block text-gray-600">
              {course.semester}
            </Typography.Text>
          </Typography.Title>
        }
        description={
          <>
            <Typography.Title level={3} className="font-bold">
              {course.name}
            </Typography.Title>
            <Typography.Text className="block">
              {course.description.length > 120
                ? `${course.description.substring(0, 120)}...`
                : course.description}
            </Typography.Text>
          </>
        }
      />
    </Card>
  );
};

export default CourseCardMain;
