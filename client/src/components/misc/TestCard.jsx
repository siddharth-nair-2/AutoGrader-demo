import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button, Tooltip } from "antd";
import { HiArrowNarrowRight } from "react-icons/hi";
import { useAuth } from "../../context/AuthProvider";

const { Meta } = Card;

const TestCard = ({ test, isCompleted }) => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const now = new Date();
  const scheduledTime = new Date(test.scheduledAt);
  const isAvailable = now >= scheduledTime;

  const handleTestOpen = () => {
    if (user.userType === "Student" && (isCompleted || !isAvailable)) return;

    if (user.userType === "Student") {
      const testForLocalStorage = {
        ...test,
        questions: test.questions.map((question) => ({
          ...question,
          options: question.options.map(({ isCorrect, ...rest }) => rest),
        })),
      };

      localStorage.setItem("testInfo", JSON.stringify(testForLocalStorage));
    } else {
      localStorage.setItem("testInfo", JSON.stringify(test));
    }
    navigate("/viewtest");
  };

  const formatScheduledAt = () => {
    return new Date(test.scheduledAt).toLocaleString("en-CA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatDuration = () => {
    return test.testType === "test"
      ? `${test.duration} minutes`
      : `${test.duration} day(s)`;
  };

  const getDescription = () => {
    const desc =
      test.description.length > 120
        ? `${test.description.substring(0, 120)}...`
        : test.description;
    return desc || "No description provided.";
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-CA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getEndsAt = () => {
    const durationMilliseconds =
      test.testType === "test"
        ? test.duration * 60 * 1000
        : test.duration * 24 * 60 * 60 * 1000;
    const endsAt = new Date(
      new Date(test.scheduledAt).getTime() + durationMilliseconds
    );
    return formatDateTime(endsAt);
  };

  return (
    <Card
      hoverable={user.userType !== "Student" || (isAvailable && !isCompleted)}
      className="rounded-xl shadow-md bg-white h-[275px] w-[360px] flex flex-col justify-between md:w-[400px]"
      actions={[
        user.userType === "Student" && isCompleted ? (
          <Typography.Text className="text-center w-full py-2 text-red-500">
            Already Completed | Marks scored: {test.marks}/
            {test?.questions.reduce((sum, question) => sum + question.marks, 0)}
          </Typography.Text>
        ) : user.userType === "Student" && !isAvailable ? (
          <Typography.Text className="text-center w-full py-2 text-blue-500">
            Not Available Yet
          </Typography.Text>
        ) : (
          <Tooltip placement="top" title="View Test">
            <Button
              type="text"
              key="open"
              onClick={handleTestOpen}
              icon={<HiArrowNarrowRight size={18} />}
            />
          </Tooltip>
        ),
      ]}
    >
      <Meta
        title={
          <Typography.Title
            level={4}
            style={{ color: "#6ab28a", marginBottom: 0 }}
          >
            {test.name}
          </Typography.Title>
        }
        description={
          <>
            <Typography.Text className="block font-semibold">
              {`${
                test.testType.charAt(0).toUpperCase() + test.testType.slice(1)
              } - ${formatDuration()}`}
            </Typography.Text>
            <Typography.Text className="block mt-2">
              {getDescription()}
            </Typography.Text>
            <Typography.Text className="block mt-4 text-gray-600">
              {`Scheduled: ${formatScheduledAt()}`}
            </Typography.Text>
            <Typography.Text className="block mt-2 text-gray-600">
              {`Ends At: ${getEndsAt()}`}
            </Typography.Text>
          </>
        }
      />
    </Card>
  );
};

export default TestCard;
