import { INSPECTORS } from "../../constants/Inspectors";
import { useCurrentUserStore } from "../../stores/CurrentUserStore";

export function UserSwitcher() {
  const currentUserId = useCurrentUserStore((state) => state.currentUserId);
  const switchTo = useCurrentUserStore((state) => state.switchTo);
  return (
    <label className="user-switcher">
      <span className="muted">当前登录：</span>
      <select value={currentUserId} onChange={(event) => switchTo(Number(event.target.value))}>
        {INSPECTORS.map((inspector) => (
          <option key={inspector.id} value={inspector.id}>
            {inspector.name}（{inspector.shift} · {inspector.role}）
          </option>
        ))}
      </select>
    </label>
  );
}
