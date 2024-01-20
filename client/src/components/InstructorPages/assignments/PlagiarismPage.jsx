import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Navbar from "../../misc/Navbar";
import { Table, Button, Input, Typography, App } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Heading from "../../misc/Heading";

const { Title } = Typography;

const PlagiarismPage = () => {
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [searchText, setSearchText] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState();
  const [plagiarismData, setPlagiarismData] = useState([]);
  const { notification } = App.useApp();

  const navigate = useNavigate();

  const fetchAllPlagiarismComparisons = async () => {
    try {
      let url = `http://localhost:5000/api/tracker/plagiarism?assignmentID=${
        JSON.parse(localStorage.getItem("assignmentInfo"))._id
      }&courseID=${
        JSON.parse(localStorage.getItem("assignmentInfo")).courseID
      }`;
      const response = await axios.get(url);
      setPlagiarismData(response.data);
    } catch (error) {
      notification.error({
        message: "Error Occured!",
        description: "Failed to load the students",
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };
  useEffect(() => {
    localStorage.removeItem("submissionInfo");
    if (!JSON.parse(localStorage.getItem("assignmentInfo"))) {
      navigate("/course");
    } else {
      setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
      setSelectedAssignment(JSON.parse(localStorage.getItem("assignmentInfo")));
      fetchAllPlagiarismComparisons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlagiarismData = useMemo(() => {
    return plagiarismData.filter((data) =>
      Object.values(data)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [plagiarismData, searchText]);

  const plagiarismColumns = [
    {
      title: "Name",
      dataIndex: "student1Name",
      key: "student1Name",
      sorter: (a, b) => a.student1Name.localeCompare(b.student1Name),
    },
    {
      title: "Compared To",
      dataIndex: "student2Name",
      key: "student2Name",
      sorter: (a, b) => a.student2Name.localeCompare(b.student2Name),
    },
    {
      title: "Question No.",
      dataIndex: "questionNum",
      key: "questionNum",
      sorter: (a, b) => a.questionNum - b.questionNum,
    },
    {
      title: "Language",
      dataIndex: "languageName",
      key: "languageName",
      sorter: (a, b) => a.languageName.localeCompare(b.languageName),
      render: (languageName) =>
        languageName === "62"
          ? "Java"
          : languageName === "50"
          ? "C"
          : languageName === "54"
          ? "C++"
          : "Python",
    },
    {
      title: "Similarity %",
      dataIndex: "similarity",
      key: "similarity",
      sorter: (a, b) => a.similarity - b.similarity,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <Heading
          link={"/viewAssignment"}
          title={`${selectedCourse?.name.toUpperCase()}`}
        />
        <div className="max-w-7xl m-auto">
          <Title level={4} className="text-center my-4">
            Plagiarism Comparisons - {selectedAssignment?.name}
          </Title>
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="my-4 shadow-sm"
          />
          <Table
            dataSource={filteredPlagiarismData}
            columns={plagiarismColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            className="my-4"
          />
        </div>
      </div>
    </>
  );
};

export default PlagiarismPage;
