import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Table, Button, Input, Typography, App } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import Navbar from "../../misc/Navbar";
import { useTracker } from "../../../context/TrackerProvider";

const { Title } = Typography;

const ViewTestSubmissions = () => {
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [selectedTest, setSelectedTest] = useState(); // State to store the selected test
  const [submissions, setSubmissions] = useState([]); // State to store submissions
  const [searchText, setSearchText] = useState(""); // State for search functionality
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();

  const fetchTestSubmissions = async () => {
    try {
      const testId = JSON.parse(localStorage.getItem("testInfo"))._id;
      const response = await axios.get(
        `/api/tracker/test-submissions/test/${testId}`
      );
      setSubmissions(response.data);
    } catch (error) {
      // Handle errors
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("testInfo")) {
      navigate("/course");
    } else {
      localStorage.removeItem("submissionInfo");
      setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
      setSelectedTest(JSON.parse(localStorage.getItem("testInfo")));
      fetchTestSubmissions();
    }
  }, []);

  const handleTestDelete = async () => {
    const testData = JSON.parse(localStorage.getItem("testInfo")); // Retrieve the test data from localStorage
    modal.confirm({
      title: "Delete Test?",
      content:
        "Are you sure you want to delete this test? This action cannot be undone.",
      okText: "Yes",
      okButtonProps: { className: "main-black-btn" },
      cancelText: "No",
      onOk: async () => {
        try {
          // Collect file public IDs for deletion
          const publicIds = testData.files
            ? testData.files.map((file) => file.publicId)
            : [];

          // Delete files if any
          if (publicIds.length > 0) {
            await deleteFiles(publicIds);
          }

          // Delete the test
          await axios.delete(
            `/api/tracker/test/${testData._id}`
          );

          notification.success({
            message: "Test Deleted!",
            description: `Test: ${testData.name} has been deleted successfully!`,
            duration: 3,
            position: "bottomLeft",
          });

          navigate("/viewalltests");
        } catch (error) {
          notification.error({
            message: "Error Occurred!",
            description: "Failed to delete the test and/or files",
            duration: 5,
            placement: "bottomLeft",
          });
        }
      },
    });
  };

  const deleteFiles = async (publicIds) => {
    try {
      await axios.post("/api/tracker/delete-file", {
        publicIds,
      });

      notification.success({
        message: "Deleted Files",
        description: "The files related to this test have been deleted.",
        duration: 4,
        placement: "bottomLeft",
      });
    } catch (error) {
      console.error("Error deleting files:", error);
      notification.error({
        message: "Failed",
        description: "Failed to delete files related to this test.",
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };
  const submissionColumns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Student Name",
      key: "studentName",
      sorter: (a, b) =>
        `${a.studentId.firstName} ${a.studentId.lastName}`.localeCompare(
          `${b.studentId.firstName} ${b.studentId.lastName}`
        ),
      render: (_, record) => {
        const student = record.studentId;
        return `${student.firstName} ${student.lastName}`;
      },
    },
    {
      title: "Submission Date",
      dataIndex: "submittedAt",
      key: "submittedAt",
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
      render: (submittedAt) =>
        new Date(submittedAt).toLocaleString("en-CA", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
    },
    {
      title: "Total Marks",
      key: "totalMarks",
      sorter: (a, b) => a.totalMarks - b.totalMarks,
      render: (_, record) => {
        const marksScored = record.totalMarks;
        const test = JSON.parse(localStorage.getItem("testInfo"));
        // Assuming each record has a testId object with a questions array
        const totalMarksForTest = test.questions.reduce(
          (sum, question) => sum + question.marks,
          0
        );
        return `${marksScored}/${totalMarksForTest}`;
      },
    },
    {
      title: "View",
      key: "view",
      render: (_, record) => (
        <Button
          onClick={() => {
            localStorage.setItem("submissionInfo", JSON.stringify(record));
            navigate(`/viewtestsubmission/${record._id}`); // Adjust this navigation path as needed
          }}
          className="bg-[#e9f5ff] border-[#45a1fe] text-[#45a1fe] rounded-lg text-sm font-semibold flex 
                    hover:bg-[#e9f5ff] hover:text-[#e9f5ff] hover:border-[#e9f5ff]"
        >
          View
        </Button>
      ),
    },
  ];

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const studentFullName =
        `${submission.studentId.firstName} ${submission.studentId.lastName}`.toLowerCase();
      const submissionValues = Object.values(submission)
        .join(" ")
        .toLowerCase();
      const fullSearchText = submissionValues + " " + studentFullName;
      return fullSearchText.includes(searchText.toLowerCase());
    });
  }, [submissions, searchText]);

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <div className="flex justify-between items-center">
          <Link to="/viewalltests">
            <Button
              icon={<ArrowLeftOutlined />}
              className=" mb-6 sm:mb-0 bg-black border-black text-white rounded-lg text-sm font-medium flex 
            items-center justify-center hover:bg-white hover:text-black hover:border-black"
            >
              Back
            </Button>
          </Link>
          <Title className="text-center my-4" level={3}>
            {selectedCourse?.name.toUpperCase()}
          </Title>
          <div className=" w-[85px]">
            <Button
              className="bg-[#46282F] border-[#46282F] text-white rounded-lg text-sm font-medium flex 
          items-center justify-center hover:bg-white hover:text-[#ff5a5a] hover:border-[#46282F] ml-auto"
              onClick={handleTestDelete}
            >
              Delete
            </Button>
          </div>
        </div>
        <div className=" max-w-7xl m-auto">
          <Title level={4} className="text-center my-4">
            All Submissions for {selectedTest?.name}
          </Title>
          <Input
            placeholder="Search submissions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="my-4"
          />
          <Table
            dataSource={filteredSubmissions}
            columns={submissionColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
    </>
  );
};

export default ViewTestSubmissions;
