// App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import { AppThemeProvider } from "./providers/ThemeProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { AppQueryProvider } from "./providers/QueryProvider";
import { SnackbarProvider } from './providers/SnackbarProvider';
export default function App() {
  return (
    <AppQueryProvider>
      <SnackbarProvider>
        <AppThemeProvider>
          <SidebarProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </SidebarProvider>
        </AppThemeProvider>
      </SnackbarProvider>
    </AppQueryProvider>
  );
}
