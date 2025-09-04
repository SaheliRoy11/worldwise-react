import { useEffect } from "react";
import { useAuth } from "../contexts/FakeAuthContext";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(
    function () {
      if (!isAuthenticated) navigate("/");//if user is not authenticated redirect to home page
    },
    [isAuthenticated, navigate]
  );

  //the application will be wrapped inside the Protected route component so receiving app as children.
  //Note that the useEffect() executes after the component is rendered.So, in the split second if the app is rendered it will give error in <User> component (the user object will not exist if user is not logged in) as it will try accessing null values in its' JSX.So, we use conditional rendering, if user is logged in then only return children (AppLayout) otherwise nothing will be returned or rendered in the split second.
  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
