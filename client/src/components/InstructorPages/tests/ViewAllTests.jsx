import axios from "axios";
import { App, Button, Card, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Heading from "../../misc/Heading";
import Navbar from "../../misc/Navbar";
import { PlusOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import TestCard from "../../misc/TestCard";

const ViewAllTests = () => {
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [tests, settests] = useState([]);
  const navigate = useNavigate();
  const { notification } = App.useApp();

  useEffect(() => {
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    localStorage.removeItem("assignmentInfo");
    localStorage.removeItem("testInfo");
    localStorage.removeItem("moduleInfo");
    localStorage.removeItem("submissionInfo");
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tracker/tests/course/${
          JSON.parse(localStorage.getItem("courseInfo"))._id
        }`
      );
      settests(res.data);
    } catch (error) {
      notification.error({
        message: "Error Occured!",
        description: "Failed to load the tests",
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };
  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 p-6 py-2">
        <Heading
          link={"/course"}
          title={`${selectedCourse?.name.toUpperCase()}`}
          size={2}
        />
        <Row gutter={[16, 16]} justify="center" className=" gap-4">
          {tests.length > 0 ? (
            tests.map((test) => <TestCard key={test._id} test={test} />)
          ) : (
            <Card className="text-center p-6">
              <Title level={4}>You have no tests for this course!</Title>
            </Card>
          )}
        </Row>
        <div className="text-center mt-8">
          <Button
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/createtest")}
            className="bg-[#000000] text-white font-semibold  hover:bg-slate-100 mx-2"
          >
            New Test
          </Button>
        </div>
      </div>
    </>
  );
};

export default ViewAllTests;
