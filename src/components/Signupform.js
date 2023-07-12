import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Form from "react-bootstrap/Form";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import GoogleIcon from "@mui/icons-material/Google";
import "./Signupform.css";
import {
  child,
  ref as databaseRef,
  set,
  orderByChild,
  equalTo,
  query,
  onValue,
  get,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { database, auth, googleProvider, storage } from "../config";
import PropTypes from "prop-types";

const REALTIME_DATABASE_USERS_KEY = "Users";
const STORAGE_KEY = "images/";

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

const Signup = () => {
  const [nameInputValue, setNameInputValue] = useState("");
  const [emailInputValue, setEmailInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");
  const [confirmPwdInputValue, setConfirmInputValue] = useState("");
  const [fileInputValue, setFileInputValue] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [conPwdError, setConPwdError] = useState("");
  const [fileError, setFileError] = useState("");

  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [errorAlert, setErrorAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");

  const [progresspercent, setProgresspercent] = useState(0);

  const navigate = useNavigate();

  const getGoogleAccDetails = (user) => {
    const usersCollection = databaseRef(database, REALTIME_DATABASE_USERS_KEY);

    get(usersCollection)
      .then((snapshot) => {
        if (snapshot.exists()) {
          //Check for empty database, if gmail already registered, create fresh new record in the database...
          const usersWithMatchingEmailQuery = query(
            usersCollection,
            orderByChild(`email`),
            equalTo(user.email)
          );

          onValue(
            usersWithMatchingEmailQuery,
            (snapshot) => {
              if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                  //const childKey = childSnapshot.key;
                  //const childData = childSnapshot.val();
                  
                  navigate("/");
                  // ...
                });
              } else {
                const newUsersRef = child(usersCollection, user.uid);
                set(newUsersRef, {
                  name: user.displayName,
                  authProvider: "google",
                  email: user.email,
                  avatar: user.photoURL,
                });
                setSuccessAlert("Successfully logged in with google account!");
                navigate("/");
              }
            },
            {
              onlyOnce: true,
            }
          );
        } else {
          const newUsersRef = child(usersCollection, user.uid);
          //const newUsersRef = push(usersCollection);

          set(newUsersRef, {
            name: user.displayName,
            authProvider: "google",
            email: user.email,
            avatar: user.photoURL,
          });

          navigate("/");
        }
      })
      .catch((error) => {
        setErrorAlert(`${error.code} : ${error.message}`);
      });
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        getGoogleAccDetails(user);
      })
      .catch((error) => {
        setErrorAlert(`${error.code} : ${error.message}`);
      });
  };

  const registerWithEmailAndPassword = async (name, email, password, url) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        const user = result.user;
        const usersCollection = databaseRef(
          database,
          REALTIME_DATABASE_USERS_KEY
        );

        const newUsersRef = child(usersCollection, user.uid);
        set(newUsersRef, {
          name: name,
          authProvider: "local",
          email: email,
          avatar: url,
        })
          .then(() => {
            setSuccessAlert("Account created with email and password.");
          })
          .catch((error) => {
            console.log(`${error.code} : ${error.message}`);
            //Firebase Realtime Database errors
            setErrorAlert("Account details failed to be created in database.");
          });
      })
      .catch((error) => {
        console.log(`${error.code} : ${error.message}`);
        //Firebase Auth Errors
        setErrorAlert(`Failed to register account.\n${error.code}`);
      });
  };

  const handleChange = (event) => {
    if (event.target.name === "emailInputValue") {
      setEmailInputValue(event.target.value);
    } else if (event.target.name === "nameInputValue") {
      setNameInputValue(event.target.value);
    } else if (event.target.name === "passwordInputValue") {
      setPasswordInputValue(event.target.value);
    } else if (event.target.name === "confirmPassword") {
      setConfirmInputValue(event.target.value);
    } else if (event.target.name === "fileInput") {
      setFileInputFile(event.target.files[0]);
      setFileInputValue(event.target.file);
    }
  };

  const validate = (event) => {
    const validEmailRegex = (email) => {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return emailRegex.test(email);
    };

    let pwdErrorMeg = "";
    const validPasswordRegex = (password) => {
      const passwordInputValue = password.trim();

      const uppercaseRegExp = /(?=.*?[A-Z])/;
      const lowercaseRegExp = /(?=.*?[a-z])/;
      const digitsRegExp = /(?=.*?[0-9])/;
      const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
      const minLengthRegExp = /.{8,}/;

      const passwordLength = passwordInputValue.length;
      const uppercasePassword = uppercaseRegExp.test(passwordInputValue);
      const lowercasePassword = lowercaseRegExp.test(passwordInputValue);
      const digitsPassword = digitsRegExp.test(passwordInputValue);
      const specialCharPassword = specialCharRegExp.test(passwordInputValue);
      const minLengthPassword = minLengthRegExp.test(passwordInputValue);

      let errorMessage = [];

      if (passwordLength === 0) {
        errorMessage.push("Password is empty");
      }
      if (!uppercasePassword) {
        errorMessage.push("At least one Uppercase");
      }
      if (!lowercasePassword) {
        errorMessage.push("At least one Lowercase");
      }
      if (!digitsPassword) {
        errorMessage.push("At least one digit");
      }
      if (!specialCharPassword) {
        errorMessage.push("At least one Special Characters");
      }
      if (!minLengthPassword) {
        errorMessage.push("At least minumum 8 characters");
      }

      let errMeg = errorMessage.toString();

      if (errMeg !== "") {
        pwdErrorMeg = errMeg;
        return false;
      } else {
        return true;
      }
    };

    if (event.target.name === "emailInputValue") {
      if (emailInputValue.trim().length === 0) {
        setEmailError("Your email field is empty");
      } else if (!validEmailRegex(emailInputValue)) {
        setEmailError("Not a valid email.");
      } else {
        setEmailError("");
      }
    } else if (event.target.name === "nameInputValue") {
      if (nameInputValue.trim().length === 0) {
        setNameError("Your name field is empty.");
      } else {
        setNameError("");
      }
    } else if (event.target.name === "passwordInputValue") {
      if (passwordInputValue.trim().length === 0) {
        setPwdError("Your password field is empty");
      } else if (!validPasswordRegex(passwordInputValue)) {
        setPwdError(pwdErrorMeg);
      } else {
        setPwdError("");
      }
    } else if (event.target.name === "confirmPassword") {
      if (confirmPwdInputValue.trim().length === 0) {
        setConPwdError("Your confirm password field is empty");
      } else {
        setConPwdError("");
      }
    } else if (event.target.name === "fileInput") {
      if (fileInputFile === null) {
        setFileError("No Image file uploaded.");
      } else {
        setFileError("");
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      nameInputValue.trim().length === 0 ||
      emailInputValue.trim().length === 0 ||
      passwordInputValue.trim().length === 0 ||
      confirmPwdInputValue.trim().length === 0 ||
      fileInputFile === null
    ) {
      setErrorAlert("Please do not leave any fields empty.");
    } else {
      setErrorAlert("");
    }

    const originalInputState = () => {
      // Reset auth form state
      setEmailInputValue("");
      setPasswordInputValue("");
      setConfirmInputValue("");
      setErrorCode("");
      setErrorMessage("");
      setFileInputFile(null);
      setFileInputValue("");
      setErrorAlert("");
    };

    const setErrorState = (error) => {
      setErrorCode(error.code);
      setErrorMessage(error.message);
      setErrorAlert(`${errorCode} : ${errorMessage}`);
    };

    const conditions = [
      nameError === "",
      emailError === "",
      pwdError === "",
      conPwdError === "",
      fileError === "",
    ];

    const allConditionsMet = conditions.every((condition) => condition);

    const matchingPassword = () => {
      if (passwordInputValue !== confirmPwdInputValue) {
        setPwdError("Passwords do not match.");
        return false;
      } else {
        setPwdError("");
        return true;
      }
    };

    if (allConditionsMet && matchingPassword && errorAlert === "") {
      //If pwd and confirmPwd matched, upload file to firebase and run register function.
      const fullStorageRef = storageRef(
        storage,
        STORAGE_KEY + fileInputFile.name
      );

      const uploadTask = uploadBytesResumable(fullStorageRef, fileInputFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgresspercent(progress);
        },
        (error) => {
          setErrorAlert(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            registerWithEmailAndPassword(
              nameInputValue,
              emailInputValue,
              passwordInputValue,
              downloadURL
            )
              .then(() => {
                navigate("/");
                originalInputState();
              })
              .catch(setErrorState);
          });
        }
      );
    }
  };

  return (
    <div className="centered">
      {errorAlert !== "" && <Alert severity="error">{errorAlert}</Alert>}
      {successAlert !== "" && <Alert severity="success">{successAlert}</Alert>}
      <p style={{ textAlign: "right", fontSize: 15 }}>
        Already have an account ? Click{" "}
        <Link to="/auth/login" style={{ color: "yellow" }}>
          here
        </Link>
        .
      </p>
      <h1>Sign up</h1>
      <p style={{ paddingBottom: 20, fontSize: 20 }}>
        Sign in using your google account
      </p>

      <Button
        variant="contained"
        style={{ marginLeft: "6%", width: "88%", height: 50 }}
        startIcon={<GoogleIcon />}
        onClick={() => signInWithGoogle()}
      >
        Sign in with Google
      </Button>

      <h4 style={{ paddingTop: 35, fontSize: 20 }}>
        Or sign up with your email
      </h4>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="outlined-basic"
          error={nameError !== ""}
          helperText={nameError}
          label="Display Name"
          variant="filled"
          type="text"
          name="nameInputValue"
          value={nameInputValue}
          onChange={handleChange}
          onBlur={validate}
          style={{ backgroundColor: "white", fontWeight: "bolder" }}
        />
        <TextField
          error={emailError !== ""}
          helperText={emailError}
          label="Email Address"
          variant="filled"
          type="email"
          name="emailInputValue"
          value={emailInputValue}
          onChange={handleChange}
          onBlur={validate}
          style={{ backgroundColor: "white", fontWeight: "bolder" }}
        />
        <TextField
          error={pwdError !== ""}
          helperText={pwdError !== "" && pwdError}
          label="Password"
          variant="filled"
          type="password"
          name="passwordInputValue"
          value={passwordInputValue}
          onChange={handleChange}
          onBlur={validate}
          style={{ backgroundColor: "white", fontWeight: "bolder" }}
        />
        <TextField
          error={conPwdError !== ""}
          helperText={conPwdError}
          label="Repeat password"
          variant="filled"
          type="password"
          name="confirmPassword"
          value={confirmPwdInputValue}
          onChange={handleChange}
          onBlur={validate}
          style={{ backgroundColor: "white", fontWeight: "bolder" }}
        />
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Control
            required
            type="file"
            name="fileInput"
            value={fileInputValue}
            onBlur={validate}
            isInvalid={!(fileError === "")}
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            {fileError}
          </Form.Control.Feedback>
        </Form.Group>
        {progresspercent > 0 && (
          <Box sx={{ width: "100%" }}>
            <LinearProgressWithLabel value={progresspercent} />
          </Box>
        )}
        <Button
          variant="outlined"
          type="submit"
          style={{ fontWeight: "bolder" }}
        >
          Sign up
        </Button>
      </form>
    </div>
  );
};

export default Signup;
