import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import ReportIssue from "./components/ReportIssue";
import IssueList from "./components/IssueList";
import IssueDetail from "./components/IssueDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import AdminIssues from "./components/AdminIssues";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { path: "home", Component: Dashboard },
      { path: "report", Component: ReportIssue },
      { path: "issues", Component: IssueList },
      { path: "issues/:id", Component: IssueDetail },
      { path: "admin/issues", Component: AdminIssues },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);