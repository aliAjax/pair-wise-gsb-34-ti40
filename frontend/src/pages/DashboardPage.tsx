import { StatCard } from "../components/common/StatCard";

export function DashboardPage() {
  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>消防合规总览</h1>
          <p className="muted">夜班交接闭环已上线：请前往「巡检任务」发起/确认交接，或在「消防设备台账」按设备交接。</p>
        </div>
      </section>
      <section className="metrics">
        <StatCard label="交接入口" value="任务页 / 设备页" />
        <StatCard label="交接状态" value="待确认 / 已接班 / 已撤回" />
        <StatCard label="留痕要求" value="操作人 · 时间 · 前后负责人" />
      </section>
    </main>
  );
}
