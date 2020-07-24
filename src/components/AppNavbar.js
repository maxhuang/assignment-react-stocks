import React from "react";
import { NavLink, useHistory, useLocation } from "react-router-dom";

import {
  getAuthUserEmail,
  deleteAuthUserEmail,
  deleteAuthToken,
  isAuthenticated
} from "../utils/AuthTools";

/**
 * Displays a navbar with the site name and logo. Login, logout and
 * register buttons are also displayed depending on whether the user
 * authentication status.
 */
function AppNavbar(props) {
  const history = useHistory();
  const location = useLocation();

  const { setNeedsRefetch } = props;

  function LoginButton() {
    return (
      <button
        id="loginButton"
        type="button"
        className="btn btn-secondary mr-2"
        onClick={() => {
          history.push(`/login?redirect=${location.pathname}`);
        }}
      >
        Log in
      </button>
    );
  }

  function LogoutButton() {
    return (
      <button
        id="logoutButton"
        type="button"
        className="btn btn-primary"
        onClick={() => {
          deleteAuthToken();
          deleteAuthUserEmail();
          setNeedsRefetch(true);
          history.replace(location.pathname);
        }}
      >
        Log out
      </button>
    );
  }

  function RegisterButton() {
    return (
      <button
        id="registerButton"
        type="button"
        className="btn btn-primary"
        onClick={() => {
          history.push(`/register?redirect=${location.pathname}`);
        }}
      >
        Register
      </button>
    );
  }

  return (
    <nav className="d-flex navbar navbar-light bg-light">
      <NavLink
        to="/"
        className="navbar-brand"
      >
        <img
          src="/favicon.png"
          width="30px"
          height="30px"
          className="d-inline-block align-top mr-2"
          alt="CloudStocks Logo"
        />
        CloudStocks
      </NavLink>
      <div className="justify-content-end">
        {!isAuthenticated() ?
          <div>
            <LoginButton />
            <RegisterButton />
          </div>
          :
          <div>
            <span className="mr-4">Welcome {getAuthUserEmail()}</span>
            <LogoutButton />
          </div>
        }
      </div>
    </nav>
  );
}

export default AppNavbar;
