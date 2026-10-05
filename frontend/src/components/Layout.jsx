import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIChatbot from "./AIChatbot";

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const content = document.querySelector(".content");
    if (content) content.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <main className="content">
          <section className="page active">
            <Outlet />
          </section>
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}
