// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import DebugBoundary from "./DebugBoundary.jsx";

console.log("Main.jsx is loading...");

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <DebugBoundary>
      <App />
    </DebugBoundary>
  </BrowserRouter>
);
