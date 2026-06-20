import { Routes, Route } from "react-router-dom";
import PublicSite from "./components/PublicSite.jsx";
import AdminApp from "./admin/AdminApp.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}
