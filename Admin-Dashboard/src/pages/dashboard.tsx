import React from "react";
import DashboardView from "../components/DashboardView";
import { DashboardPayload } from "../types";

interface DashboardProps {
  loading: boolean;
  data: DashboardPayload | null;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ loading, data, onNavigateToTab }: DashboardProps) {
  return (
    <DashboardView 
      loading={loading} 
      data={data} 
      onNavigateToTab={onNavigateToTab} 
    />
  );
}
