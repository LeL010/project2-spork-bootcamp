import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Authform from "../pages/Auth/AuthForm";
import Signup from "../components/Signupform";
import Login from "../components/Loginform";
import Error404 from "../pages/NotFound404";
import SearchPage from "../pages/SearchPage";
import Homepage from "../pages/Homepage/Homepage";
import ProfilePage from "../pages/Account/Account";
import ResultRecipe from "../pages/ResultRecipe";
import ImgClassify from "../pages/ImgClass";
import Googlemap from "../pages/Map/Map";
import SavedRecipes from "../pages/SavedRecipes";
import { auth } from "../config";
import { onAuthStateChanged } from "firebase/auth";


export default function DefineRoutesHere() {
  const [loggedInUser, setLoggedInUser] = useState();

  useEffect(() => {
    onAuthStateChanged(auth, (userObj) => {
      // If user is logged in, save logged-in user to state
      if (userObj) {
        let currentUser = auth.currentUser;
        setLoggedInUser(currentUser);
        return;
      }
      // Else set logged-in user in state to null
      setLoggedInUser(null);
      //console.log(userObj);
    });
  }, [loggedInUser]);

  function RequireAuth({ children, redirectTo, user }) {
    console.log(user);
    const isAuthenticated = loggedInUser;
    return isAuthenticated !== null ? children : <Navigate to={redirectTo} />;
  }

  return (
    <Routes>
      <Route path="/auth" element={<Authform />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Signup />} />
      </Route>
      <Route
        path="/"
        element={
          <RequireAuth redirectTo="/auth/login" user={loggedInUser}>
            <Homepage />
          </RequireAuth>
        }
      />
      <Route
        path={`/account/:userId`}
        element={
          <RequireAuth redirectTo="/auth/login" user={loggedInUser}>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/search/:search"
        element={
          <RequireAuth redirectTo="/auth/login" user={loggedInUser}>
            <SearchPage />
          </RequireAuth>
        }
      />
      <Route
        path="/recipe/:recipeName"
        element={
          <RequireAuth redirectTo="/auth/login" user={loggedInUser}>
            <ResultRecipe />
          </RequireAuth>
        }
      />
      <Route
        path="/imageclassify"
        element={
          <RequireAuth redirectTo="/auth/login" user={loggedInUser}>
            <ImgClassify />
          </RequireAuth>
        }
      />
      <Route
        path="/map"
        element={
          <RequireAuth redirectTo="/auth/login" user={loggedInUser}>
            <Googlemap />
          </RequireAuth>
        }
      />
      <Route
        path="/saved-recipes"
        element={
          <RequireAuth redirectTo="/auth/login" user={loggedInUser}>
            <SavedRecipes />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}
