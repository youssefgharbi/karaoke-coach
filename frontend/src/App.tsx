import { Outlet } from "react-router-dom";

import { AppShell } from "./app/layout/AppShell";

export default function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
