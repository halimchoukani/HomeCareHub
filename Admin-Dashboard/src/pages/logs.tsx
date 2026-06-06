import React from "react";
import LogsView from "../components/LogsView";

interface LogsProps {
  loading: boolean;
  auditLogs: any[];
}

export default function Logs({ loading, auditLogs }: LogsProps) {
  return (
    <LogsView
      loading={loading}
      auditLogs={auditLogs}
    />
  );
}
