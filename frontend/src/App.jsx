import { Routes, Route } from "react-router";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Skills from "./pages/Skills";
import Assessments from "./pages/Assessments";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}/>
      <Route path="/signup" element={<Signup />}/>
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/employees" element={<Layout><Employees /></Layout>} />
        <Route path="/departments" element={<Layout><Departments /></Layout>} />
        <Route path="/skills" element={<Layout><Skills /></Layout>} />
        <Route path="/assessments" element={<Layout><Assessments /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
      </Route>
    </Routes>
  );
};