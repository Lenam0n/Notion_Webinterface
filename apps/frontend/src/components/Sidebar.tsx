import { Link, useLocation } from "react-router-dom";

const styles = {
  sidebar: {
    width: "220px",
    borderRight: "1px solid #ddd",
    padding: "1rem",
    height: "100vh",
    boxSizing: "border-box" as const,
  },
  link: (active: boolean) => ({
    display: "block",
    marginBottom: "0.5rem",
    textDecoration: "none",
    color: active ? "#0056b3" : "#007bff",
    fontWeight: active ? 700 : 400,
  }),
};

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside style={styles.sidebar}>
      <h3>Menü</h3>
      <Link style={styles.link(pathname === "/")} to="/">
        Neue Firma
      </Link>
      <Link style={styles.link(pathname === "/all")} to="/all">
        Alle Firmen
      </Link>
    </aside>
  );
}
