import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Navbar from "../../misc/Navbar";
import {
  Typography,
  Button,
  Card,
  Radio,
  Checkbox,
  Input,
  Row,
  Col,
  App,
  Tooltip,
} from "antd";
import Heading from "../../misc/Heading";
import {
  DownloadOutlined,
  InfoCircleTwoTone,
  WarningTwoTone,
} from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Title } = Typography;

const StudentTest = () => {
  const { selectedCourse, setSelectedCourse, user } = useTracker();
  const [selectedTest, setSelectedTest] = useState();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [responses, setResponses] = useState({});
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();

  useEffect(() => {
    const courseInfo = JSON.parse(localStorage.getItem("courseInfo"));
    const testInfo = JSON.parse(localStorage.getItem("testInfo"));

    if (!courseInfo || !testInfo) {
      navigate(courseInfo ? "/course" : "/");
      return;
    }

    setSelectedCourse(courseInfo);
    setSelectedTest(testInfo);
  }, [navigate]);

  const handleResponseChange = (questionNum, value) => {
    setResponses({ ...responses, [questionNum]: value });
  };

  const navigateToQuestion = (questionNum) => {
    setCurrentQuestion(questionNum);
  };

  const onFinish = async (values) => {
    const allQuestionsAnswered = selectedTest.questions.every((question) => {
      const questionKey = `question_${question.questionNum}`;
      const response = responses[questionKey];

      if (question.responseType === "multiple") {
        // Check if at least one checkbox is selected
        return response && response.length > 0;
      } else if (question.responseType === "subjective") {
        // Check if the text area is not empty
        return response && response.trim() !== "";
      } else {
        // For single choice (radio), check if any option is selected
        return response !== undefined;
      }
    });

    if (!allQuestionsAnswered) {
      modal.confirm({
        icon: <WarningTwoTone twoToneColor="#ff0e0e" />,
        title: "INCOMPLETE TEST",
        content: `Not all questions have been answered. Are you sure you want to submit your ${selectedTest.testType}?`,
        onOk() {
          submitTest();
        },
        okButtonProps: {
          className: " main-black-btn",
        },
      });
    } else {
      modal.confirm({
        icon: <InfoCircleTwoTone twoToneColor="#22bb33" />,
        title: "Confirm Submission",
        content:
          "Are you sure you want to submit your test? This action is final and no changes can be made after submission.",
        onOk() {
          submitTest();
        },
        okButtonProps: {
          className: " main-black-btn",
        },
      });
    }
  };

  const submitTest = async () => {
    const formattedResponses = formatResponses();
    const submissionData = {
      studentId: user._id,
      testId: selectedTest._id,
      courseId: selectedCourse._id,
      responses: formattedResponses,
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/tracker/test-submission', submissionData);
      
      // Handle success
      console.log('Test Submitted Successfully', response.data);
      notification.success({
        message: "Test Submitted",
        description: "Your responses have been submitted successfully!",
      });
      navigate("/course");
      
    } catch (error) {
      console.error('Error submitting test', error);
      const errorMessage = error.response ? error.response.data.message : "An error occurred while submitting your test. Please try again later.";
      notification.error({
        message: "Error",
        description: errorMessage,
      });
    }
  };

  const formatResponses = () => {
    return selectedTest.questions.map((question) => {
      return {
        questionNum: question.questionNum,
        responseType: question.responseType,
        answer: responses[`question_${question.questionNum}`],
      };
    });
  };

  const renderOptions = (question) => {
    const questionKey = `question_${question.questionNum}`;
    const multipleAnswers = question.responseType === "multiple";

    return (
      <div className="my-4 w-full flex justify-around flex-wrap">
        {multipleAnswers ? (
          question.options.map((option, index) => (
            <label
              className={`w-1/2 flex justify-center text-center my-2`}
              key={index}
            >
              <Checkbox
                className={`w-4/5 text-center my-2 p-2 pl-6 rounded-lg ${
                  responses[questionKey]?.includes(option.value)
                    ? "border-2 border-black"
                    : "border border-gray-300"
                }`}
                checked={responses[questionKey]?.includes(option.value)}
                onChange={(e) => {
                  const updatedOptions = responses[questionKey]
                    ? [...responses[questionKey]]
                    : [];
                  if (e.target.checked) {
                    updatedOptions.push(option.value);
                  } else {
                    const index = updatedOptions.indexOf(option.value);
                    if (index > -1) {
                      updatedOptions.splice(index, 1);
                    }
                  }
                  handleResponseChange(questionKey, updatedOptions);
                }}
              >
                {option.value}
              </Checkbox>
            </label>
          ))
        ) : (
          <Radio.Group
            buttonStyle="solid"
            size="large"
            className="w-full flex justify-around flex-wrap"
            defaultValue={responses[questionKey]}
          >
            {question.options.map((option, index) => (
              <label className="w-1/2 flex justify-around my-2" key={index}>
                <Radio.Button
                  key={option._id}
                  onChange={() =>
                    handleResponseChange(questionKey, option.value)
                  }
                  className="w-4/5 text-center"
                  value={option.value}
                >
                  {option.value.charAt(0).toUpperCase() + option.value.slice(1)}
                </Radio.Button>
              </label>
            ))}
          </Radio.Group>
        )}
      </div>
    );
  };

  const handleDownloadFile = (filePath) => {
    window.open(filePath, "_blank");
  };

  const renderCurrentQuestion = () => {
    const question = selectedTest?.questions.find(
      (q) => q.questionNum === currentQuestion
    );
    if (!question) return null;

    return (
      <div key={question.questionNum}>
        <Title level={4}>
          {`Question ${question.questionNum}`}
          <span className=" font-normal text-lg">
            {" "}
            ({question.marks} points)
          </span>
        </Title>
        <p className="font-semibold mb-4 text-base">{question.questionInfo}</p>
        {question.options && question.options.length > 0 ? (
          renderOptions(question)
        ) : (
          <TextArea
            rows={4}
            className="mb-4"
            value={responses[`question_${question.questionNum}`]}
            onChange={(e) =>
              handleResponseChange(
                `question_${question.questionNum}`,
                e.target.value
              )
            }
          />
        )}
      </div>
    );
  };
  
  return (
    <>
      <Navbar />
      <div className="min-h-full bg-gray-100">
        <div className="px-6 bg-[#5bb38a]">
          <Heading
            link="/course"
            title={`${selectedCourse?.name.toUpperCase()} - ${
              selectedTest?.name
            }`}
            size={4}
          />
        </div>
        <div className="w-5/6 bg-transparent p-4 m-auto mt-8">
          <Row gutter={24}>
            <Col xs={24} sm={8} md={6} lg={4}>
              <Card title="Questions" className="mb-4 shadow-md">
                <div className="bg-white grid grid-cols-3 gap-2">
                  {selectedTest?.questions.map((question) => (
                    <Button
                      key={question.questionNum}
                      onClick={() => navigateToQuestion(question.questionNum)}
                      className={`col-span-1 m-0 p-0 ${
                        currentQuestion === question.questionNum
                          ? "bg-gray-100 border-solid border-2 border-green-600"
                          : ""
                      }`}
                    >
                      {question.questionNum}
                    </Button>
                  ))}
                </div>
              </Card>

              {selectedTest?.files?.length > 0 && (
                <Card title="Documents" className="mb-4 shadow-md">
                  <div className=" flex justify-around">
                    {selectedTest?.files.map((file, index) => (
                      <Tooltip key={index} title={file.fileName}>
                        <Button
                          type="primary"
                          className=" main-black-btn"
                          onClick={() => handleDownloadFile(file.filePath)}
                          icon={<DownloadOutlined />}
                        >
                          File {index + 1}
                        </Button>
                      </Tooltip>
                    ))}
                  </div>
                </Card>
              )}
            </Col>
            <Col xs={24} sm={16} md={18} lg={20}>
              <Card className="rounded shadow">
                <div className="w-full">
                  {renderCurrentQuestion()}
                  <div className={`w-full flex justify-between`}>
                    <Button
                      type="primary"
                      disabled={currentQuestion === 1}
                      onClick={() => navigateToQuestion(currentQuestion - 1)}
                      className="bg-[#5bb38a] text-white rounded-lg text-sm enabled:hover:!bg-white enabled:hover:!text-[#1c3f2f] 
                      enabled:hover:!border-[#1c3f2f] shadow-none"
                    >
                      Previous Question
                    </Button>
                    <Button
                      type="primary"
                      disabled={
                        currentQuestion >= selectedTest?.questions?.length
                      }
                      onClick={() => navigateToQuestion(currentQuestion + 1)}
                      className="bg-[#5bb38a] text-white rounded-lg text-sm enabled:hover:!bg-white enabled:hover:!text-[#1c3f2f] 
                      enabled:hover:!border-[#1c3f2f] shadow-none"
                    >
                      Next Question
                    </Button>
                  </div>
                </div>
              </Card>
              <div className={`w-full flex justify-center mt-8`}>
                <Button
                  type="primary"
                  size="large"
                  onClick={onFinish}
                  className="bg-[#1c3f2f] text-white rounded-lg text-sm enabled:hover:!bg-white enabled:hover:!text-[#1c3f2f] 
                      enabled:hover:!border-[#1c3f2f] shadow-none font-semibold"
                >
                  SUBMIT {selectedTest?.testType.toUpperCase()}
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default StudentTest;
