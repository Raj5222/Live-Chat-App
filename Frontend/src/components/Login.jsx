// src/components/Login.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { encryptJson } from "../Crypoto.jsx";
import "./Login.css"; // Import a CSS file for styles
import { ERROR_MESSAGES, Pass } from "./ChatApp.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      if (localStorage.getItem("token")) {
        navigate("/chat");
      }
    };

    checkToken();
  }, [navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    try {
      const encryptedData = await encryptJson({ email, password });
      setError(ERROR_MESSAGES.Login_CONNICTING) //That Show Waiting Message Of Loging Page.
      const response = await axios.post(
        `${process.env.REACT_APP_Server_api}api/login/`,
        { data: encryptedData },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if(window.raj === Pass )console.log("Response data => ", response);

      if (response.data.token) {
        // Simplified condition
        axios.defaults.headers["Authorization"] = response.data.token;
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);
        if(response.data.username === "Demo"){
          const new_name  = window.prompt("You Are Demo User Please Enter Your Name!")
          if(new_name !== null){
            localStorage.setItem("username",`${String(new_name).trim()} (Demo)`)
          }
        }
        localStorage.setItem("uid", response.data.uid);
        navigate("/chat");
        setError("")
      }
    } catch (err) {
    if(window.raj === Pass )console.error("Login error:", err?.response?.data?.error); // Log for debugging
      setError(err?.response?.data?.error || "Login failed. Please try again."); // Set a default error message
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
        {error && <><p className="error-message">{error}</p><br/></>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <br />
    </div>
  );
};

export default Login;
