import { InboxOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import Dragger from "antd/es/upload/Dragger";
import axios from "axios";
import React, { useEffect, useState } from "react";

const EditModuleModal = ({
  visible,
  onEdit,
  onCancel,
  moduleData,
  availableAssignments,
  availableTests,
}) => {
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { notification } = App.useApp();

  useEffect(() => {
    if (moduleData) {
      const allAssignmentIds = [
        ...moduleData.assignments.map((a) => a._id),
        ...moduleData.theoryAssignments.map((a) => a._id),
      ];

      const initialFiles = moduleData.files.map((file) => ({
        uid: file.publicId,
        name: file.fileName,
        status: "done",
        url: file.filePath,
      }));
      setFileList(initialFiles);

      form.setFieldsValue({
        name: moduleData.title,
        description: moduleData.content,
        assignments: allAssignmentIds,
        tests: moduleData.tests.map((t) => t._id),
      });
    }
  }, [moduleData, form]);

  const handleSubmit = async (values) => {
    setIsUpdating(true);
    const newFilesForUpload = fileList.filter(
      (file) => !moduleData.files.some((mf) => mf.publicId === file.uid)
    );

    console.log(newFilesForUpload);

    let newUploadedFiles = [];

    if (newFilesForUpload.length > 0) {
      const uploadPromises = newFilesForUpload.map((file) => {
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
        newUploadedFiles = uploadResponses.map((response) => ({
          publicId: response.data.public_id,
          fileName: response.data.original_filename,
          filePath: response.data.url,
        }));

        notification.success({
          message: "File Upload Complete",
          description: "New files have been successfully uploaded.",
        });
      } catch (error) {
        notification.error({
          message: "File upload failed",
          description: error.message,
        });
        return;
      }
    }

    // Get existing files that are still in the fileList
    const existingFiles = moduleData.files.filter((originalFile) =>
      fileList.some((file) => file.uid === originalFile.publicId)
    );

    const combinedFiles = [...existingFiles, ...newUploadedFiles];

    const categorizedAssignments = {
      newAssignments: [],
      newTheoryAssignments: [],
    };

    values.assignments.forEach((assignmentId) => {
      const fullAssignment = availableAssignments.find(
        (a) => a._id === assignmentId
      );
      if (
        fullAssignment &&
        fullAssignment.questions &&
        fullAssignment.questions.length > 0
      ) {
        categorizedAssignments.newAssignments.push(assignmentId);
      } else {
        categorizedAssignments.newTheoryAssignments.push(assignmentId);
      }
    });

    const updatedModuleData = {
      title: values.name,
      content: values.description,
      ...categorizedAssignments,
      newTests: values.tests,
      newFiles: combinedFiles,
    };

    try {
      const response = await axios.patch(
        `/api/tracker/module/${moduleData._id}`,
        updatedModuleData
      );

      notification.success({
        message: "Module Updated",
        description: "The module has been successfully updated.",
      });

      setIsUpdating(false);
      onEdit(response.data);
      onCancel();
      window.location.reload();
    } catch (error) {
      notification.error({
        message: "Update Failed",
        description:
          error.response?.data?.message || "Failed to update the module.",
      });
    }
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: "Are you sure you want to delete this module?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
      onOk: async () => {
        try {
          await axios.delete(
            `/api/tracker/module/${moduleData._id}`
          );

          notification.success({
            message: "Module Deleted",
            description: "The module has been successfully deleted.",
          });

          onCancel();
          window.location.reload();
        } catch (error) {
          notification.error({
            message: "Deletion Failed",
            description:
              error.response?.data?.message || "Failed to delete the module.",
          });
        }
      },
      onCancel() {},
    });
  };

  const props = {
    multiple: true,
    fileList,
    onRemove: (file) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
  };

  return (
    <Modal
      title="Edit Module"
      open={visible}
      onOk={form.submit}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isUpdating}>
          Cancel
        </Button>,
        <Button
          key="delete"
          onClick={handleDelete}
          danger
          disabled={isUpdating}
        >
          Delete Module
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={form.submit}
          className="main-black-btn"
          disabled={isUpdating}
        >
          Update
        </Button>,
      ]}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="name" label="Module Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="assignments" label="Assignments">
          <Select mode="multiple" placeholder="Select Assignments">
            {availableAssignments?.map((assn) => (
              <Select.Option key={assn._id} value={assn._id}>
                {assn.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="tests" label="Tests">
          <Select mode="multiple" placeholder="Select Tests">
            {availableTests?.map((test) => (
              <Select.Option key={test._id} value={test._id}>
                {test.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
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
      </Form>
    </Modal>
  );
};

export default EditModuleModal;
