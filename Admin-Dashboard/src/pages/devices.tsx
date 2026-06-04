import React from "react";
import DevicesView from "../components/DevicesView";
import { Device as TypeDevice } from "../types";

interface DevicesProps {
  loading: boolean;
  devices: TypeDevice[];
  onDeleteDevice: (deviceId: string) => Promise<boolean>;
  onCreateDevice: (name: string) => Promise<boolean>;
}

export default function Devices({ loading, devices, onDeleteDevice, onCreateDevice }: DevicesProps) {
  return (
    <DevicesView
      loading={loading}
      devices={devices}
      onDeleteDevice={onDeleteDevice}
      onCreateDevice={onCreateDevice}
    />
  );
}
