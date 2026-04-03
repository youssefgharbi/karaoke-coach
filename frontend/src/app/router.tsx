import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import { RequireAuth } from "../features/auth/RequireAuth";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { KaraokeSessionPage } from "../features/karaoke/pages/KaraokeSessionPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { SongEditorPage } from "../features/songs/pages/SongEditorPage";
import { SongsPage } from "../features/songs/pages/SongsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "songs", element: <SongsPage /> },
          { path: "songs/new", element: <SongEditorPage /> },
          { path: "songs/:songId", element: <SongEditorPage /> },
          { path: "practice/:songId", element: <KaraokeSessionPage /> },
        ],
      },
    ],
  },
]);
