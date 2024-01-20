import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Navbar from "../../misc/Navbar";
import { Card, Typography, Button, Divider } from "antd";
import Heading from "../../misc/Heading";
import { DownloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

const SingleTheorySubmission = () => {
  const [activeSubmission, setActiveSubmission] = useState();
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [selectedAssignment, setSelectedAssignment] = useState();

  const navigate = useNavigate();
  useEffect(() => {
    setActiveSubmission(JSON.parse(localStorage.getItem("submissionInfo")));
    setSelectedAssignment(JSON.parse(localStorage.getItem("assignmentInfo")));
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    
    if (!localStorage.getItem("submissionInfo")) {
      navigate("/viewTheoryAssignment");
    } else {
      setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
      setActiveSubmission(JSON.parse(localStorage.getItem("submissionInfo")));
      setSelectedAssignment(JSON.parse(localStorage.getItem("assignmentInfo")));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-full bg-gray-100">
        {selectedCourse && selectedAssignment && activeSubmission && (
          <>
            <div className="px-6 bg-[#5bb38a]">
              <Heading
                link={"/viewtheoryassignment"}
                title={`${selectedCourse?.name.toUpperCase()} - ${
                  selectedAssignment?.name
                }`}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-6 p-6">
              {/* Assignment Details */}
              <Card className="md:w-1/2 shadow-md">
                <Text strong>Description:</Text>
                <p>{selectedAssignment.description}</p>
                <Divider />
                <Text strong>Instructor Files:</Text>
                {selectedAssignment.instructorFiles?.map((file, index) => (
                  <div key={index} className="mt-2">
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => window.open(file.filePath, "_blank")}
                    >
                      {file.fileName}
                    </Button>
                  </div>
                ))}
              </Card>

              {/* Student Submission Details */}
              <Card className="md:w-1/2 shadow-md">
                <Text strong>Submission By:</Text>
                <p>{activeSubmission.studentName}</p>
                <Divider />
                <Text strong>Student Comment:</Text>
                <p>{activeSubmission.comment}</p>
                <Divider />
                <Text strong>Submitted Files:</Text>
                {activeSubmission.submittedFiles?.map((file, index) => (
                  <div key={index} className="mt-2">
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => window.open(file.filePath, "_blank")}
                    >
                      {file.fileName}
                    </Button>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SingleTheorySubmission;
