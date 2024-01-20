import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Checkbox,
  App,
} from "antd";

import { useAuth } from "../../context/AuthProvider";

const { Option } = Select;

const Signup = () => {
  const [terms, setTerms] = useState(false);
  const { registerUser } = useAuth();
  const { notification } = App.useApp();

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    if (!terms) {
      notification.error({
        message: "Terms & Conditions!",
        description: "Please read through and accept the Terms & Conditions!",
        placement: "bottomLeft",
        duration: 4,
      });
      return;
    }
    if (
      !values.firstName ||
      !values.lastName ||
      !values.email ||
      !values.password ||
      values.userType === ""
    ) {
      notification.error({
        message: "Missing Information",
        description: "Pleast enter all information!",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }
    if (values.password.length < 8) {
      notification.error({
        message: "Invalid Password",
        description: "Password should be at least 8 characters!",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }
    const emailRegex = new RegExp(
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "gm"
    );
    if (!emailRegex.test(values.email)) {
      notification.error({
        message: "Invalid Email",
        description: "Your email has an invalid format!",
        duration: 4,
        placement: "bottomLeft",
      });
      return;
    }
    if (!terms) {
      notification.error({
        message: "Terms & Conditions!",
        description: "Please read through and accept the Terms & Conditions!",
        placement: "bottomLeft",
        duration: 4,
      });
      return;
    }

    try {
      await registerUser(
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        values.userType
      );
      notification.success({
        message: "Success!",
        description: "Your account has been created!",
        duration: 1,
        placement: "bottomLeft",
      });
      // Redirect the user to the login page after successful registration.
      // Replace with your navigation logic if using react-router or similar.
      window.location = "/login";
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      notification.error({
        message: "Error!",
        description: errorMessage,
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };

  return (
    <Row className="w-screen h-screen bg-blue-600">
      {/* RightContainer with background image */}
      <Col xs={0} md={12} className="hidden md:flex bg-black">
        <img
          src="signupBackground.jpg"
          alt="Background"
          className="object-cover opacity-20 w-full h-full"
        />
      </Col>
      {/* LeftContainer with form */}

      <Col
        xs={24}
        md={12}
        className="bg-white flex justify-center items-center"
      >
        <div className="flex flex-col justify-between items-center w-full md:w-3/5 lg:w- h-5/6">
          <div className="self-start w-full pl-6 sm:mb-0 mb-8">
            <img
              src="loginLogo.png"
              alt="Autograder logo"
              className="w-12 h-12"
            />
          </div>
          <div className="w-full px-6 space-y-6 flex flex-col gap-2">
            <div className=" flex flex-col justify-center gap-4">
              <h1 className="text-4xl font-semibold text-gray-800">Sign Up</h1>
              <h4 className="text-base font-semibold text-gray-500">
                The easiest way to grade code for teachers!
              </h4>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="w-full"
            >
              <Form.Item
                name="firstName"
                label={<span className=" font-bold">First Name</span>}
                rules={[
                  { required: true, message: "Please input your first name!" },
                ]}
              >
                <Input placeholder="First Name" />
              </Form.Item>

              <Form.Item
                name="lastName"
                label={<span className=" font-bold">Last Name</span>}
                rules={[
                  { required: true, message: "Please input your last name!" },
                ]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className=" font-bold">Email</span>}
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="mail@website.com" />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className=" font-bold">Password</span>}
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password placeholder="Min. 8 characters" />
              </Form.Item>

              <Form.Item
                name="userType"
                label={<span className=" font-bold">Role</span>}
                rules={[
                  { required: true, message: "Please select your role!" },
                ]}
              >
                <Select placeholder="Select a role">
                  <Option value="Instructor">Instructor</Option>
                  <Option value="Student">Student</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              "You need to accept the terms and conditions!"
                            )
                          ),
                  },
                ]}
              >
                <Checkbox onChange={(e) => setTerms(e.target.checked)}>
                  I agree to the{" "}
                  <a
                    href="https://rb.gy/enaq3a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-black"
                  >
                    Terms & Conditions
                  </a>
                  .
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full bg-black border-black text-white rounded-lg text-sm font-medium h-10"
                  disabled={!terms}
                >
                  Sign Up
                </Button>
              </Form.Item>
              <div className="text-left mt-3 font-normal">
                Already have an account?
                <Link to="/login" className="font-semibold text-gray-800 ml-1">
                  Sign in
                </Link>
              </div>
            </Form>
          </div>
          <div className="hidden md:flex self-start w-full pl-6 text-xs font-light">
            ©2023 Siddharth. All rights reserved.
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Signup;
