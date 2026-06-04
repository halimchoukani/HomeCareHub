import React from "react";
import UsersView from "../components/UsersView";
import { User as TypeUser } from "../types";

interface UsersProps {
  loading: boolean;
  users: TypeUser[];
  onDeleteUser: (userId: string) => Promise<boolean>;
  onSendMessage: (userId: string, content: string) => Promise<boolean>;
}

export default function Users({ loading, users, onDeleteUser, onSendMessage }: UsersProps) {

  return (
    <UsersView
      loading={loading}
      users={users}
      onDeleteUser={onDeleteUser}
      onSendMessage={onSendMessage}
    />
  );
}
