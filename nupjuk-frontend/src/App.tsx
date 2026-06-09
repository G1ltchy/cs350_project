import { useEffect, useState } from "react";
import PhoneFrame from "./components/PhoneFrame";
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

  const usePhoneLayout =
    page === "login" ||
    page === "register" ||
    page === "forgot" ||
    (page === "map" && !isAuthenticated);

  useEffect(() => {
    const root = document.getElementById("root");

    if (!root) {
      return;
    }

    root.classList.toggle("phone-layout", usePhoneLayout);
    root.classList.toggle("desktop-layout", !usePhoneLayout);
  }, [usePhoneLayout]);

  if (page === "login") {
    return (
      <PhoneFrame variant="auth">
        <ManagerLoginPage
          onGoToMap={() => setPage("map")}
          onGoToRegister={() => setPage("register")}
          onGoToForgotPassword={() => setPage("forgot")}
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setPage("map");
          }}
        />
      </PhoneFrame>
    );
  }

  if (page === "register") {
    return (
      <PhoneFrame variant="auth">
        <ManagerRegisterPage onGoToLogin={() => setPage("login")} />
      </PhoneFrame>
    );
  }

  if (page === "forgot") {
    return (
      <PhoneFrame variant="auth">
        <ManagerForgotPasswordPage onGoToLogin={() => setPage("login")} />
      </PhoneFrame>
    );
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
