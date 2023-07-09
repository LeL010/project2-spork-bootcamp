import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config";
import "../App.css";

const Login = () => {
  const [inputEmail, inputEmailValue] = useState("");
  const [inputPwd, inputPwdValue] = useState("");
  const [authAlerts, setAuthAlerts] = useState("");
  const navigate = useNavigate();

  const logInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password).then(() => {
      setAuthAlerts("Successfully logged in!");
      inputEmailValue("");
      inputPwdValue("");
      navigate("/");
    }).catch((err) => {
      console.error(err);
      if (err.code === `auth/wrong-password`) {
        setAuthAlerts("Wrong password. Please try again.");
      } else if (err.code === `auth/too-many-requests`) {
        setAuthAlerts(
          "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later."
        );
      }
    });
  };

  const handleChange = (e) => {
    if (e.target.name === "inputEmailValue") {
      inputEmailValue(e.target.value);
    } else if (e.target.name === "inputPwdValue") {
      inputPwdValue(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logInWithEmailAndPassword(inputEmail, inputPwd);
  };

  return (
    <div className="centered">
      {authAlerts !== "" && <Alert severity="error">{authAlerts}</Alert>}
      {authAlerts === "Successfully logged in!" && <Alert severity="success">{authAlerts}</Alert>}
      <p style={{ textAlign: "right", fontSize: 15 }}>
        Don't have an account ? Click{" "}
        <Link to="/auth/register" style={{ color: "yellow" }}>
          here
        </Link>
        .
      </p>
      <h1>Login</h1>
      <h4>Login using your account</h4>
      <form className="form" onSubmit={handleSubmit}>
        <TextField
          id="outlined-basic"
          label="Email Address"
          variant="filled"
          type="email"
          name="inputEmailValue"
          value={inputEmail}
          onChange={handleChange}
          style={{ backgroundColor: "white" }}
        />
        <TextField
          label="Password"
          variant="filled"
          type="password"
          name="inputPwdValue"
          value={inputPwd}
          onChange={handleChange}
          style={{ backgroundColor: "white", fontWeight: "bolder" }}
        />
        <Button
          variant="outlined"
          type="submit"
          style={{ fontWeight: "bolder" }}
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
