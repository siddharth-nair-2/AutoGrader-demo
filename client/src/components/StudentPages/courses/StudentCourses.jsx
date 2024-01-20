import axios from "axios";
import { App, Button, Card, Collapse, Space, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Navbar from "../../misc/Navbar";
import Title from "antd/es/typography/Title";
import TestCard from "../../misc/TestCard";
import AssignmentCard from "../../misc/AssignmentCard";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PlusOutlined,
  ProfileOutlined,
  ReadOutlined,
} from "@ant-design/icons";

const StudentCourses = () => {
  const { selectedCourse, setSelectedCourse, user } = useTracker();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const { notification } = App.useApp();

  useEffect(() => {
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("assignmentAnswers");
    localStorage.removeItem("testCases");
    localStorage.removeItem("testInfo");
    localStorage.removeItem("moduleInfo");
    localStorage.removeItem("submissionInfo");
    fetchModulesForCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchModulesForCourse = async () => {
    try {
      const courseId = JSON.parse(localStorage.getItem("courseInfo"))?._id;
      const studentId = user._id;

      if (!courseId) {
        notification.error({
          message: "No Course ID",
          description: "No course ID found for fetching modules.",
        });
        return;
      }

      const { data: modulesData } = await axios.get(
        `http://localhost:5000/api/tracker/modules/course/${courseId}`
      );

      const { data: submissionsData } = await axios.get(
        `http://localhost:5000/api/tracker/test-submissions/student/${studentId}`
      );

      const modulesWithTestStatus = modulesData.map((module) => {
        const updatedTests = module.tests.map((test) => {
          const isCompleted = submissionsData.some(
            (submission) => submission.testId._id === test._id
          );
          const marks = isCompleted
            ? submissionsData.find(
                (submission) => submission.testId._id === test._id
              )?.totalMarks
            : undefined;

          return { ...test, isCompleted, marks };
        });

        return { ...module, tests: updatedTests };
      });

      setModules(modulesWithTestStatus);
    } catch (error) {
      notification.error({
        message: "Failed to Fetch Modules",
        description:
          error.response?.data?.message ||
          "An error occurred while fetching modules.",
      });
    }
  };

  const CourseActionCard = ({ title, icon, navigateTo }) => (
    <Card
      hoverable
      onClick={() => navigate(navigateTo)}
      className="text-center shadow-lg"
    >
      {icon}
      <Title level={4}>{title}</Title>
    </Card>
  );

  const handleDownloadFile = (filePath) => {
    window.open(filePath, "_blank");
  };

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <div className="flex justify-between items-center">
          <Link to="/">
            <Button
              icon={<ArrowLeftOutlined />}
              className=" sm:mb-0 bg-black border-black text-white rounded-lg text-sm font-medium flex 
            items-center justify-center hover:bg-white hover:text-black hover:border-black"
            >
              Back
            </Button>
          </Link>
          <Title className="text-center my-4" level={3}>
            {selectedCourse?.name.toUpperCase()}
          </Title>
          <div className=" w-[85px]"></div>
        </div>
        <Space
          direction="vertical"
          size="large"
          className="w-full h-full flex flex-col items-center justify-center mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <CourseActionCard
              title="View All Assignments"
              icon={<ReadOutlined style={{ fontSize: "24px" }} />}
              navigateTo="/viewallassignments"
            />
            <CourseActionCard
              title="View All Tests"
              icon={<ProfileOutlined style={{ fontSize: "24px" }} />}
              navigateTo="/viewalltests"
            />
          </div>
        </Space>
        <div className="max-w-7xl mx-auto mt-6">
          {modules.length > 0 ? (
            modules.map((module, index) => {
              const collapseItem = {
                key: String(index),
                label: module.title,
                children: (
                  <div>
                    <h2 className="font-bold">Description</h2>
                    <p>{module.content}</p>
                    <div className="mt-4">
                      <div className="flex justify-around">
                        {module.files.map((file, fileIndex) => (
                          <Tooltip key={fileIndex} title={file.fileName}>
                            <Button
                              type="primary"
                              className="main-black-btn"
                              onClick={() => handleDownloadFile(file.filePath)}
                              icon={<DownloadOutlined />}
                            >
                              File {fileIndex + 1}
                            </Button>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                    <div className="assignments-section mt-4">
                      <h2 className="font-bold">Assignments</h2>
                      <div className="flex justify-evenly w-full">
                        {module.assignments.map(
                          (assignment) =>
                            assignment.visibleToStudents && (
                              <AssignmentCard
                                key={assignment._id}
                                assignment={assignment}
                              />
                            )
                        )}
                        {module.theoryAssignments.map(
                          (assignment) =>
                            assignment.visibleToStudents && (
                              <AssignmentCard
                                key={assignment._id}
                                assignment={assignment}
                              />
                            )
                        )}
                      </div>
                    </div>
                    <div className="tests-section mt-4">
                      <h2 className="font-bold">Tests</h2>
                      <div className="flex justify-evenly w-full">
                        {module.tests.map((test) => (
                          <TestCard
                            key={test._id}
                            test={test}
                            isCompleted={test.isCompleted}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              };

              return (
                <Collapse
                  key={index}
                  className="mb-6 shadow-md"
                  size="large"
                  items={[collapseItem]}
                />
              );
            })
          ) : (
            <Card className="text-center p-6">
              <Title level={4}>You have no modules for this course!</Title>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentCourses;
