import axios from "axios";
import { Link } from "react-router-dom";
import { Form, Input, Button, Select, Typography, App } from "antd";
import Navbar from "../../misc/Navbar";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthProvider";
import Heading from "../../misc/Heading";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const CreateCourses = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const onFinish = async (values) => {
    const { courseID, description, name, semester, section } = values;
    if (!courseID || !description || !name || semester === "" || !section) {
      notification.error({
        message: "Missing Information!",
        description: "Pleast enter all information!",
        duration: 5,
        placement: "bottomLeft",
      });
      return;
    }
    let capsSection = section.toUpperCase();
    if (!capsSection.match(/[A-Z]/i)) {
      notification.error({
        message: "Invalid Course Section",
        description: "Course Section should be between A and Z characters.",
        duration: 5,
        placement: "bottomLeft",
      });
      return;
    }
    if (courseID.length < 8 || courseID.length > 10) {
      notification.error({
        message: "Invalid Course ID",
        description: "Course ID should be between 8 and 10 characters.",
        duration: 5,
        placement: "bottomLeft",
      });
      return;
    }
    if (name.length > 64) {
      notification.error({
        message: "Name is too lengthy!",
        description: "Course Name should be less than 65 characters.",
        duration: 5,
        placement: "bottomLeft",
      });
      return;
    }
    if (description.length > 2000) {
      notification.error({
        message: "Description is too lengthy!",
        description: "Description should be less than 2000 characters.",
        duration: 5,
        placement: "bottomLeft",
      });
      return;
    }
    try {
      const config = {
        Headers: {
          "Content-type": "application/json",
        },
      };
      await axios.post(
        "/api/tracker/courses",
        {
          courseID,
          name,
          description,
          semester,
          section: capsSection,
          instructor: user._id,
        },
        config
      );
      window.location = "/";
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        notification.error({
          message: "Error",
          description: error.response.statusText,
          duration: 5,
          placement: "bottomLeft",
        });
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <Heading
          link={"/"}
          title={`CREATE A COURSE`}
          size={1}
        />
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className=" max-w-3xl mx-auto"
        >
          <Form.Item
            name="courseID"
            label={<span className=" font-bold">Course Code</span>}
            rules={[
              { required: true, message: "Please input the course code!" },
            ]}
          >
            <Input placeholder="COSC4106" size="large" />
          </Form.Item>

          <Form.Item
            name="section"
            label={<span className=" font-bold">Course Section</span>}
            rules={[
              { required: true, message: "Please input the course section!" },
            ]}
          >
            <Input placeholder="A" maxLength={1} size="large" />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span className=" font-bold">Course Name</span>}
            rules={[
              { required: true, message: "Please input the course name!" },
            ]}
          >
            <Input placeholder="Analysis of Algorithm" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className=" font-bold">Course Description</span>}
            rules={[
              {
                required: true,
                message: "Please input the course description!",
              },
            ]}
          >
            <TextArea
              placeholder="Please enter a description for your course!"
              rows={6}
            />
          </Form.Item>

          <Form.Item
            name="semester"
            label={<span className=" font-bold">Semester</span>}
            rules={[{ required: true, message: "Please select the semester!" }]}
          >
            <Select placeholder="Choose Semester" size="large">
              {/* Add more options as required */}
              <Option value="Winter 2023">Winter 2023</Option>
              <Option value="Summer 2023">Summer 2023</Option>
              <Option value="Spring 2023">Spring 2023</Option>
              <Option value="Fall 2023">Fall 2023</Option>
              <Option value="Winter 2024">Winter 2024</Option>
              <Option value="Summer 2024">Summer 2024</Option>
              <Option value="Spring 2024">Spring 2024</Option>
              <Option value="Fall 2024">Fall 2024</Option>
              <Option value="Winter 2025">Winter 2025</Option>
              <Option value="Summer 2025">Summer 2025</Option>
              <Option value="Spring 2025">Spring 2025</Option>
              <Option value="Fall 2025">Fall 2025</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              size="large"
              htmlType="submit"
              className="w-full bg-black text-white rounded-lg text-sm font-medium flex 
              items-center justify-center hover:bg-white hover:text-black hover:border-black"
            >
              Create Course
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CreateCourses;
