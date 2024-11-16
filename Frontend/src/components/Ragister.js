import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { encryptJson } from "../Crypoto.js";
import './Register.css';

// Separate components
const InputField = ({ label, type, name, value, onChange, required, pattern, title }) => (
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

const ErrorMessage = ({ error }) => (
  <p className="error-message">{error}</p>
);

const SuccessMessage = ({ message }) => (
  <p className="success-message">{message}</p>
);

const Register = () => {
  const initialFormData = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    mobile: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");
  // console.log("Username :=> ",username,"Type =>",typeof username)

  if (uid !== "Raj0001") {
    setTimeout(() => {
      navigate("/");
    }, 3000);
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const encryptdata = await encryptJson({...formData})

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Server_api}api/create/`,{data:encryptdata},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        setSuccessMessage('Registration successful! You can now log in.');
        setFormData(initialFormData);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError((await err.response.data) || "Registration failed. Please try again." );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {uid === "Raj0001" ? (
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
        </>
      ) : (
        <p align="center">You are not authorized to access this page.</p>
      )}
    </div>
  );
}
export default Register;