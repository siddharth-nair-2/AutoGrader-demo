import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthProvider";

const trackerContext = createContext();

const TrackerProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthProvider
  const [selectedCourse, setSelectedCourse] = useState();
  const [courses, setCourses] = useState([]);

  return (
    <trackerContext.Provider
      value={{
        user,
        selectedCourse,
        setSelectedCourse,
        courses,
        setCourses,
      }}
    >
      {children}
    </trackerContext.Provider>
  );
};
export const useTracker = () => useContext(trackerContext);

export default TrackerProvider;
