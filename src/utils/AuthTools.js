import jwt from "jsonwebtoken";

/**
 * Returns the JWT required to authenticate with the api
 */
function getAuthToken() {
  return localStorage.getItem("authToken");
}

/**
 * Save the provided JWT token, which is encoded as a JSON
 * object, to localstorage
 * @param {Object} token
 */
function setAuthToken(token) {
  localStorage.setItem("authToken", token);
}

/**
 * Delete the stored JWT token
 */
function deleteAuthToken() {
  localStorage.removeItem("authToken");
}

/**
 * Returns the authorised user's email
 */
function getAuthUserEmail() {
  return localStorage.getItem("authUserEmail");
}

/**
 * Save the provided email to localstorage
 * @param {Object} email
 */
function setAuthUserEmail(email) {
  return localStorage.setItem("authUserEmail", email);
}

/**
 * Delete the stored authorised user's email
 */
function deleteAuthUserEmail() {
  localStorage.removeItem("authUserEmail");
}

/**
 * Returns a boolean indicating if an unexpired token is
 * available to authenticate with the api
 */
function isAuthenticated() {
  const authTokenData = jwt.decode(getAuthToken());

  if (authTokenData != null) {
    return authTokenData.exp * 1000 > Date.now();
  } else {
    return false;
  }
}

/**
 * Returns the value of "redirect" in the url query
 * parameters. If no such parameter exists, null is
 * returned.
 */
function getRedirectPath() {
  const urlParams = new URL(window.location.href).search;
  const redirectPath = new URLSearchParams(urlParams).get("redirect");
  return redirectPath;
}

export {
  getAuthToken,
  setAuthToken,
  deleteAuthToken,
  getAuthUserEmail,
  setAuthUserEmail,
  deleteAuthUserEmail,
  isAuthenticated,
  getRedirectPath
};
