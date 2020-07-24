import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import './App.css';

import AppNavbar from "./components/AppNavbar";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import Register from "./components/Register";
import StockAdvanced from "./components/StockAdvanced";
import StockBasic from "./components/StockBasic";

/**
 * "Root" component, or parent component, which contains
 * all other components of CloudStocks. It is in charge
 * of routing and passing props to the child components.
 */
function App() {
  // Required so navbar can tell components to fetch data
  // again after the user has logged out so stale data is
  // not displayed
  const [needsRefetch, setNeedsRefetch] = useState(false);

  return (
    <Router>
      <div>
        <AppNavbar
          needsRefetch={needsRefetch}
          setNeedsRefetch={setNeedsRefetch}
        />

        <div className="container">
          <Switch>
            <Route exact path="/">
              <StockBasic />
            </Route>

            <Route path="/login">
              <Login />
            </Route>

            <Route path="/register">
              <Register />
            </Route>

            <Route
              path="/stocks/:stockSymbol"
              render={(props) => {
                return (
                  <StockAdvanced
                    {...props}
                    needsRefetch={needsRefetch}
                    setNeedsRefetch={setNeedsRefetch}
                  />
                );
              }}
            />

            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
