import { useMemo, useState, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { mockData } from "./mocks/seedData";
import { StatusBadge } from "./components/common/StatusBadge";
import { StatCard } from "./components/common/StatCard";
import { TasksPage } from "./pages/TasksPage";
import { DevicesPage } from "./pages/DevicesPage";
import "./styles.css";

function OverviewPage({ name }: { name: string }) {
  const entities = Object.entries(mockData);
  const total = useMemo(() => entities.reduce((sum, [, rows]) => sum + rows.length, 0), [entities]);
  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>{name}</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <section className="metrics">
        <StatCard label="核心模型" value={entities.length} />
        <StatCard label="本地记录" value={total} />
        <StatCard label="交接单" value={mockData.taskHandover.length} />
      </section>
      <section className="workbench">
        <div className="panel wide">
          <h2>业务数据</h2>
          <div className="table">
            {entities.map(([key, rows]) => (
              <article key={key} className="row">
                <strong>{key}</strong>
                <span>{rows.length} 条</span>
                <StatusBadge value={String(Object.values(rows[0] ?? {})[1] ?? "READY")} />
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>交接班闭环</h2>
          <p>
            在「巡检任务」或「消防设备台账」页勾选未完成的设备检查项，填写现场说明和预计到场时间发起交接；接班人确认后任务负责人转移，确认前交班人可撤回。
          </p>
        </div>
      </section>
    </>
  );
}

const pageComponents: Record<string, ComponentType> = {
  "/tasks": TasksPage,
  "/devices": DevicesPage
};

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/dashboard");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const PageComponent = pageComponents[active] ?? (() => <OverviewPage name={current?.name ?? "工作台"} />);
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
            </button>
          ))}
        </nav>
      </aside>
      <main className="page">
        <PageComponent />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
