import type { FireDevice } from "../../types/FireDevice";

export function DeviceLocationCell({ device, buildingName }: { device: FireDevice; buildingName?: string }) {
  return (
    <div className="device-location">
      <strong>
        {buildingName ? `${buildingName} · ` : ""}
        {device.floor}
      </strong>
      <span className="muted">{device.location_desc}</span>
    </div>
  );
}
