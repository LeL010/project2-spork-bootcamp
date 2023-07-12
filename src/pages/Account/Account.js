import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref as databaseRef, child, get, set, remove } from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { database, auth, storage } from "../../config";
import "./Account.css";
import { Alert, Box, LinearProgress, Typography } from "@mui/material";

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

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] = useState();

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [imgLink, setImgLink] = useState("");
  const [provider, setProvider] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progresspercent, setProgresspercent] = useState(0);

  useEffect(() => {
    const dbRef = databaseRef(database);
    get(child(dbRef, `${REALTIME_DATABASE_USERS_KEY}/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userDetails = snapshot.val();
          setEmail(userDetails.email);
          setName(userDetails.name);
          setImgLink(userDetails.avatar);
          setProvider(userDetails.authProvider);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });

    onAuthStateChanged(auth, (userObj) => {
      // If user is logged in, save logged-in user to state
      if (userObj) {
        let currentUser = auth.currentUser;
        setLoggedInUser(currentUser);
        return;
      }
      // Else set logged-in user in state to null
      setLoggedInUser(null);
    });
  }, [userId, loggedInUser]);

  function reauthenticate(currPwd) {
    let credential = EmailAuthProvider.credential(loggedInUser.email, currPwd);
    return reauthenticateWithCredential(loggedInUser, credential);
  }

  function writeData() {
    const currentUserRef = databaseRef(
      database,
      `${REALTIME_DATABASE_USERS_KEY}/${userId}`
    );

    if (fileInputFile !== null) {
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
          alert(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            set(currentUserRef, {
              name: name,
              authProvider: provider,
              email: email,
              avatar: fileInputFile === null ? imgLink : downloadURL,
            });
          });
        }
      );
    } else {
      set(currentUserRef, {
        name: name,
        authProvider: provider,
        email: email,
        avatar: fileInputFile === null && imgLink,
      });
    }
  }

  function deleteData() {
    const currentUserRef = databaseRef(
      database,
      `${REALTIME_DATABASE_USERS_KEY}/${userId}`
    );
    remove(currentUserRef);
  }

  function handleChange(event) {
    if (event.target.name === "displayName") {
      setName(event.target.value);
    } else if (event.target.name === "imgFile") {
      setFileInputFile(event.target.files[0]);
    } else if (event.target.name === "userEmail") {
      setEmail(event.target.value);
    } else if (event.target.name === "currentPassword") {
      setCurrentPassword(event.target.value);
    } else if (event.target.name === "newPassword") {
      setNewPassword(event.target.value);
    } else if (event.target.name === "confirmPassword") {
      setNewConfirmPassword(event.target.value);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (provider !== "google") {
      reauthenticate(currentPassword)
        .then(() => {
          if (newPassword !== newConfirmPassword) {
            return setError(`Passwords do not match!`);
          }
          const promises = [];
          setError("");
          setLoading(true);
          if (email !== loggedInUser.email) {
            promises.push(updateEmail(loggedInUser, email));
          }
          if (newPassword) {
            promises.push(updatePassword(loggedInUser, newPassword));
          }

          promises.push(writeData());

          Promise.all(promises)
            .then(() => {
              setMessage("Account Settings updated. Refreshing page...");
              setTimeout(() => {
                navigate(`/`);
              }, 3000);
            })
            .catch((error) => {
              setError("Failed to update account.");
              console.log(error);
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch((error) => {
          setError("Current Password is incorrect.");
          setCurrentPassword("");
        });
    } else {
      writeData();
      setMessage("Account Settings updated. Refreshing page...");
      setTimeout(() => {
        navigate(`/`);
      }, 3000);
    }
  }

  function deleteAccount(event) {
    event.preventDefault();
    if (provider === "google") {
      reauthenticateWithPopup(loggedInUser, new GoogleAuthProvider())
        .then(() => {
          deleteUser(loggedInUser)
            .then(() => {
              deleteData();
              // User deleted.
              alert("Account deleted. Refreshing page...");
              navigate(`/auth/login`);
            })
            .catch((error) => {
              // An error ocurred
              // ...
              const errorCode = error.code;
              const errorMessage = error.message;
              setError(`${errorCode} : ${errorMessage}`);
            });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setError(`${errorCode} : ${errorMessage}`);
        });
    } else {
      reauthenticate(currentPassword)
        .then(() => {
          deleteUser(loggedInUser)
            .then(() => {
              deleteData();
              // User deleted.
              alert("Account deleted. Refreshing page...");
              navigate(`/auth/login`);
            })
            .catch((error) => {
              // An error ocurred
              // ...
              const errorCode = error.code;
              const errorMessage = error.message;
              setError(`${errorCode} : ${errorMessage}`);
            });
        })
        .catch((error) => {
          setError("Current Password is incorrect.");
          setCurrentPassword("");
        });
    }
  }

  return (
    <div className="container">
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <img src={imgLink} alt="Avatar" className="avatar" />
      <form>
        <div className="form-horizontal">
          <div className="col-25">
            <label className="control-label" htmlFor="dName">
              Display Name
            </label>
          </div>
          <div className="col-75">
            <input
              id="dName"
              type="text"
              name="displayName"
              defaultValue={name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-horizontal">
          <div className="col-25">
            <label className="control-label" htmlFor="imageFile">
              Upload an Image
            </label>
          </div>
          <div className="col-75">
            <input
              id="imageFile"
              type="file"
              name="imgFile"
              onChange={handleChange}
            />
          </div>
        </div>
        {progresspercent > 0 && (
          <Box sx={{ width: "100%" }}>
            <LinearProgressWithLabel value={progresspercent} />
          </Box>
        )}
        <div className="form-horizontal">
          <div className="col-25">
            <label className="control-label" htmlFor="uEmail">
              Email
            </label>
          </div>
          <div className="col-75">
            <input
              id="uEmail"
              type="email"
              name="userEmail"
              defaultValue={email}
              onChange={handleChange}
              disabled={provider === "google" ? true : false}
            />
          </div>
        </div>

        <div className="form-horizontal">
          <div className="col-25">
            <label className="control-label" htmlFor="uCPassword">
              Current Password
            </label>
          </div>
          <div className="col-75">
            <input
              id="uCPassword"
              type="password"
              name="currentPassword"
              onChange={handleChange}
              disabled={provider === "google" ? true : false}
            />
          </div>
        </div>

        <div className="form-horizontal">
          <div className="col-25">
            <label className="control-label" htmlFor="uNPassword">
              New Password
            </label>
          </div>
          <div className="col-75">
            <input
              id="uNPassword"
              type="password"
              name="newPassword"
              onChange={handleChange}
              disabled={currentPassword.trim() === "" ? true : false}
            />
          </div>
        </div>

        <div className="form-horizontal">
          <div className="col-25">
            <label className="control-label" htmlFor="uPasswordC">
              Confirm New Password
            </label>
          </div>
          <div className="col-75">
            <input
              id="uPasswordC"
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              disabled={currentPassword.trim() === "" ? true : false}
            />
          </div>
        </div>

        <button
          className="updateButton"
          disabled={
            provider === "google"
              ? false
              : currentPassword.trim() !== ""
              ? false
              : loading
              ? false
              : true
          }
          onClick={handleSubmit}
        >
          Update
        </button>

        <button
          className="deleteButton"
          disabled={
            provider === "google"
              ? false
              : currentPassword.trim() !== ""
              ? false
              : true
          }
          onClick={deleteAccount}
        >
          Delete
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
