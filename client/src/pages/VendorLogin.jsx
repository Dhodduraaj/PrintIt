import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VendorLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified login page
    navigate("/student-login");
  }, [navigate]);

  return null;
};

export default VendorLogin;
