import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, App, Select } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import Navbar from "../../misc/Navbar";
import Heading from "../../misc/Heading";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import { useAuth } from "../../../context/AuthProvider";

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateModules = () => {
  const [form] = Form.useForm();
  const { notification, modal } = App.useApp();
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (localStorage.getItem("courseInfo") === null) {
      navigate("/");
    } else {
      setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
      fetchAvailableAssignments();
      fetchAvailableTests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailableAssignments = async () => {
    try {
      const { data } = await axios.get(
        `/api/tracker/allAssignments?courseID=${
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
        `/api/tracker/tests/course/${
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

  const onFinish = async (values) => {
    const { name, description, assignments, tests } = values;

    // Basic validations
    if (!name.trim() || name.length > 64) {
      notification.error({
        message: "Invalid Test Name",
        description: "Test name cannot be empty or too lengthy.",
      });
      return;
    }

    if (description && description.length > 2000) {
      notification.error({
        message: "Description Too Long",
        description: "Description cannot exceed 2000 characters.",
      });
      return;
    }

    if (fileList.length > 0) {
      modal.confirm({
        title: "Confirm File Upload and Module Creation",
        content: (
          <div>
            <p>
              {(!assignments ||
                assignments.length === 0 ||
                !tests ||
                tests.length === 0) &&
                "Are you sure you want to create the module without any"}
              {(() => {
                let messageParts = [];

                if (!assignments || assignments.length === 0) {
                  messageParts.push("assignments");
                }

                if (!tests || tests.length === 0) {
                  messageParts.push("tests");
                }

                return messageParts.length > 0
                  ? ` ${messageParts.join(" and ")}?`
                  : "";
              })()}
            </p>
            <br />
            <p>You have uploaded the following files:</p>
            <ul>
              {fileList.map((file) => (
                <li key={file.uid}>{file.name}</li>
              ))}
            </ul>
          </div>
        ),
        onOk: () => handleUpload(values),
        okButtonProps: {
          className: " main-black-btn",
        },
      });
    } else {
      modal.confirm({
        title: "Confirm Module Creation",
        content: (
          <div>
            <p>
              Are you sure you want to create the module without any files
              {(() => {
                let messageParts = [];

                if (!assignments || assignments.length === 0) {
                  messageParts.push("assignments");
                }

                if (!tests || tests.length === 0) {
                  messageParts.push("tests");
                }

                return messageParts.length > 0
                  ? `, and ${messageParts.join(" and ")}`
                  : "";
              })()}
              ?
            </p>
          </div>
        ),
        onOk: () => CreateModules(values, []),
        okButtonProps: {
          className: " main-black-btn",
        },
      });
    }
  };

  const CreateModules = async (formData, uploadedFiles) => {
    const { name, description, assignments = [], tests = [] } = formData;

    // Categorize the selected assignments into assignments and theoryAssignments
    const categorizedAssignments = {
      assignments: [],
      theoryAssignments: [],
    };

    assignments.forEach((assignmentId) => {
      const fullAssignment = availableAssignments.find(
        (a) => a._id === assignmentId
      );

      if (
        fullAssignment &&
        fullAssignment.questions &&
        fullAssignment.questions.length > 0
      ) {
        categorizedAssignments.assignments.push(assignmentId);
      } else {
        categorizedAssignments.theoryAssignments.push(assignmentId);
      }
    });

    try {
      const { data } = await axios.post(
        "/api/tracker/module",
        {
          courseID: selectedCourse._id,
          title: name,
          content: description ? description : "",
          assignments: categorizedAssignments.assignments,
          theoryAssignments: categorizedAssignments.theoryAssignments,
          tests: tests,
          files: uploadedFiles,
        }
      );

      notification.success({
        message: "Module created successfully!",
        description: `Module ${data.name} has been created.`,
        duration: 4,
        placement: "bottomLeft",
      });

      navigate("/course");
    } catch (error) {
      notification.error({
        message: "Error creating test",
        description:
          error.response?.data?.message || "Failed to create the module",
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };

  const handleUpload = async (formData) => {
    const uploadPromises = fileList.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "kgen9eiq");
      formData.append("folder", "module-files");
      return axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/upload`,
        formData
      );
    });

    try {
      const uploadResponses = await Promise.all(uploadPromises);
      const uploadedFiles = uploadResponses.map((response) => {
        let url = response.data.url; // URL of the uploaded file
        const fileName = response.data.original_filename; // Original file name
        const publicId = response.data.public_id; // Public ID of the uploaded file

        if (!publicId.includes(".")) {
          url = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUD_NAME}/image/upload/fl_attachment/${publicId}`;
        }

        return {
          publicId: publicId,
          fileName: fileName,
          filePath: url,
        };
      });

      // Now create the test with the uploaded files
      CreateModules(formData, uploadedFiles);
    } catch (error) {
      notification.error({
        message: "File upload failed",
        description: error.message,
      });
    }
  };

  const props = {
    multiple: true,
    onRemove: (file) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList((prevFileList) => [...prevFileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <Heading link="/course" title="CREATE A MODULE" />

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="max-w-3xl mx-auto mt-6"
        >
          <Form.Item
            name="name"
            rules={[{ required: true }]}
            label={<span className="font-bold">Name</span>}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span className="font-bold">Content</span>}
          >
            <TextArea autoSize={{ minRows: 3 }} />
          </Form.Item>
          <Form.Item
            name="assignments"
            label={<span className="font-bold">Assignments</span>}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select assignments"
              // The value format is expected to be an array of assignment IDs
            >
              {availableAssignments.map((assignment) => (
                <Select.Option key={assignment._id} value={assignment._id}>
                  {assignment.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tests"
            label={<span className="font-bold">Tests</span>}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select tests"
              // The value format is expected to be an array of test IDs
            >
              {availableTests.map((test) => (
                <Select.Option key={test._id} value={test._id}>
                  {test.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* File Upload */}
          <Form.Item label={<span className="font-bold">Module Files</span>}>
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="w-full main-black-btn"
            >
              Create Module
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CreateModules;
