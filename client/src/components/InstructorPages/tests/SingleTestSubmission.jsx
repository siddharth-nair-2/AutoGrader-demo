import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Button,
  Form,
  InputNumber,
  Card,
  Row,
  Col,
  App,
} from "antd";
import Navbar from "../../misc/Navbar";
import { useTracker } from "../../../context/TrackerProvider";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const SingleTestSubmission = () => {
  const [submission, setSubmission] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();

  const [activeSubmission, setActiveSubmission] = useState();
  const { selectedCourse, setSelectedCourse } = useTracker();

  const [selectedTest, setSelectedTest] = useState();
  useEffect(() => {
    setActiveSubmission(JSON.parse(localStorage.getItem("submissionInfo")));
    setSelectedTest(JSON.parse(localStorage.getItem("testInfo")));
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));

    if (!localStorage.getItem("submissionInfo")) {
      navigate("/viewtest");
    } else {
      setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
      setActiveSubmission(JSON.parse(localStorage.getItem("submissionInfo")));
      setSelectedTest(JSON.parse(localStorage.getItem("testInfo")));
      fetchSubmissionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { id } = useParams(); // This assumes your route is something like '/submission/:id'

  const fetchSubmissionDetails = async () => {
    try {
      const url = `/api/tracker/test-submission/${id}`;
      console.log(url);
      const response = await axios.get(url);
      setSubmission(response.data);
    } catch (error) {
      notification.error({
        message: "Fetch Failed",
        description:
          error.response?.data?.message ||
          "Failed to fetch submission details.",
      });
    }
  };

  const handleMarkChange = (questionNum, newMark) => {
    setIsChanged(true);

    // Update the specific response's marks
    setSubmission((prevSubmission) => ({
      ...prevSubmission,
      responses: prevSubmission.responses.map((response) =>
        response.questionNum === questionNum
          ? { ...response, marksAwarded: newMark }
          : response
      ),
    }));
  };

  const formatResponse = (question, response) => {
    if (question.responseType === "multiple") {
      return response.answer.join(", ");
    }
    return response.answer;
  };

  const updateSubmission = async () => {
    try {
      const updatedResponses = submission.responses.map((response) => ({
        ...response, // Spread the existing response object to maintain all its properties
        marksAwarded: response.marksAwarded, // Update only the marksAwarded property
      }));

      const response = await axios.patch(
        `/api/tracker/test-submission/${submission._id}`,
        {
          responses: updatedResponses,
        }
      );

      // Handle the successful response
      notification.success({
        message: "Marks Updated",
        description: "The marks have been successfully updated.",
      });

      setSubmission(response.data);
      setIsChanged(false);
    } catch (error) {
      // Handle the error response
      notification.error({
        message: "Update Failed",
        description: error.response?.data?.message || "Failed to update marks.",
      });
    }
  };

  const calculateDueDate = (test) => {
    if (!test) return "";

    const { scheduledAt, duration, testType } = test;

    const scheduledDate = new Date(scheduledAt);
    if (testType === "quiz") {
      scheduledDate.setDate(scheduledDate.getDate() + duration);
    } else if (testType === "test") {
      scheduledDate.setMinutes(scheduledDate.getMinutes() + duration);
    }

    return formatDate(scheduledDate);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short", // 'short' for abbreviated month name
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-full bg-gray-100 px-6 py-2">
        <div className="flex justify-between items-center">
          <Link to="/viewtest">
            <Button
              icon={<ArrowLeftOutlined />}
              className=" mb-6 sm:mb-0 bg-black border-black text-white rounded-lg text-sm font-medium flex 
            items-center justify-center hover:bg-white hover:text-black hover:border-black"
            >
              Back
            </Button>
          </Link>
          <Title className="text-center my-4" level={3}>
            {selectedCourse?.name.toUpperCase()} - {selectedTest?.name}
          </Title>
          <div className=" w-[85px]"></div>
        </div>

        <div className="w-11/12 bg-transparent p-4 m-auto mt-8 grid grid-cols-4">
          <div className="col-span-1">
            <Card className="shadow-md mr-4">
              <Title level={4}>Submission Information</Title>
              <div className="flex justify-between my-2">
                <span>First Name:</span>
                <span className="font-semibold">
                  {submission?.studentId?.firstName}
                </span>
              </div>
              <div className="flex justify-between my-2">
                <span>Last Name:</span>
                <span className="font-semibold">
                  {submission?.studentId?.lastName}
                </span>
              </div>
              <div className="flex justify-between my-2">
                <span>Email:</span>
                <span className="font-semibold">
                  {submission?.studentId?.email}
                </span>
              </div>
              <div className="flex justify-between my-2">
                <span>Submitted At:</span>
                <span className="font-semibold">
                  {formatDate(submission?.submittedAt)}
                </span>
              </div>
              <div className="flex justify-between my-2">
                <span>Due At:</span>
                <span className="font-semibold">
                  {calculateDueDate(selectedTest)}
                </span>
              </div>
              <div className="flex justify-between my-2">
                <span>Marks: </span>
                <span className="font-semibold">
                  {submission?.totalMarks}/
                  {selectedTest?.questions.reduce(
                    (sum, question) => sum + question.marks,
                    0
                  )}
                </span>
              </div>
            </Card>
          </div>

          <div className="col-span-3">
            <Row gutter={24}>
              <Col xs={24}>
                {/* Questions and Responses */}
                {submission &&
                  submission.responses.map((response) => {
                    const question = selectedTest.questions.find(
                      (q) => q.questionNum === response.questionNum
                    );
                    return (
                      <Card
                        key={question.questionNum}
                        className="mb-4 shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <Title level={4} className="text-lg font-semibold">
                            {`Question ${question.questionNum}`}
                            <span className=" font-normal text-lg">
                              {" "}
                              ({question.marks} points)
                            </span>
                          </Title>
                          <Form.Item label="Marks Awarded" className="mb-0">
                            <InputNumber
                              value={response.marksAwarded} // changed from defaultValue to value
                              min={0}
                              max={question.marks}
                              onChange={(value) =>
                                handleMarkChange(question.questionNum, value)
                              }
                            />
                          </Form.Item>
                        </div>
                        <p className=" text-base font-semibold">
                          {question.questionInfo}
                        </p>{" "}
                        <p className="my-4">
                          <span className="font-semibold">Response: </span>
                          <span className="text-justify">
                            {formatResponse(question, response)}
                          </span>
                        </p>
                      </Card>
                    );
                  })}
                {/* Update Button */}
                {isChanged && (
                  <Button
                    type="primary"
                    onClick={() =>
                      modal.confirm({
                        title: "Confirm Update",
                        content: "Are you sure you want to update the marks?",
                        onOk: updateSubmission,
                        okButtonProps: {
                          className: " main-black-btn",
                        },
                      })
                    }
                    className=" main-black-btn"
                  >
                    Update Marks
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleTestSubmission;
