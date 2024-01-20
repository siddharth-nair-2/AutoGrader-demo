import { Route, Routes, Navigate } from "react-router-dom";
import { instructorRoutes, studentRoutes } from "./routes";

import { useAuth } from "./context/AuthProvider"; // Adjust the path as needed

import Login from "./components/Auth/Login";
import Signup from "./components/Auth/SignUp";
import NotFound from "./components/NotFound";

function App() {
  const { user } = useAuth();

  // Function to render routes specific to a user type
  const renderRoutesForUser = (userType, routes) => {
    return (
      user &&
      user.userType === userType &&
      routes.map((route) => <Route key={route.path} {...route} />)
    );
  };

  return (
    <Routes>
      {renderRoutesForUser("Instructor", instructorRoutes)}
      {renderRoutesForUser("Student", studentRoutes)}

      {/* Redirects for logged-in users */}
      {user && (
        <>
          <Route path="/login" element={<Navigate replace to="/" />} />
          <Route path="/signup" element={<Navigate replace to="/" />} />
        </>
      )}

      {/* Public routes */}
      {!user && (
        <>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate replace to="/login" />} />
        </>
      )}

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
