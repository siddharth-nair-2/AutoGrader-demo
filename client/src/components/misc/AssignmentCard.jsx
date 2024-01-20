import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button, Tooltip } from "antd";
import { HiArrowNarrowRight } from "react-icons/hi";

const { Meta } = Card;

const AssignmentCard = ({ assignment }) => {
  const navigate = useNavigate();

  const handleAssignmentOpen = () => {
    localStorage.setItem("assignmentInfo", JSON.stringify(assignment));
    assignment.hasOwnProperty("questions")
      ? navigate("/viewassignment")
      : navigate("/viewtheoryassignment");
  };

  const getItemCount = () => {
    if (assignment.questions) {
      return assignment.questions.length + assignment.instructorFiles.length;
    } else {
      return assignment.instructorFiles.length;
    }
  };

  return (
    <Card
      hoverable
      className="rounded-xl shadow-md bg-white h-[275px] w-[360px] flex flex-col justify-between md:w-[400px]"
      actions={[
        <Tooltip placement="top" title="View Assignment">
          <Button
            type="text"
            key="open"
            onClick={handleAssignmentOpen}
            icon={<HiArrowNarrowRight size={18} />}
          />
        </Tooltip>,
      ]}
    >
      <Meta
        title={
          <Typography.Title
            level={4}
            style={{
              color: "#6ab28a",
              marginBottom: 0,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {assignment.name}
          </Typography.Title>
        }
        description={
          <>
            <Typography.Title level={5} className="font-semibold">
              {getItemCount()} Item(s)
            </Typography.Title>
            <Typography.Text className="block">
              {assignment.description.length > 120
                ? `${assignment.description.substring(0, 120)}...`
                : assignment.description}
            </Typography.Text>
            <Typography.Text className="block mt-4 text-gray-600">
              {`Due on: ${new Date(assignment.due_date).toLocaleString(
                "en-CA",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              )}`}
            </Typography.Text>
          </>
        }
      />
    </Card>
  );
};

export default AssignmentCard;
