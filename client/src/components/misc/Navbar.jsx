import React from "react";
import { Layout, Button, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    localStorage.removeItem("courseInfo");
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("submissionInfo");
    localStorage.removeItem("testCases");
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    window.location = "/";
  };

  return (
    <Header className=" bg-black flex justify-between items-center p-0">
      {/* Left Section: User Information or placeholder to keep logo centered */}
      <div className="flex flex-col justify-start flex-1 px-6">
        {user && (
          <>
            <Text strong className="text-lg text-white mb-1">
              {user.firstName}
            </Text>
            <Text className="text-white">{user.userType}</Text>
          </>
        )}
      </div>

      {/* Center Section: Logo */}
      <div className=" flex-1 flex justify-center">
        <Avatar
          src="userLogo.jpg"
          onClick={handleLogoClick}
          className=" cursor-pointer"
        />
      </div>

      {/* Right Section: Logout Button or placeholder to keep logo centered */}
      <div className=" flex-1 flex justify-end px-6">
        <Button
          type="primary"
          shape="round"
          icon={<UserOutlined />}
          onClick={handleLogout}
          className=" bg-white text-black hover:border-white"
        >
          Logout
        </Button>
      </div>
    </Header>
  );
};

export default Navbar;
