import { Row, Col, Form, Input, Button, App } from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const Login = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { login } = useAuth();

  const onFinish = async (values) => {
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
    try {
      await login(values.email, values.password);
      window.location = "/";
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      notification.error({
        message: "Error!",
        description: errorMessage,
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };

  return (
    <Row className="w-screen h-screen">
      <Col
        xs={24}
        md={12}
        className="bg-white flex justify-center items-center"
      >
        <div className="flex flex-col justify-between items-center w-full md:w-3/5 h-5/6">
          <div className="self-start w-full pl-6">
            <img
              src="loginLogo.png"
              alt="Autograder logo"
              className="w-12 h-12"
            />
          </div>
          <div className="w-full px-6 space-y-6 flex flex-col gap-16">
            <div className=" flex flex-col justify-center gap-4">
              <h1 className="text-4xl font-semibold text-gray-800">Login</h1>
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
                label={<span className=" font-bold">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input size="large" placeholder="mail@website.com" />
              </Form.Item>
              <Form.Item
                label={<span className=" font-bold">Password</span>}
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password size="large" placeholder="Min. 8 character" />
              </Form.Item>
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-gray-800"
                >
                  Forget Password?
                </Link>
              </div>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full mt-3 bg-black border-black text-white rounded-lg text-sm font-medium h-10 flex items-center justify-center"
              >
                Login
              </Button>

              <div className="text-left mt-3 font-normal">
                Not registered yet?
                <Link to="/signup" className="font-semibold text-gray-800 ml-1">
                  Create an account
                </Link>
              </div>
            </Form>
          </div>
          <div className="self-start w-full pl-6 text-xs font-light">
            ©2023 Siddharth. All rights reserved.
          </div>
        </div>
      </Col>
      <Col xs={0} md={12} className="hidden md:flex bg-black">
        <img
          src="loginBackground.jpg"
          alt="Background"
          className="object-cover opacity-20 w-full h-full"
        />
      </Col>
    </Row>
  );
};

export default Login;
