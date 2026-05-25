import { useState } from "react";
import ManagerForgotPasswordPage from "./pages/ManagerForgotPasswordPage";
import ManagerLoginPage from "./pages/ManagerLoginPage";
import ManagerRegisterPage from "./pages/ManagerRegisterPage";
import UserMapPage from "./pages/UserMapPage";

type Page = "map" | "login" | "register" | "forgot";

function App() {
  const [page, setPage] = useState<Page>("map");

  if (page === "login") {
    return (
      <ManagerLoginPage
        onGoToMap={() => setPage("map")}
        onGoToRegister={() => setPage("register")}
        onGoToForgotPassword={() => setPage("forgot")}
      />
    );
  }

  if (page === "register") {
    return <ManagerRegisterPage onGoToLogin={() => setPage("login")} />;
  }

  if (page === "forgot") {
    return <ManagerForgotPasswordPage onGoToLogin={() => setPage("login")} />;
  }

  return <UserMapPage onGoToLogin={() => setPage("login")} />;
}

export default App;
