/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Navbar from "../../misc/Navbar";
import { Table, Button, Input, Typography, App } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ViewTheoryAssignmentSubmission = () => {
  const fetchAllSubmissions = async () => {
    try {
      const data = await axios.get(
        `/api/tracker//theory-submissions?courseID=${
          JSON.parse(localStorage.getItem("assignmentInfo")).courseID
        }&assignmentID=${
          JSON.parse(localStorage.getItem("assignmentInfo"))._id
        }`
      );
      setSubmissions(data.data);
    } catch (error) {
      notification.error({
        message: "Error Occured!",
        description: "Failed to load the submissions",
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [selectedAssignment, setSelectedAssignment] = useState();
  const [submissions, setSubmissions] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    localStorage.removeItem("submissionInfo");
    if (!JSON.parse(localStorage.getItem("assignmentInfo"))) {
      navigate("/course");
    } else {
      setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
      setSelectedAssignment(JSON.parse(localStorage.getItem("assignmentInfo")));
      fetchAllSubmissions();
    }
  }, []);

  const handleVisibilityToggle = async () => {
    var assignmentData = JSON.parse(localStorage.getItem("assignmentInfo"));
    modal.confirm({
      title: `Change Visibility?`,
      content: `The assignment is currently ${
        assignmentData.visibleToStudents ? "" : "not "
      }visible to students! Are you sure you want to change this?`,
      okText: "Yes",
      cancelText: "No",
      okButtonProps: {
        className: " main-black-btn",
      },
      onOk: async () => {
        try {
          await axios.patch(
            `/api/tracker/theoryAssignments/${assignmentData._id}`,
            { visibleToStudents: !assignmentData.visibleToStudents }
          );

          notification.success({
            message: "Visibility Changed!",
            description: `The assignment is ${
              assignmentData.visibleToStudents ? "not " : ""
            }visible to students!`,
            duration: 3,
            position: "bottomLeft",
          });

          navigate("/viewallassignments");
        } catch (error) {
          notification.error({
            message: "Error Occurred!",
            description: "Failed to change the assignment visibility",
            duration: 5,
            placement: "bottomLeft",
          });
        }
      },
    });
  };

  const handleAssignmentDelete = async () => {
    var assignmentData = JSON.parse(localStorage.getItem("assignmentInfo"));
    modal.confirm({
      title: "Delete Assignment?",
      content:
        "Are you sure you want to delete this assignment? This action cannot be undone.",
      okText: "Yes",
      okButtonProps: {
        className: " main-black-btn",
      },
      cancelText: "No",
      onOk: async () => {
        try {
          const publicIds = [];

          if (assignmentData?.instructorFiles) {
            for (const file of assignmentData.instructorFiles) {
              publicIds.push(file.publicId);
            }
          }

          // Delete files if any
          if (publicIds.length > 0) {
            await deleteFiles(publicIds);
          }

          await axios.delete(
            `/api/tracker/theoryAssignments/${assignmentData._id}`
          );

          notification.success({
            message: "Assignment Deleted!",
            description: `Assignment: ${assignmentData.name} has been deleted successfully!`,
            duration: 3,
            position: "bottomLeft",
          });

          navigate("/viewallassignments");
        } catch (error) {
          notification.error({
            message: "Error Occurred!",
            description: "Failed to delete the assignment and/or files",
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
        description: "The files related to this assigmment have been deleted.",
        duration: 4,
        placement: "bottomLeft",
      });
    } catch (error) {
      console.error("Error deleting files:", error);
      notification.error({
        message: "Failed",
        description: "Failed to delete files related to this assigmment.",
        duration: 4,
        placement: "bottomLeft",
      });
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) =>
      Object.values(submission)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [submissions, searchText]);

  const submissionColumns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1, // Add this line to show the row number starting at 1
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Upload Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      render: (updatedAt) =>
        new Date(updatedAt).toLocaleString("en-CA", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
    },
    {
      title: "View",
      key: "view",
      render: (_, record) => (
        <Button
          onClick={() => {
            localStorage.setItem("submissionInfo", JSON.stringify(record));
            navigate("/viewTheorySubmission");
          }}
          className="bg-[#b8defe] border-[#45a1fe] text-[#45a1fe] rounded-lg text-sm font-semibold flex 
                    hover:bg-[#85b5e6] hover:text-[#b8defe] hover:border-[#b8defe]"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="h-full overflow-auto bg-gray-100 px-6 py-2">
        <div className="flex justify-between items-center">
          <Link to="/viewallassignments">
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
              onClick={handleAssignmentDelete}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className=" max-w-7xl m-auto">
          <Title level={4} className="text-center my-4">
            All submissions for {selectedAssignment?.name}
          </Title>
          <div className=" flex items-center justify-end w-full">
            <Button
              className=" mb-6 sm:mb-0 bg-black border-black text-white rounded-lg text-sm font-medium flex 
              items-center justify-center hover:bg-white hover:text-black hover:border-black"
              onClick={handleVisibilityToggle}
            >
              Toggle Visibility
            </Button>
          </div>
          <Input
            placeholder="Search submissions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="my-4 shadow-sm"
          />
          <Table
            dataSource={filteredSubmissions}
            columns={submissionColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            className="my-4"
          />
        </div>
      </div>
    </>
  );
};

export default ViewTheoryAssignmentSubmission;
