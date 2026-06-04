import React from "react";
import LogsView from "../components/LogsView";

interface LogsProps {
  loading: boolean;
  messageHistory: any[];
}

export default function Logs({ loading, messageHistory }: LogsProps) {
  return (
    <LogsView
      loading={loading}
      messageHistory={messageHistory}
    />
  );
}
