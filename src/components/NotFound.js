import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

/**
 * Redirect back to the home page
 */
function NotFound() {
  const history = useHistory();

  useEffect(() => {
    history.push("/");
  });

  return (
    <div></div>
  );
}

export default NotFound;
