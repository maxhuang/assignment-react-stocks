import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { isAuthenticated, getRedirectPath } from "../utils/AuthTools";

const apiUrl = "http://131.181.190.87:3000";

/**
 * Allows the user to register with email and password so they can use
 * the authorised endpoint.
 */
function Register() {
  const history = useHistory();

  const registerUrl = `${apiUrl}/user/register`;
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState(null);

  useEffect(() => {
    document.title = "Register - CloudStocks";
  }, [])

  useEffect(() => {
    if (isAuthenticated()) {
      history.push("/");
    }
  });

  if (isAuthenticated()) {
    return (
      <div></div>
    );
  }

  return (
    <div className="my-5">
      <div className="d-flex auth-presentor dialogue-border">
        <h4>Create your CloudStocks account</h4>

        <form
          id="register-form"
          className="my-4"
          onSubmit={(event) => {
            event.preventDefault();

            fetch(registerUrl, {
              method: "POST",
              headers: {
                accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: userEmail,
                password: userPassword
              })
            })
              .then((response) => response.json())
              .then((data) => {
                if (!data.error === true) {
                  setFormErrorMessage(null);

                  // LOG USER IN
                  console.log("Logs in user");
                  const redirectPath = getRedirectPath();
                  if (redirectPath) {
                    history.push(redirectPath);
                  } else {
                    history.push("/");
                  }

                } else {
                  setFormErrorMessage(data.message);
                }
              })
              .catch((error) => {
                console.error("A problem occured. Error: " + error);
              });
          }}
        >
          <div className="form-group">
            <label htmlFor="inputEmail">Email</label>
            <input
              id="inputEmail"
              type="email"
              className="form-control"
              value={userEmail}
              onChange={(event) => {
                const { value } = event.target;
                setUserEmail(value);
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputPassword">Password</label>
            <input id="inputPassword"
              type="password"
              className="form-control"
              value={userPassword}
              onChange={(event) => {
                const { value } = event.target;
                setUserPassword(value);
              }}
            />
          </div>

          {formErrorMessage != null &&
            <p className="small text-danger">
              {formErrorMessage}
            </p>
          }
        </form>
        <button type="submit" form="register-form" className="btn btn-primary btn-block mt-auto">Register</button>
      </div>
    </div>
  );
}

export default Register;
