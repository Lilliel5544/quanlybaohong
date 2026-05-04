import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import QRScanner from "./components/QRScanner";
import ReportIssue from "./components/ReportIssue";
import IssueList from "./components/IssueList";
import IssueDetail from "./components/IssueDetail";
import Notifications from "./components/Notifications";
import Login from "./components/Login";
import Profile from "./components/Profile";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "scan", Component: QRScanner },
      { path: "report", Component: ReportIssue },
      { path: "issues", Component: IssueList },
      { path: "issues/:id", Component: IssueDetail },
      { path: "notifications", Component: Notifications },
      { path: "login", Component: Login },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);