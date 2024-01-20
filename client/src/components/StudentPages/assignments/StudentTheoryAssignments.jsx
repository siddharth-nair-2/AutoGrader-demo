import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Navbar from "../../misc/Navbar";
import {
  Typography,
  Button,
  Card,
  Upload,
  Form,
  Input,
  Tooltip,
  App,
} from "antd";
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import Heading from "../../misc/Heading";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

const StudentTheoryAssignments = () => {
  const { selectedCourse, setSelectedCourse, user } = useTracker();
  const [selectedAssignment, setSelectedAssignment] = useState();
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();

  useEffect(() => {
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    setSelectedAssignment(JSON.parse(localStorage.getItem("assignmentInfo")));
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    if (!JSON.parse(localStorage.getItem("assignmentInfo"))) {
      navigate("/course");
    }
  }, []);

  const handleDownloadFile = (filePath) => {
    window.open(filePath, "_blank");
  };

  const onFinish = async (values) => {
    const { comment } = values;

    if (fileList.length < 1 && !comment) {
      notification.error({
        message: "No information or files!!",
        description: "You have to upload at least 1 file or enter a comment.",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }

    if (comment && comment.trim().length === 0) {
      notification.error({
        message: "Missing Information",
        description: "Please enter a comment!",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/tracker/theory-submission?studentID=${user._id}&assignmentID=${selectedAssignment._id}`
      );
      if (response.data) {
        // Existing submission found
        confirmOverwrite(response.data.submittedFiles, values);
      } else {
        modal.confirm({
          title: `Are you sure you want to upload ${fileList.length} files?`,
          content: (
            <div className="my-2">
              <p className="mb-2 font-semibold">Files to be uploaded:</p>
              <ol className=" list-decimal list-inside">
                {fileList.map((file) => (
                  <li
                    style={{}}
                    key={file.uid}
                    className=" bg-white p-1 rounded-lg text-black"
                  >
                    <Text ellipsis>{file.name}</Text>
                  </li>
                ))}
              </ol>
            </div>
          ),
          onOk: async () => {
            await handleUpload();
          },
          onCancel() {},
          okButtonProps: {
            className: " main-black-btn",
          },
          cancelButtonProps: {
            className: " hover:!border-black hover:!text-black",
          },
          width: 800,
        });
      }
    } catch (error) {
      notification.error({
        message: "Error Occured!",
        description: error.message,
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }
  };

  const confirmOverwrite = (existingFiles, values) => {
    modal.confirm({
      title: "Overwrite Submission? ",
      content: (
        <div className="my-2">
          <p className="mb-2 font-semibold">
            You have already submitted this assignment. Do you want to overwrite
            your existing submission?
          </p>
          <p className="mb-2 font-semibold">Files to be uploaded:</p>
          <ol className=" list-decimal list-inside">
            {fileList.map((file) => (
              <li
                style={{}}
                key={file.uid}
                className=" bg-white p-1 rounded-lg text-black"
              >
                <Text ellipsis>{file.name}</Text>
              </li>
            ))}
          </ol>
        </div>
      ),
      okButtonProps: {
        className: " main-black-btn",
      },
      cancelButtonProps: {
        className: " hover:!border-black hover:!text-black",
      },
      onOk: async () => {
        await deleteOldFiles(existingFiles);
        await handleUpload(values, true); // true indicates an update
      },
    });
  };

  const deleteOldFiles = async (files) => {
    const publicIds = files.map((file) => file.publicId);
    try {
      await axios.post("http://localhost:5000/api/tracker/delete-file", {
        publicIds,
      });
    } catch (error) {
      notification.error({
        message: "Error Occured!",
        description: error.message,
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };

  const handleUpload = async (isUpdate = false) => {
    const uploadPromises = fileList.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "kgen9eiq");

      return axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/upload`,
        formData
      );
    });

    try {
      const responses = await Promise.all(uploadPromises);

      const uploadedFiles = responses.map((response) => {
        let url = response.data.url;
        const publicId = response.data.public_id;
        const fileName = response.data.original_filename;

        if (!publicId.includes(".")) {
          url = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUD_NAME}/image/upload/fl_attachment/${publicId}`;
        }

        return {
          publicId: publicId,
          fileName: fileName,
          filePath: url,
        };
      });

      if (isUpdate) {
        await updateSubmission(uploadedFiles); // Update the assignment details
      } else {
        await submitAssignment(uploadedFiles); // Submit the assignment details
      }
    } catch (error) {
      notification.error({
        message: "File upload failed",
        description: error.message,
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };

  const updateSubmission = async (uploadedFiles) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/tracker/theory-submission/update?studentID=${user._id}&assignmentID=${selectedAssignment._id}`,
        {
          comment: form.getFieldValue("comment")
            ? form.getFieldValue("comment")
            : "N/A",
          submittedFiles: uploadedFiles,
        }
      );

      notification.success({
        message: "Assignment Updated",
        description: "Your assignment was updated successfully!",
        duration: 4,
        placement: "bottomLeft",
      });
    } catch (error) {
      notification.error({
        message: "Overwrite Failed",
        description: error.message,
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };

  const submitAssignment = async (uploadedFiles) => {
    try {
      await axios.post("http://localhost:5000/api/tracker/theory-submission", {
        studentName: `${user.firstName} ${user.lastName}`,
        studentID: user._id,
        assignmentID: selectedAssignment._id,
        courseID: selectedCourse._id,
        comment: form.getFieldValue("comment")
          ? form.getFieldValue("comment")
          : "N/A",
        submittedFiles: uploadedFiles,
      });

      notification.success({
        message: "Assignment Submitted",
        description: "Your assignment was submitted successfully!",
        duration: 4,
        placement: "bottomLeft",
      });
    } catch (error) {
      notification.error({
        message: "Submission Failed",
        description: error.message,
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };

  const draggerProps = {
    multiple: true,
    onRemove: (file) => {
      setFileList(fileList.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <>
      <Navbar />
      {selectedCourse &&
        selectedCourse.name &&
        selectedAssignment &&
        selectedAssignment.name && (
          <div className="min-h-full bg-gray-100">
            <div className="px-6 bg-[#5bb38a]">
              <Heading
                link={"/course"}
                title={`${selectedCourse?.name.toUpperCase()} - ${
                  selectedAssignment?.name
                }`}
                size={4}
              />
            </div>
            <div className="max-w-3xl mx-auto mt-6">
              <div className="p-6">
                <Card className="mb-4">
                  <Text strong>Description:</Text>
                  <p>{selectedAssignment.description}</p>
                </Card>

                {selectedAssignment.instructorFiles?.length > 0 && (
                  <Card title="Documents" className="mb-4">
                    <div className=" flex justify-around">
                      {selectedAssignment.instructorFiles.map((file, index) => (
                        <Tooltip key={index} title={file.fileName}>
                          <Button
                            type="primary"
                            className=" main-black-btn"
                            onClick={() => handleDownloadFile(file.filePath)}
                            icon={<DownloadOutlined />}
                          >
                            File {index + 1}
                          </Button>
                        </Tooltip>
                      ))}
                    </div>
                  </Card>
                )}

                <Form form={form} layout="vertical" onFinish={onFinish}>
                  <Form.Item
                    name="comment"
                    label={<span className=" font-bold">Your Comment</span>}
                  >
                    <TextArea rows={4} placeholder="Type your comment here" />
                  </Form.Item>

                  <Form.Item
                    label={<span className=" font-bold">Your Files</span>}
                  >
                    <Dragger {...draggerProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area to upload
                      </p>
                      <p className="ant-upload-hint">
                        Support for a single or bulk upload.
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
                      Submit Assignment
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default StudentTheoryAssignments;
