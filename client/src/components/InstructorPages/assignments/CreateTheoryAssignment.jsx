import axios from "axios";
import { useEffect, useState } from "react";
import {
  Upload,
  Button,
  App,
  Progress,
  Typography,
  Form,
  Switch,
  DatePicker,
  Input,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../misc/Navbar";
import Heading from "../../misc/Heading";
import { useAuth } from "../../../context/AuthProvider";
import { useTracker } from "../../../context/TrackerProvider";
import TextArea from "antd/es/input/TextArea";

const { Text } = Typography;

const { Dragger } = Upload;

const CreateTheoryAssignment = () => {
  const navigate = useNavigate();
  const { selectedCourse, setSelectedCourse } = useTracker();
  const { user } = useAuth();

  const [fileList, setFileList] = useState([]);
  const [uploadedStatus, setUploadedStatus] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [instructorFiles, setInstructorFiles] = useState([]);
  const [publicIds, setPublicIds] = useState([]);
  const [form] = Form.useForm();
  const { notification, modal } = App.useApp();

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    if (localStorage.getItem("courseInfo") === null) {
      navigate("/"); // Redirect if no course is selected
    } else {
      setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    }
  }, []);

  const props = {
    multiple: true,
    onRemove: (file) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList((prevFileList) => [...prevFileList, file]);
      return false; // Prevent automatic upload
    },
    fileList,
  };

  const onFinish = async (e) => {
    const { name, description, dueDate, visibleToStudents } = e;
    if (!name || !dueDate || visibleToStudents === undefined) {
      notification.error({
        message: "Missing Information",
        description: "Pleast enter all information!",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }
    if (name.length > 64) {
      notification.error({
        message: "Name is too lengthy!",
        description: "Assignment Name should be less than 65 characters.",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }

    if (fileList.length < 1 && !description) {
      notification.error({
        message: "No information or files!!",
        description:
          "You have to upload at least 1 file or enter a description!.",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }

    if (description && description.length > 2000) {
      notification.error({
        message: "Description is too lengthy!",
        description: "Description should be less than 2000 characters.",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }

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
        setUploadedStatus(true);
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
  };

  const createAssignment = async (formData, uploadedFiles) => {
    try {
      const config = {
        Headers: {
          "Content-type": "application/json",
        },
      };
      await axios.post(
        "/api/tracker/theoryAssignments",
        {
          courseID: selectedCourse._id,
          name: formData.name,
          description: formData.description ? formData.description : "N/A",
          due_date: formData.dueDate.toDate(),
          visibleToStudents: formData.visibleToStudents,
          instructorFiles: uploadedFiles,
        },
        config
      );

      notification.success({
        message: "Assignment Created!",
        description: `${formData.name} created successfully`,
        duration: 4,
        placement: "bottomLeft",
      });
      navigate("/viewallassignments");
    } catch (error) {
      if (error.response.status === 409) {
        notification.error({
          message: "Error",
          description: "An assignment with the same name already exists!",
          duration: 4,
          placement: "bottomLeft",
        });
      } else if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        notification.error({
          message: "Error with assignment upload",
          description: error.response.statusText,
          duration: 4,
          placement: "bottomLeft",
        });
      }
    }
  };

  useEffect(() => {
    // Check if upload is complete and trigger assignment creation
    if (uploadedStatus) {
      (async () => {
        const formData = form.getFieldsValue();
        await createAssignment(formData, instructorFiles);
        setUploadedStatus(false); // Reset upload complete state after assignment creation
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedStatus, instructorFiles, form]);

  const handleUpload = async () => {
    // Reset progress to 0
    setUploadProgress(0);
    setInstructorFiles([]);
    setPublicIds([]);

    const uploadPromises = fileList.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "kgen9eiq");

      return axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress((oldProgress) => Math.max(oldProgress, progress));
          },
        }
      );
    });

    try {
      const responses = await Promise.all(uploadPromises);

      const newInstructorFiles = [];
      const newPublicIds = [];

      responses.map((response) => {
        let url = response.data.url; // URL of the uploaded file
        const fileName = response.data.original_filename; // Original file name
        const publicId = response.data.public_id; // Public ID of the uploaded file

        if (!publicId.includes(".")) {
          url = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUD_NAME}/image/upload/fl_attachment/${publicId}`;
        }

        newInstructorFiles.push({ publicId, fileName, filePath: url });
        newPublicIds.push(publicId);
      });

      // Update the state with new instructor files
      setInstructorFiles((currentFiles) => [
        ...currentFiles,
        ...newInstructorFiles,
      ]);
      setPublicIds((currentIds) => [...currentIds, ...newPublicIds]);
      setUploadedStatus(true);

      notification.success({
        message: "File uploaded!",
        description: `All files uploaded successfully`,
        duration: 4,
        placement: "bottomLeft",
      });

      return instructorFiles;
    } catch (error) {
      notification.error({
        message: "File upload failed",
        description: error.message,
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <Heading
          link={"/viewallassignments"}
          title={`CREATE A THEORY ASSIGNMENT - ${selectedCourse?.name}`}
        />
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="max-w-3xl mx-auto mt-6"
        >
          <Form.Item
            name="name"
            label={<span className=" font-bold">Assignment Name</span>}
            rules={[
              { required: true, message: "Please input the assignment name!" },
            ]}
          >
            <Input placeholder="Assignment X" />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span className=" font-bold">Assignment Description</span>}
          >
            <TextArea
              placeholder="Describe the assignment"
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>
          <div className="flex justify-between items-center space-x-4">
            <Form.Item
              name="visibleToStudents"
              label={<span className=" font-bold">Visible to Students</span>}
              valuePropName="checked"
              initialValue={true}
            >
              <Switch
                checkedChildren="Visible"
                unCheckedChildren="Hidden"
                className=" bg-[#858687] hover:shadow-xl hover:!bg-[#4b4c4d]"
              />
            </Form.Item>
            <Form.Item
              name="dueDate"
              label={<span className=" font-bold">Due Date</span>}
              rules={[
                { required: true, message: "Please select the due date!" },
              ]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>
          </div>
          <Form.Item
            label={<span className=" font-bold">Instructor Files</span>}
          >
            <Dragger {...props}>
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
          {uploadProgress > 0 && (
            <Progress percent={Math.round(uploadProgress)} />
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full main-black-btn"
            >
              Create Assignment
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CreateTheoryAssignment;
