import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Chatbot from "../chatbot/Chatbot";
import { useAuthStore } from "../../context/authStore";

export default function MainLayout() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {user && <Chatbot />}
    </div>
  );
}
