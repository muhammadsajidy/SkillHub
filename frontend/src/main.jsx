import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import AuthProvider from "./contexts/authProvider.jsx";
import { createTheme, ThemeProvider } from "@mui/material";
import "./index.css";
import App from "./App.jsx";

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, Poppins',
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);