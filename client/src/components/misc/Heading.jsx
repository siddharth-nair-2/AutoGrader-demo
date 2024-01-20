import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Title from "antd/es/typography/Title";
import React from "react";
import { Link } from "react-router-dom";

const Heading = ({ title, link, size = 3 }) => {
  return (
    <div className="flex items-center justify-around">
      <Link to={link}>
        <Button
          icon={<ArrowLeftOutlined />}
          className="bg-black border-black text-white rounded-lg text-sm font-medium flex items-center justify-center hover:bg-white hover:text-black hover:border-black"
        >
          Back
        </Button>
      </Link>
      <Title level={size} className="text-center font-bold my-2 mx-auto">
        {title}
      </Title>
      <div className=" w-[85px]"></div>{" "}
      {/* Empty div for maintaining balance */}
    </div>
  );
};

export default Heading;
