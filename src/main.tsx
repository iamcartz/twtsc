import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "../src/styles/base.css";
import "../src/styles/layout.css";
import "../src/styles/header.css";
import "../src/styles/components.css";
import "../src/styles/footer.css";
import "../src/styles/responsive.css";
import "../src/styles/home.css";
import "../src/styles/services.css";
import "../src/styles/dropdown.css";
import "../src/styles/mega.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
