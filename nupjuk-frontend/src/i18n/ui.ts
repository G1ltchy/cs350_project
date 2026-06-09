import type { Language } from "../lib/language";

const ui = {
  ko: {
    languageToggle: { ko: "한국어", en: "English" },
    common: {
      success: "성공",
      failure: "실패",
      loading: "처리 중...",
      language: "언어"
    },
    map: {
      managerLogin: "관리자 로그인",
      managerLogout: "로그아웃",
      managerMode: "관리자 모드",
      mockWarning:
        "백엔드 데이터가 없거나 연결되지 않아 mock data로 표시 중입니다.",
      loadingMarkers: "마커를 불러오는 중입니다...",
      noResults: "검색 결과가 없습니다.",
      mapPlaceholder:
        "지도 영역 임시 버전입니다. 이후 Kakao Map 컴포넌트로 교체하면 됩니다.",
      searchPlaceholder: "장소 검색",
      noDescription: "표시할 설명이 없습니다.",
      parent: "상위 장소",
      childPlaces: "하위 장소",
      directions: "길찾기",
      diningInfo: "식당 정보",
      diningHint: "식단 정보는 외부 페이지에서 확인할 수 있습니다.",
      busInfo: "버스 정보",
      busHint: "버스 정보는 외부 페이지에서 확인할 수 있습니다.",
      eventInfo: "이벤트 정보",
      viewExternal: "관련 정보 보기",
      eventEnded: "이벤트가 종료되었습니다.",
      eventRemainingUnknown: "남은 시간을 계산할 수 없습니다.",
      eventRemainingHours: (hours: number, minutes: number) =>
        `${hours}시간 ${minutes}분 남음`,
      eventRemainingMinutes: (minutes: number) => `${minutes}분 남음`
    },
    categories: {
      all: "전체",
      building: "건물",
      facility: "체육시설",
      dining: "식당",
      bus: "버스",
      event: "이벤트",
      cafe: "카페",
      library: "도서관",
      etc: "기타"
    },
    markerManagement: {
      title: "Marker Management",
      description:
        "Select a marker to view or edit it. New marker can be created with 'Create New Marker' button.",
      searchPlaceholder: "Search Markers",
      createNew: "Create New Marker",
      columns: {
        title: "Marker Title",
        category: "Category",
        active: "Active?",
        mine: "Mine?"
      },
      filters: {
        all: "All",
        active: "Active",
        inactive: "Inactive",
        mine: "Mine",
        others: "Others"
      }
    },
    createMarker: {
      title: "Create Marker",
      markerTitle: "Marker Title",
      latLng: "Latitude / Longitude",
      latLngHint: "지도를 클릭하면 좌표가 자동으로 입력됩니다.",
      markdownContent: "Markdown Content",
      parentMarker: "Parent Marker (Optional)",
      parentHint:
        "If no parent marker is selected, this marker will be created as a root-level marker.",
      noParent: "None (root marker)",
      backgroundImage: "Background Image (Optional)",
      uploadImage: "Upload Image From Device",
      activeDuration: "Active Duration (Optional)",
      create: "Create",
      back: "Back",
      mapClickHint: "지도를 클릭해 위치를 선택하세요"
    },
    editMarker: {
      title: "Edit Marker",
      uploadNewImage: "Upload New Image From Device",
      submit: "Submit",
      back: "Back"
    },
    viewMarker: {
      title: "View Marker",
      coordinate: "Coordinate",
      noContent: "표시할 내용이 없습니다.",
      noImage: "No image uploaded",
      noDuration: "Not set",
      editMarker: "Edit Marker",
      deleteMarker: "Delete Marker",
      deleteConfirm: "이 마커를 삭제하시겠습니까?",
      deleteFailed: "마커 삭제에 실패했습니다.",
      imageAlt: "마커 배경 이미지"
    },
    manager: {
      appTitle: "Nupjuk Guide",
      managerLogin: "관리자 로그인",
      managerRegister: "관리자 회원가입",
      forgotPassword: "비밀번호 찾기",
      loginTitle: "관리자 로그인",
      registerTitle: "관리자 등록 요청",
      forgotTitle: "비밀번호 찾기",
      registrationFormTitle: "Manager\nRegistration Form",
      managerId: "관리자 ID",
      managerPassword: "비밀번호",
      kaistEmail: "KAIST 이메일",
      kaistEmailPlaceholder: "example@kaist.ac.kr",
      password: "비밀번호",
      confirmPassword: "비밀번호 확인",
      passwordPlaceholder: "비밀번호를 입력하세요",
      name: "이름",
      email: "이메일",
      titleKo: "Title (Korean)",
      titleKoPlaceholder: "마커 제목",
      titleEn: "Title (English)",
      titleEnPlaceholder: "Optional",
      category: "Category",
      latitude: "Latitude",
      longitude: "Longitude",
      messageKo: "Manager Request Message (Korean)",
      messageEn: "Manager Request Message (English)",
      messagePlaceholder: "SoC Student Council ...",
      messageOptional: "요청 메시지",
      messageOptionalPlaceholder:
        "관리자 권한 요청 사유를 입력하세요. 선택 사항입니다.",
      imageOptional: "Image (optional)",
      imageHint: "jpeg, png, webp, gif · 최대 5MB",
      removeImage: "이미지 제거",
      imagePreviewAlt: "업로드 미리보기",
      back: "Back",
      login: "로그인",
      register: "등록 요청",
      sendResetEmail: "임시 비밀번호 요청",
      forgotPasswordLink: "비밀번호 찾기",
      sendRequest: "Send Request",
      sending: "Sending...",
      uploading: "업로드 중...",
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
        loginSuccess: "로그인에 성공했습니다. 토큰이 저장되었습니다.",
        registerFields: "필수 항목을 모두 입력하세요.",
        registerPassword: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        registerEmail: "KAIST 이메일 형식을 확인하세요.",
        registerFailed: "관리자 등록 요청에 실패했습니다.",
        forgotFields: "관리자 ID와 KAIST 이메일을 입력하세요.",
        forgotFailed: "비밀번호 찾기 요청에 실패했습니다.",
        titleKoRequired: "제목(한국어)을 입력해 주세요.",
        markdownKoRequired: "내용(한국어)을 입력해 주세요.",
        latLngRequired: "위도와 경도를 입력해 주세요.",
        latLngInvalid: "위도·경도는 숫자로 입력해 주세요.",
        imageTooLarge: "이미지는 5MB 이하만 업로드할 수 있습니다.",
        markerCreateFailed: "마커 생성에 실패했습니다.",
        markerUpdateFailed: "마커 수정에 실패했습니다.",
        authRequired:
          "로그인이 필요합니다. Manager Login 후 다시 시도해 주세요.",
        markerCreated: (title: string, withImage: boolean) =>
          `마커가 생성되었습니다: ${title}${withImage ? " (이미지 포함)" : ""}`,
        markerUpdated: (title: string) => `마커가 수정되었습니다: ${title}`
      }
    }
  },
  en: {
    languageToggle: { ko: "한국어", en: "English" },
    common: {
      success: "Success",
      failure: "Failure",
      loading: "Loading...",
      language: "Language"
    },
    map: {
      managerLogin: "Manager Login",
      managerLogout: "Logout",
      managerMode: "Manager Mode",
      mockWarning:
        "Showing mock data because the backend is unavailable or returned no markers.",
      loadingMarkers: "Loading markers...",
      noResults: "No results found.",
      mapPlaceholder:
        "Temporary map area. This will be replaced with the Kakao Map component.",
      searchPlaceholder: "Search markers",
      noDescription: "No description available.",
      parent: "Parent",
      childPlaces: "Sub-locations",
      directions: "Directions",
      diningInfo: "Dining",
      diningHint: "Menu information is available on an external page.",
      busInfo: "Bus",
      busHint: "Bus information is available on an external page.",
      eventInfo: "Event",
      viewExternal: "View details",
      eventEnded: "This event has ended.",
      eventRemainingUnknown: "Unable to calculate remaining time.",
      eventRemainingHours: (hours: number, minutes: number) =>
        `${hours}h ${minutes}m remaining`,
      eventRemainingMinutes: (minutes: number) => `${minutes}m remaining`
    },
    categories: {
      all: "All",
      building: "Building",
      facility: "Sports facility",
      dining: "Dining",
      bus: "Bus",
      event: "Event",
      cafe: "Cafe",
      library: "Library",
      etc: "Other"
    },
    markerManagement: {
      title: "Marker Management",
      description:
        "Select a marker to view or edit it. New marker can be created with 'Create New Marker' button.",
      searchPlaceholder: "Search Markers",
      createNew: "Create New Marker",
      columns: {
        title: "Marker Title",
        category: "Category",
        active: "Active?",
        mine: "Mine?"
      },
      filters: {
        all: "All",
        active: "Active",
        inactive: "Inactive",
        mine: "Mine",
        others: "Others"
      }
    },
    createMarker: {
      title: "Create Marker",
      markerTitle: "Marker Title",
      latLng: "Latitude / Longitude",
      latLngHint: "Click on the map to auto-fill coordinates.",
      markdownContent: "Markdown Content",
      parentMarker: "Parent Marker (Optional)",
      parentHint:
        "If no parent marker is selected, this marker will be created as a root-level marker.",
      noParent: "None (root marker)",
      backgroundImage: "Background Image (Optional)",
      uploadImage: "Upload Image From Device",
      activeDuration: "Active Duration (Optional)",
      create: "Create",
      back: "Back",
      mapClickHint: "Click on the map to set location"
    },
    editMarker: {
      title: "Edit Marker",
      uploadNewImage: "Upload New Image From Device",
      submit: "Submit",
      back: "Back"
    },
    viewMarker: {
      title: "View Marker",
      coordinate: "Coordinate",
      noContent: "No content available.",
      noImage: "No image uploaded",
      noDuration: "Not set",
      editMarker: "Edit Marker",
      deleteMarker: "Delete Marker",
      deleteConfirm: "Are you sure you want to delete this marker?",
      deleteFailed: "Failed to delete marker.",
      imageAlt: "Marker background image"
    },
    manager: {
      appTitle: "Nupjuk Guide",
      managerLogin: "Manager Login",
      managerRegister: "Manager Register",
      forgotPassword: "Forgot Password",
      loginTitle: "Manager Login",
      registerTitle: "Manager Registration Request",
      forgotTitle: "Forgot Password",
      registrationFormTitle: "Manager\nRegistration Form",
      managerId: "Manager ID",
      managerPassword: "Password",
      kaistEmail: "KAIST Email",
      kaistEmailPlaceholder: "example@kaist.ac.kr",
      password: "Password",
      confirmPassword: "Confirm Password",
      passwordPlaceholder: "Enter your password",
      name: "Name",
      email: "Email",
      titleKo: "Title (Korean)",
      titleKoPlaceholder: "Marker title",
      titleEn: "Title (English)",
      titleEnPlaceholder: "Optional",
      category: "Category",
      latitude: "Latitude",
      longitude: "Longitude",
      messageKo: "Manager Request Message (Korean)",
      messageEn: "Manager Request Message (English)",
      messagePlaceholder: "SoC Student Council ...",
      messageOptional: "Request Message",
      messageOptionalPlaceholder:
        "Enter the reason for requesting manager permission. Optional.",
      imageOptional: "Image (optional)",
      imageHint: "jpeg, png, webp, gif · max 5MB",
      removeImage: "Remove image",
      imagePreviewAlt: "Upload preview",
      back: "Back",
      login: "Login",
      register: "Request Registration",
      sendResetEmail: "Request Temporary Password",
      forgotPasswordLink: "Forgot Password",
      sendRequest: "Send Request",
      sending: "Sending...",
      uploading: "Uploading...",
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
        loginSuccess: "Signed in successfully. Token saved.",
        registerFields: "Please fill in all required fields.",
        registerPassword: "Password and confirmation do not match.",
        registerEmail: "Please check the KAIST email format.",
        registerFailed: "Manager registration request failed.",
        forgotFields: "Please enter both manager ID and KAIST email.",
        forgotFailed: "Password recovery request failed.",
        titleKoRequired: "Please enter a Korean title.",
        markdownKoRequired: "Please enter Korean content.",
        latLngRequired: "Please enter latitude and longitude.",
        latLngInvalid: "Latitude and longitude must be numbers.",
        imageTooLarge: "Images must be 5MB or smaller.",
        markerCreateFailed: "Failed to create marker.",
        markerUpdateFailed: "Failed to update marker.",
        authRequired: "Sign in via Manager Login and try again.",
        markerCreated: (title: string, withImage: boolean) =>
          `Marker created: ${title}${withImage ? " (with image)" : ""}`,
        markerUpdated: (title: string) => `Marker updated: ${title}`
      }
    }
  }
} as const;

export type UiStrings = (typeof ui)[Language];

export function getUi(language: Language): UiStrings {
  return ui[language];
}
