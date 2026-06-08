export type Language = "ko" | "en";

export type UiText = {
  common: {
    success: string;
    failure: string;
    loading: string;
    language: string;
  };
  manager: {
    appTitle: string;

    managerLogin: string;
    managerRegister: string;
    forgotPassword: string;

    loginTitle: string;
    registerTitle: string;
    forgotTitle: string;

    managerId: string;
    managerPassword: string;
    password: string;
    confirmPassword: string;
    passwordPlaceholder: string;

    kaistEmail: string;
    kaistEmailPlaceholder: string;

    name: string;
    email: string;

    messageOptional: string;
    messageOptionalPlaceholder: string;

    login: string;
    register: string;
    sendResetEmail: string;

    loggingIn: string;
    requesting: string;

    backToMap: string;
    backToLogin: string;
    goToRegister: string;
    goToForgotPassword: string;

    logout: string;
    received: string;

    forgotTempPasswordStatus: string;
    forgotTempPasswordAssignedYes: string;

    errors: {
      loginFields: string;
      loginFailed: string;

      registerFields: string;
      registerPassword: string;
      registerEmail: string;
      registerFailed: string;

      forgotFields: string;
      forgotFailed: string;
    };
  };
};

const ui: Record<Language, UiText> = {
  ko: {
    common: {
      success: "성공",
      failure: "실패",
      loading: "처리 중...",
      language: "언어"
    },
    manager: {
      appTitle: "Nupjuk Guide",

      managerLogin: "관리자 로그인",
      managerRegister: "관리자 회원가입",
      forgotPassword: "비밀번호 찾기",

      loginTitle: "관리자 로그인",
      registerTitle: "관리자 등록 요청",
      forgotTitle: "비밀번호 찾기",

      managerId: "관리자 ID",
      managerPassword: "비밀번호",
      password: "비밀번호",
      confirmPassword: "비밀번호 확인",
      passwordPlaceholder: "비밀번호를 입력하세요",

      kaistEmail: "KAIST 이메일",
      kaistEmailPlaceholder: "example@kaist.ac.kr",

      name: "이름",
      email: "이메일",

      messageOptional: "요청 메시지",
      messageOptionalPlaceholder: "관리자 권한 요청 사유를 입력하세요. 선택 사항입니다.",

      login: "로그인",
      register: "등록 요청",
      sendResetEmail: "임시 비밀번호 요청",

      loggingIn: "로그인 중...",
      requesting: "요청 중...",

      backToMap: "지도로 돌아가기",
      backToLogin: "로그인으로 돌아가기",
      goToRegister: "관리자 등록 요청",
      goToForgotPassword: "비밀번호 찾기",

      logout: "로그아웃",
      received: "요청 완료",

      forgotTempPasswordStatus: "임시 비밀번호 발급",
      forgotTempPasswordAssignedYes: "완료",

      errors: {
        loginFields: "관리자 ID와 비밀번호를 입력하세요.",
        loginFailed: "로그인에 실패했습니다.",

        registerFields: "필수 항목을 모두 입력하세요.",
        registerPassword: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        registerEmail: "KAIST 이메일 형식을 확인하세요.",
        registerFailed: "관리자 등록 요청에 실패했습니다.",

        forgotFields: "관리자 ID와 KAIST 이메일을 입력하세요.",
        forgotFailed: "비밀번호 찾기 요청에 실패했습니다."
      }
    }
  },

  en: {
    common: {
      success: "Success",
      failure: "Failure",
      loading: "Loading...",
      language: "Language"
    },
    manager: {
      appTitle: "Nupjuk Guide",

      managerLogin: "Manager Login",
      managerRegister: "Manager Register",
      forgotPassword: "Forgot Password",

      loginTitle: "Manager Login",
      registerTitle: "Manager Registration Request",
      forgotTitle: "Forgot Password",

      managerId: "Manager ID",
      managerPassword: "Password",
      password: "Password",
      confirmPassword: "Confirm Password",
      passwordPlaceholder: "Enter your password",

      kaistEmail: "KAIST Email",
      kaistEmailPlaceholder: "example@kaist.ac.kr",

      name: "Name",
      email: "Email",

      messageOptional: "Request Message",
      messageOptionalPlaceholder:
        "Enter the reason for requesting manager permission. Optional.",

      login: "Login",
      register: "Request Registration",
      sendResetEmail: "Request Temporary Password",

      loggingIn: "Logging in...",
      requesting: "Requesting...",

      backToMap: "Back to Map",
      backToLogin: "Back to Login",
      goToRegister: "Request Manager Registration",
      goToForgotPassword: "Forgot Password",

      logout: "Logout",
      received: "Request received",

      forgotTempPasswordStatus: "Temporary password",
      forgotTempPasswordAssignedYes: "Assigned",

      errors: {
        loginFields: "Please enter both manager ID and password.",
        loginFailed: "Login failed.",

        registerFields: "Please fill in all required fields.",
        registerPassword: "Password and confirmation do not match.",
        registerEmail: "Please check the KAIST email format.",
        registerFailed: "Manager registration request failed.",

        forgotFields: "Please enter both manager ID and KAIST email.",
        forgotFailed: "Password recovery request failed."
      }
    }
  }
};

export function getUi(language: Language): UiText {
  return ui[language];
}