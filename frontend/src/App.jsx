// src/App.jsx (or your routes file)
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Aup from "./pages/Aup";
import AupSign from "./pages/AupSign";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Learn from "./pages/employee/Learn";
import ContentShow from "./pages/employee/ContentShow";
import Quizzes from "./pages/employee/Quizzes";
import QuizShow from "./pages/employee/QuizShow";


import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import EmployeesManagement from "./pages/admin/EmployeesManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import ContentCreate from "./pages/admin/ContentCreate";
import ContentEdit from "./pages/admin/ContentEdit";
import QuizManage from "./pages/admin/QuizManage";
import QuizCreate from "./pages/admin/QuizCreate";
import QuizEdit from "./pages/admin/QuizEdit";
import PhishingSimulation from "./pages/admin/PhishingSimulation";
import AdminProfile from "./pages/admin/AdminProfile";


export default function App() {
  console.log("App component is rendering...");
  return (
    <Routes>
      {/* ...public routes... */}
      <Route path="/" element={<Home />} />
      <Route path="/aup" element={<Aup />} />
      <Route path="/aup/sign" element={<AupSign />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/employee/learn" element={<Learn />} />
      <Route path="/employee/learn/:id" element={<ContentShow />} />
      <Route path="/employee/quizzes" element={<Quizzes />} />
      <Route path="/employee/quizzes/:id" element={<QuizShow />} />

      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="employees" element={<EmployeesManagement />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="content/create" element={<ContentCreate />} />
        <Route path="content/:id/edit" element={<ContentEdit />} />
        <Route path="quizzes" element={<QuizManage />} />
        <Route path="quizzes/create" element={<QuizCreate />} />
        <Route path="quizzes/:id/edit" element={<QuizEdit />} />
        <Route path="phishing-simulation" element={<PhishingSimulation />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}
