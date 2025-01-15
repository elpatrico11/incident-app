import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { verifyEmail } from "../../api/services/authService";
import {
  INVALID_VERIFICATION_LINK,
  VERIFICATION_SUCCESS,
  VERIFICATION_FAILED,
} from "../../constants/verificationConstants";

const useVerifyEmail = () => {
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: null,
    message: "",
  });

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token");
      const email = queryParams.get("email");

      if (!token || !email) {
        if (isMounted) {
          setVerificationStatus({
            loading: false,
            success: false,
            message: INVALID_VERIFICATION_LINK,
          });
        }
        return;
      }

      try {
        const data = await verifyEmail(token, email);
        if (isMounted) {
          setVerificationStatus({
            loading: false,
            success: true,
            message: data.msg || VERIFICATION_SUCCESS,
          });
        }
      } catch (error) {
        console.error("Verification error:", error);
        if (isMounted) {
          setVerificationStatus({
            loading: false,
            success: false,
            message: error.response?.data?.msg || VERIFICATION_FAILED,
          });
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [location.search]);

  return verificationStatus;
};

export default useVerifyEmail;
