import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Result } from "./pages/Result";
import { Correction } from "./pages/Correction";
import { Dashboard } from "./pages/Dashboard";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "result", Component: Result },
      { path: "correction", Component: Correction },
      { path: "dashboard", Component: Dashboard },
    ],
  },
]);
