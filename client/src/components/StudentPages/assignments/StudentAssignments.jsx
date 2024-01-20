import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Editor from "@monaco-editor/react";
import Navbar from "../../misc/Navbar";
import {
  App,
  Slider,
  Typography,
  Button,
  Card,
  Select,
  Tooltip,
  Upload,
} from "antd";
import axios from "axios";
import Heading from "../../misc/Heading";
import {
  CodeOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

const StudentAssignments = () => {
  const { selectedCourse, setSelectedCourse, user } = useTracker();
  const [selectedAssignment, setSelectedAssignment] = useState();
  const [allQuestions, setAllQuestions] = useState();
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [userLang, setUserLang] = useState("62");
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);
  const [userCode, setUserCode] = useState(
    "// Enter your code here, and name the class Main"
  );
  const [disabled, setDisabled] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [testCasesUpdate, setTestCasesUpdate] = useState([]);

  const options = {
    fontSize: fontSize,
  };
  const { notification, modal } = App.useApp();

  const languagesList = [
    { value: "50", label: "C" },
    { value: "54", label: "C++" },
    { value: "71", label: "Python" },
    { value: "62", label: "Java" },
  ];

  const themesList = [
    { value: "vs-dark", label: "Dark" },
    { value: "light", label: "Light" },
  ];
  const navigate = useNavigate();

  /***************************************
   * INITIAL SETUP
   ***************************************/

  useEffect(() => {
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    setSelectedAssignment(JSON.parse(localStorage.getItem("assignmentInfo")));
    if (!JSON.parse(localStorage.getItem("courseInfo"))) {
      navigate("/");
    }
    if (!JSON.parse(localStorage.getItem("assignmentInfo"))) {
      navigate("/course");
    }
    let allQues = JSON.parse(localStorage.getItem("assignmentInfo")).questions;
    setAllQuestions(allQues);

    setSelectedQuestion(allQues[0]);
    let arrayTestCase = [];
    for (const element of allQues[0].testCases) {
      arrayTestCase.push({
        index: element.inputCase,
        expectedOutput: element.expectedOutput,
        output: "",
      });
    }
    localStorage.setItem("testCases", JSON.stringify(arrayTestCase));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /***************************************
   * BASIC FUNCTIONS
   ***************************************/

  const handleQuestionChange = (question) => {
    if (userCode !== "// Enter your code here, and name the class Main") {
      if (window.confirm("Any unsubmitted changes will be lost!")) {
        setSelectedQuestion(question);
        setUserCode("// Enter your code here, and name the class Main");
        let arrayTestCase = [];
        for (const element of question.testCases) {
          arrayTestCase.push({
            index: element.inputCase,
            expectedOutput: element.expectedOutput,
            output: "",
          });
        }
        localStorage.setItem("testCases", JSON.stringify(arrayTestCase));
      }
    } else {
      setSelectedQuestion(question);
      setUserCode("// Enter your code here, and name the class Main");
      let arrayTestCase = [];
      for (const element of question.testCases) {
        arrayTestCase.push({
          index: element.inputCase,
          expectedOutput: element.expectedOutput,
          output: "",
        });
      }
      localStorage.setItem("testCases", JSON.stringify(arrayTestCase));
    }

    setSubmitDisabled(true);
  };

  /***************************************
   * CODE COMPILATION
   ***************************************/
  // step 1: compile code
  const compileCode = async () => {
    if (
      userCode === `` ||
      userCode === "// Enter your code here, and name the class Main"
    ) {
      notification.error({
        message: "No code!",
        description: "Please enter some code to compile!",
        duration: 5,
        placement: "bottomLeft",
      });
      return;
    }

    setDisabled(true);
    setSubmitDisabled(true);

    for (const [index, singleCase] of selectedQuestion.testCases.entries()) {
      try {
        const data = {
          language_id: userLang,
          source_code: userCode,
          stdin: singleCase.inputCase,
          expected_output: singleCase.expectedOutput,
        };

        const response = await axios.post(
          "https://judge0-server.siddharthnair.info/submissions/",
          data
        );

        const token = response.data.token;
        if (token) {
          checkStatus(token, index);
        }
      } catch (error) {
        notification.error({
          message: "Compilation Error",
          description: error.response
            ? error.response.data.error
            : error.message,
          duration: 5,
          placement: "bottomLeft",
        });

        break;
      }
    }
  };

  const STATUS_CODES = {
    IN_QUEUE: 1,
    PROCESSING: 2,
  };

  // step 2: check status
  const checkStatus = async (token, caseIndex) => {
    const options = {
      method: "GET",
      url: "https://judge0-server.siddharthnair.info/submissions/" + token,
    };
    try {
      let response = await axios.request(options);
      const status = response.data.status;

      if (
        status.id === STATUS_CODES.IN_QUEUE ||
        status.id === STATUS_CODES.PROCESSING
      ) {
        setTimeout(() => checkStatus(token, caseIndex), 2000);
        return;
      }

      processResult(caseIndex, response.data);
    } catch (error) {
      console.log("err", error);
      setDisabled(false);
      notification.error({
        message: "Error",
        description: error.response.statusText,
        duration: 5,
        placement: "bottomLeft",
      });
    }
  };

  // step 3: process result
  const processResult = (caseIndex, data) => {
    let testCases = JSON.parse(localStorage.getItem("testCases")) || [];
    const testCase = testCases[caseIndex];

    let output =
      data.stdout || data.compile_output || data.stderr || "Pending...";

    output = output.trim();
    testCase.output = output;

    testCase.expectedOutput = testCase.expectedOutput.trim();

    localStorage.setItem("testCases", JSON.stringify(testCases));
    setTestCasesUpdate(testCases);
    if (caseIndex === testCases.length - 1) {
      notification.success({
        message: "Success",
        description: "All test cases compiled successfully!",
        duration: 5,
        placement: "bottomLeft",
      });

      setSubmitDisabled(false);
      setDisabled(false);
    }
  };

  /***************************************
   * QUESTION SUBMISSION
   ***************************************/

  const handleQuestionSubmit = async () => {
    if (
      userCode === "// Enter your code here, and name the class Main" ||
      userCode === ""
    ) {
      notification.warning({
        message: "No answer entered!",
        description: "Please enter an answer to submit this question!",
        duration: 5,
        placement: "bottomLeft",
      });
      return;
    }

    setDisabled(true);

    try {
      const existingSubmissions = await axios.get(
        `http://localhost:5000/api/tracker/submission/compare?studentID=${user._id}&questionID=${selectedQuestion._id}`
      );

      const isUpdate = existingSubmissions.data.length > 0;

      if (isUpdate) {
        modal.confirm({
          title: "Overwrite previous submission?",
          content:
            "You have already submitted an answer for this question. Do you want to overwrite it?",
          onOk: () => submitQuestion(isUpdate),
          okButtonProps: {
            className: " main-black-btn",
          },
          onCancel: () => setDisabled(false),
        });
      } else {
        modal.confirm({
          title: "Submit question?",
          content: "Are you sure you want to submit this code?",
          onOk: () => submitQuestion(isUpdate),
          okButtonProps: {
            className: " main-black-btn",
          },
          onCancel: () => setDisabled(false),
        });
      }
    } catch (error) {
      handleSubmissionError(error);
    }
  };

  const submitQuestion = async (isUpdate) => {
    const testCasesVal = countPassedCases();
    await submitOrUpdateSubmission(isUpdate, testCasesVal);
    await checkForPlagiarism();
    notification.success({
      message: `Question ${selectedQuestion.questionNum} submitted!`,
      description: "You have submitted the answer for this question!",
      duration: 5,
      placement: "bottomLeft",
    });
    setDisabled(false);
  };

  const countPassedCases = () => {
    const testCases = JSON.parse(localStorage.getItem("testCases")) || [];
    const passedCasesCOunt = testCases.reduce(
      (count, testCase) =>
        count +
        (testCase.expectedOutput.trim() === testCase.output.trim() ? 1 : 0),
      0
    );

    return `${passedCasesCOunt}/${testCases.length}`;
  };

  const submitOrUpdateSubmission = async (isUpdate, testCasesVal) => {
    const config = { Headers: { "Content-type": "application/json" } };
    const submissionData = {
      studentName: `${user.firstName} ${user.lastName}`,
      studentID: user._id,
      assignmentID: selectedAssignment._id,
      courseID: selectedCourse._id,
      questionID: selectedQuestion._id,
      questionNum: selectedQuestion.questionNum,
      questionInfo: selectedQuestion.questionInfo,
      languageName: userLang,
      testCases: testCasesVal,
      answer: userCode,
    };

    const url = isUpdate
      ? `http://localhost:5000/api/tracker/submission/update?courseID=${selectedCourse._id}&assignmentID=${selectedAssignment._id}&questionID=${selectedQuestion._id}&studentID=${user._id}`
      : "http://localhost:5000/api/tracker/submission";

    try {
      const { data } = await axios[isUpdate ? "patch" : "post"](
        url,
        submissionData,
        config
      );
      return data;
    } catch (error) {
      handleSubmissionError(error);
    }
  };

  const checkForPlagiarism = async () => {
    try {
      let url = `http://localhost:5000/api/tracker/submission/custom?courseID=${selectedCourse._id}&assignmentID=${selectedAssignment._id}&questionID=${selectedQuestion._id}&languageName=${userLang}&studentID=${user._id}`;
      const { data } = await axios.get(url);

      if (data.length > 0) {
        const otherSubmissions = data;
        const passedCases = countPassedCases();

        const config = {
          Headers: {
            "Content-type": "application/json",
          },
        };

        await axios.post(
          "http://localhost:8080/plagiarism/",
          {
            studentName: `${user.firstName} ${user.lastName}`,
            studentID: user._id,
            assignmentID: selectedAssignment._id,
            courseID: selectedCourse._id,
            questionID: selectedQuestion._id,
            questionNum: selectedQuestion.questionNum,
            questionInfo: selectedQuestion.questionInfo,
            languageName: userLang,
            testCases: passedCases,
            answer: userCode,
            otherSubmissions: otherSubmissions,
          },
          config
        );
      }
    } catch (error) {
      handleSubmissionError(error);
    }
  };

  const handleSubmissionError = (error) => {
    notification.error({
      message: "Error",
      description:
        error.response?.statusText || "An error occurred during submission",
      duration: 5,
      placement: "bottomLeft",
    });
  };

  /***************************************
   * FILE UPLOAD AND DOWNLOAD
   ***************************************/

  const handleFileInput = (info) => {
    const file = info.file;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      setUserCode(reader.result);
      setSubmitDisabled(true);
    };

    reader.onerror = () => {
      notification.error({
        message: "Error reading file",
        description: "There was an error reading the file.",
        duration: 5,
        placement: "bottomLeft",
      });
    };
  };

  const handleDownloadFile = (filePath) => {
    // Logic to download the file from the provided file path
    window.open(filePath, "_blank");
  };

  const downloadCode = () => {
    let fileName = prompt("Please enter your file-name:", "myCode");
    if (fileName == null || fileName === "") {
    } else {
      const element = document.createElement("a");
      const file = new Blob([userCode], {
        type: "text/plain;charset-utf-8",
      });
      const langNow =
        userLang === "62"
          ? "java"
          : userLang === "50"
          ? "c"
          : userLang === "54"
          ? "cpp"
          : "py";
      element.href = URL.createObjectURL(file);
      element.download = `${fileName}.${langNow}`;
      document.body.appendChild(element);
      element.click();
    }
  };

  return (
    <>
      <Navbar />
      {selectedCourse &&
        selectedCourse.name &&
        selectedAssignment &&
        selectedAssignment.name &&
        allQuestions &&
        selectedQuestion && (
          <div className="min-h-full bg-gray-100">
            {/* Header Section */}
            <div className="px-6 bg-[#5bb38a] ">
              <Heading
                link={"/course"}
                title={`${selectedCourse?.name.toUpperCase()} - ${
                  selectedAssignment?.name
                }`}
                size={4}
              />
            </div>
            <div className="flex justify-center items-center gap-4 p-2">
              {allQuestions?.map((question) => {
                const isSelected = selectedQuestion._id === question._id;
                return (
                  <Button
                    key={question._id}
                    onClick={() => handleQuestionChange(question)}
                    className={`${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-white text-black border-black"
                    } rounded-full p-2 font-bold text-sm flex items-center justify-center`}
                  >
                    {question.questionNum}
                  </Button>
                );
              })}
            </div>

            <div className="flex gap-6 p-6 pt-0">
              <div className="w-1/6">
                <Card
                  title={`Question ${selectedQuestion.questionNum}`}
                  bordered={true}
                  className=" shadow-md border-gray-200"
                >
                  <Text>{selectedQuestion.questionInfo}</Text>
                </Card>
                {selectedAssignment &&
                  selectedAssignment.instructorFiles &&
                  selectedAssignment.instructorFiles.length > 0 && (
                    <Card
                      title="Files"
                      className="mt-4 shadow-md border-gray-200"
                    >
                      <div className="flex flex-wrap gap-4 justify-center items-center">
                        {selectedAssignment.instructorFiles.map(
                          (file, index) => (
                            <Tooltip key={index} title={file.fileName}>
                              <Button
                                type="primary"
                                onClick={() =>
                                  handleDownloadFile(file.filePath)
                                }
                                icon={<DownloadOutlined />}
                                className="flex items-center justify-center main-black-btn"
                              >
                                File {index + 1}
                              </Button>
                            </Tooltip>
                          )
                        )}
                      </div>
                    </Card>
                  )}
              </div>

              <div className="w-4/6">
                <div className="flex justify-around mb-4">
                  <div className="flex items-center gap-2">
                    <Text className="font-bold whitespace-nowrap">
                      Language:
                    </Text>
                    <Select
                      defaultValue={userLang}
                      onChange={setUserLang}
                      className="flex-grow"
                      popupMatchSelectWidth={false}
                    >
                      {languagesList.map((option, index) => (
                        <Option key={index} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Text className="font-bold whitespace-nowrap">Theme:</Text>
                    <Select
                      defaultValue={userTheme}
                      onChange={setUserTheme}
                      className="flex-grow"
                      popupMatchSelectWidth={false}
                    >
                      {themesList.map((option, index) => (
                        <Option key={index} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Text className="font-bold whitespace-nowrap">
                      Font Size:
                    </Text>
                    <Slider
                      min={14}
                      max={30}
                      defaultValue={fontSize}
                      onChange={setFontSize}
                      className="w-32 md:w-48" // Adjust the width as needed
                    />
                  </div>
                </div>
                <div className="border-black border-[1.5px] shadow-2xl">
                  <Editor
                    options={options}
                    height="calc(72vh - 50px)"
                    width="100%"
                    theme={userTheme}
                    language={userLang}
                    defaultLanguage="java"
                    keepCurrentModel={true}
                    saveViewState={false}
                    value={userCode}
                    onChange={(value) => {
                      setUserCode(value);
                      setSubmitDisabled(true);
                    }}
                  />
                </div>
              </div>
              <div className="w-1/6 overflow-y-auto max-h-[500px] xl:max-h-[650px]">
                {selectedQuestion?.testCases.map((testCaseEach, index) => {
                  let arrVal = JSON.parse(localStorage.getItem("testCases"));
                  const testCaseResult = arrVal[index].output;
                  let cardClass = "";
                  if (testCaseResult === "") {
                    cardClass = "border-gray-200";
                  } else if (testCaseResult === arrVal[index].expectedOutput) {
                    cardClass = "bg-green-100 border-green-500 text-green-700";
                  } else {
                    cardClass = "bg-red-100 border-red-500 text-red-700";
                  }

                  return (
                    <>
                      <Card
                        key={testCaseEach._id}
                        title={`Test Case ${index + 1}`}
                        bordered={true}
                        className={`${cardClass} mb-4 shadow-md`}
                      >
                        <div className=" flex flex-col gap-1">
                          <Text className=" text-sm flex justify-between items-center">
                            Input:{" "}
                            <Text strong className=" text-sm">
                              {testCaseEach.inputCase}
                            </Text>
                          </Text>
                          <Text className=" text-sm flex justify-between items-center">
                            Expected:{" "}
                            <Text strong className=" text-sm">
                              {testCaseEach.expectedOutput}
                            </Text>
                          </Text>
                          <Text className=" text-sm flex justify-between items-center">
                            Output:{" "}
                            <Text strong className=" text-sm">
                              {testCaseResult}
                            </Text>
                          </Text>
                        </div>
                      </Card>
                    </>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-around items-center mt-4">
              <Upload
                beforeUpload={() => false} // Prevent automatic upload
                onChange={handleFileInput}
                accept=".java,.py,.pyi,.pyc,.pyd,.pyo,.pyw,.pyz,.cpp,.c,.cxx,.cc"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} size="large">
                  Upload Code
                </Button>
              </Upload>

              <Button
                size="large"
                className=" main-black-btn"
                onClick={downloadCode}
                disabled={disabled}
                icon={<DownloadOutlined />}
              >
                Download Code
              </Button>

              <Button
                size="large"
                className=" main-black-btn"
                onClick={compileCode}
                disabled={disabled}
                icon={<CodeOutlined />}
              >
                Compile Code
              </Button>

              <Button
                size="large"
                className=" main-black-btn"
                onClick={handleQuestionSubmit}
                disabled={submitDisabled}
                type="primary" // Makes the button stand out as the primary action
                title={
                  submitDisabled
                    ? "Compile your code to submit!"
                    : "Submit Answer!"
                }
              >
                Submit Question {selectedQuestion.questionNum}
              </Button>
            </div>
          </div>
        )}
    </>
  );
};

export default StudentAssignments;
