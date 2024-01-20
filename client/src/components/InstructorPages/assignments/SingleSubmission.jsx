import Editor from "@monaco-editor/react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTracker } from "../../../context/TrackerProvider";
import Navbar from "../../misc/Navbar";
import { Button, Card, Typography, Select, Slider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Heading from "../../misc/Heading";

const { Title, Text } = Typography;
const { Option } = Select;

const SingleSubmission = () => {
  const [activeSubmission, setActiveSubmission] = useState();
  const { selectedCourse, setSelectedCourse } = useTracker();
  const [selectedAssignment, setSelectedAssignment] = useState();
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);

  const options = {
    fontSize: fontSize,
    readOnly: true,
    domReadOnly: true,
  };

  const themesList = [
    { value: "vs-dark", label: "Dark" },
    { value: "light", label: "Light" },
  ];
  const navigate = useNavigate();
  useEffect(() => {
    setActiveSubmission(JSON.parse(localStorage.getItem("submissionInfo")));
    setSelectedAssignment(JSON.parse(localStorage.getItem("assignmentInfo")));
    setSelectedCourse(JSON.parse(localStorage.getItem("courseInfo")));
    if (!localStorage.getItem("submissionInfo")) {
      navigate("/viewassignment");
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
                link={"/viewassignment"}
                title={`${selectedCourse?.name.toUpperCase()} - ${
                  selectedAssignment?.name
                }`}
              />
            </div>
            <div className="flex gap-6 mt-6 p-6 pt-0">
              <div className="flex flex-col gap-6 w-1/4">
                <Card
                  title={`Question ${activeSubmission.questionNum}`}
                  bordered={true}
                  className=" shadow-md"
                >
                  <Text>{activeSubmission.questionInfo}</Text>
                </Card>
                <Card className=" shadow-md">
                  <Text>
                    <b>Language:</b>{" "}
                    {activeSubmission.languageName === "62"
                      ? "Java"
                      : activeSubmission.languageName === "50"
                      ? "C"
                      : activeSubmission.languageName === "54"
                      ? "C++"
                      : "Python"}
                  </Text>
                </Card>
                <Card className=" shadow-md">
                  <Text>
                    <b>Test Cases Passed:</b> {activeSubmission.testCases}
                  </Text>
                </Card>
                <Card className=" shadow-md">
                  <Text>
                    <b>Code By:</b> {activeSubmission.studentName}
                  </Text>
                </Card>
              </div>

              <div className="w-3/4 flex flex-col">
                <div className=" flex justify-evenly gap-28 mb-4">
                  <div>
                    <Text className=" font-bold">Theme:</Text>
                    <Select
                      defaultValue={userTheme}
                      onChange={setUserTheme}
                      className="w-full"
                    >
                      {themesList.map((option, index) => (
                        <Option key={index} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Text className=" font-bold">Font Size:</Text>
                    <Slider
                      min={14}
                      max={30}
                      defaultValue={fontSize}
                      onChange={setFontSize}
                      style={{ width: "200px" }}
                    />
                  </div>
                </div>
                <div className="border-[1.5px] border-black shadow-2xl">
                  <Editor
                    options={options}
                    height="calc(72vh - 50px)"
                    width="100%"
                    theme={userTheme}
                    defaultLanguage="java"
                    keepCurrentModel={true}
                    saveViewState={false}
                    value={activeSubmission.answer}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SingleSubmission;
