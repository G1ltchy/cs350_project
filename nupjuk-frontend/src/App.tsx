import { useState } from "react";
import ManagerForgotPasswordPage from "./pages/ManagerForgotPasswordPage";
import ManagerLoginPage from "./pages/ManagerLoginPage";
import ManagerRegisterPage from "./pages/ManagerRegisterPage";
import UserMapPage from "./pages/UserMapPage";
import { clearAuthToken } from "./lib/authToken";

type Page = "map" | "login" | "register" | "forgot";

function App() {
  const [page, setPage] = useState<Page>("map");
  // TODO: 임시 — 배포 전 hasAuthToken()으로 되돌리기
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (page === "login") {
    return (
      <ManagerLoginPage
        onGoToMap={() => setPage("map")}
        onGoToRegister={() => setPage("register")}
        onGoToForgotPassword={() => setPage("forgot")}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setPage("map");
        }}
      />
    );
  }

  if (page === "register") {
    return <ManagerRegisterPage onGoToLogin={() => setPage("login")} />;
  }

  if (page === "forgot") {
    return <ManagerForgotPasswordPage onGoToLogin={() => setPage("login")} />;
  }

  return (
    <UserMapPage
      isAuthenticated={isAuthenticated}
      onGoToLogin={() => setPage("login")}
      onLogout={() => {
        clearAuthToken();
        setIsAuthenticated(false);
      }}
    />
  );
}

export default App;