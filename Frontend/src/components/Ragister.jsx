import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { encryptJson } from "../Crypoto.jsx";
import "./Register.css";
import { Pass } from "./ChatApp.jsx";
const x_man = process.env.REACT_APP_User
// Separate components
const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  required,
  pattern,
  title,
}) => (
  <div>
    <label>{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      pattern={pattern}
      title={title}
    />
  </div>
);

const ErrorMessage = ({ error }) => <p className="error-message">{error}</p>;

const SuccessMessage = ({ message }) => (
  <p className="success-message">{message}</p>
);

const Register = () => {
  const initialFormData = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    mobile: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [Exceloading, setExcelLoading] = useState(false);
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");
  // console.log("Username :=> ",username,"Type =>",typeof username)

  if (uid !== x_man) {
    setTimeout(() => {
      navigate("/");
    }, 3000);
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  async function GetPdf() {
    setExcelLoading(true);
    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem("token");
      
      // Send GET request with the token in the headers
      const pdf = await axios.get("https://chat-api-cxpz.onrender.com/api/pdf/?type=excel", {
        headers: {
          Authorization: token ? token : ""
        }
      });
      if(window.raj === Pass )console.log("PDF =>", pdf);
      const blob = new Blob([pdf.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // Excel MIME type
      });
  
      // Optionally, you can create a URL for the blob and trigger a download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
    link.setAttribute("download", "Chat App Official Users List.xlsx"); // set the desired file name and extension
    document.body.appendChild(link);
    link.click();

    // Clean up and remove the link after downloading
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setExcelLoading(false);
      return pdf;
    } catch (err) {
      setExcelLoading(false);
      if(window.raj === Pass )console.log("PDF Getting Error =>", err);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    const encryptdata = await encryptJson({ ...formData });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Server_api}api/create/`,
        { data: encryptdata },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setSuccessMessage("Registration successful! You can now log in.");
        setFormData(initialFormData);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      if(window.raj === Pass )console.error("Registration error:", err);
      setError(
        (await err.response.data) || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {uid === x_man ? (
        <>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            {error && <ErrorMessage error={error} />}
            {successMessage && <SuccessMessage message={successMessage} />}
            <div>
              <InputField
                label="First Name"
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
              <InputField
                label="Last Name"
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <InputField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <InputField
                label="Mobile"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number."
              />
            </div>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p align="right">
              <a href="/">Go To Login Page</a>
            </p>
          </form>
          <button className="button" style={{width:"150px"}} onClick={GetPdf} disabled={Exceloading}>
              {Exceloading ? "Getting Excel..." : "Get User List"}
          </button>
        </>
      ) : (
        <p align="center">You are not authorized to access this page.</p>
      )}
    </div>
  );
};
export default Register;
