import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { listInspector, getCurrentUserId, setCurrentUserId } from "./api/Inspector";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { TasksPage } from "./pages/TasksPage";
import { HazardsPage } from "./pages/HazardsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { shiftText } from "./utils/formatters";
import type { Inspector } from "./types/Inspector";
import "./styles.css";

const pageMap: Record<string, () => JSX.Element> = {
  "/dashboard": DashboardPage,
  "/devices": DevicesPage,
  "/tasks": TasksPage,
  "/hazards": HazardsPage,
  "/reports": ReportsPage
};

function IdentitySwitcher() {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  useEffect(() => {
    void listInspector().then(setInspectors);
  }, []);
  return (
    <div className="identity-box">
      <span className="muted small">演示身份（x-user-id）</span>
      <select
        value={getCurrentUserId()}
        onChange={(event) => {
          setCurrentUserId(Number(event.target.value));
          window.location.reload();
        }}
      >
        {inspectors.map((row) => (
          <option key={row.id} value={row.id}>{row.name} · {shiftText(row.shift)}</option>
        ))}
      </select>
    </div>
  );
}

function App() {
  const [active, setActive] = useState<string>(routes[2]?.route ?? "/tasks");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const PageView = pageMap[current.route] ?? TasksPage;
  return (
    <div className="shell">
      <aside>
        <div className="brand">消防设施巡检维保平台</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => setActive(route.route)}
            >
              {route.name}
              {route.route === "/tasks" && <em className="nav-tip">交接闭环</em>}
            </button>
          ))}
        </nav>
        <IdentitySwitcher />
      </aside>
      <div className="content">
        <PageView />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
