import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import {
  Card,
  Typography,
  Space,
  Button,
  App,
  Collapse,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import {
  ReadOutlined,
  ProfileOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Navbar from "../../misc/Navbar";
import axios from "axios";
import AssignmentCard from "../../misc/AssignmentCard";
import TestCard from "../../misc/TestCard";
import EditModuleModal from "../modules/EditModuleModal";
const { Title } = Typography;

const Courses = () => {
  const { selectedCourse, setSelectedCourse } = useTracker();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const { notification } = App.useApp();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentEditingModule, setCurrentEditingModule] = useState(null);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);

  useEffect(() => {
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("testInfo");
    localStorage.removeItem("moduleInfo");
    localStorage.removeItem("submissionInfo");
    fetchModulesForCourse();
    fetchAvailableAssignments();
    fetchAvailableTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailableAssignments = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/tracker/allAssignments?courseID=${
          JSON.parse(localStorage.getItem("courseInfo"))._id
        }`
      );
      setAvailableAssignments(data);
    } catch (error) {
      notification.error({
        message: "Failed to fetch assignments",
        description:
          error.response?.data?.message ||
          "An error occurred while fetching assignments.",
      });
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/tracker/tests/course/${
          JSON.parse(localStorage.getItem("courseInfo"))._id
        }`
      );
      setAvailableTests(data);
    } catch (error) {
      notification.error({
        message: "Failed to fetch assignments",
        description:
          error.response?.data?.message ||
          "An error occurred while fetching assignments.",
      });
    }
  };
  const fetchModulesForCourse = async () => {
    try {
      const courseId = JSON.parse(localStorage.getItem("courseInfo"))?._id;

      if (!courseId) {
        notification.error({
          message: "No Course ID",
          description: "No course ID found for fetching modules.",
        });
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/tracker/modules/course/${courseId}`
      );
      setModules(response.data);
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

  const handleEditModule = (module) => {
    setCurrentEditingModule(module);
    setIsEditModalVisible(true);
  };

  const handleUpdateModule = (updatedModule) => {
    const updatedModules = modules.map((module) =>
      module._id === updatedModule._id ? updatedModule : module
    );
    setModules(updatedModules);

    setIsEditModalVisible(false);
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
          <Link to="/createmodule" className=" w-[85px]">
            <Button
              icon={<PlusOutlined />}
              className="bg-[#46282F] border-[#46282F] text-white rounded-lg text-sm font-medium flex 
          items-center justify-center hover:bg-white hover:text-[#ff5a5a] hover:border-[#46282F] -ml-4"
            >
              Module
            </Button>
          </Link>
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
        <EditModuleModal
          visible={isEditModalVisible}
          onEdit={handleUpdateModule}
          onCancel={() => setIsEditModalVisible(false)}
          moduleData={currentEditingModule}
          availableAssignments={availableAssignments}
          availableTests={availableTests}
        />
        <div className="max-w-7xl mx-auto mt-6">
          {modules.length > 0 ? (
            modules.map((module, index) => {
              const collapseItem = {
                key: String(index),
                label: (
                  <div className="flex justify-between items-center">
                    <span>{module.title}</span>
                    <EditOutlined onClick={() => handleEditModule(module)} />
                  </div>
                ),
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
                        {module.assignments.map((assignment) => (
                          <AssignmentCard
                            key={assignment._id}
                            assignment={assignment}
                          />
                        ))}
                        {module.theoryAssignments.map((assignment) => (
                          <AssignmentCard
                            key={assignment._id}
                            assignment={assignment}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="tests-section mt-4">
                      <h2 className="font-bold">Tests</h2>
                      <div className="flex justify-evenly w-full">
                        {module.tests.map((test) => (
                          <TestCard key={test._id} test={test} />
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              };

              return (
                <Collapse
                  key={index}
                  collapsible="icon"
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

export default Courses;
