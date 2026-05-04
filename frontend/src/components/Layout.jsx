import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--app-bg)" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
        <Outlet />
      </main>
    </div>
  );
}
