import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Marker } from "../models/Marker";
import { Manager } from "../models/Manager";
import { connectDB } from "../config/db";

// ──────────────────────────────────────────────
// Parent buildings (category: "building")
// ──────────────────────────────────────────────
const PARENTS = [
  // ── 북측 ──
  {
    key: "N1",
    titleKo: "교양분관 (N1)",
    titleEn: "Liberal Arts Building (N1)",
    latitude: 36.37400,
    longitude: 127.35950,
    markdownKo:
      "인문사회과학부 및 교양 강의실이 위치한 건물입니다.\n\n- 지하 1층 ~ 지상 4층\n- 교양 강의실, 세미나실",
  },
  {
    key: "N2",
    titleKo: "태울관 (N2)",
    titleEn: "Taeul Hall (N2)",
    latitude: 36.37350,
    longitude: 127.36020,
    markdownKo: "학부 강의 및 학생 편의시설이 있는 건물입니다.",
  },
  {
    key: "N3",
    titleKo: "체육관 (N3)",
    titleEn: "Gymnasium (N3)",
    latitude: 36.37500,
    longitude: 127.36100,
    markdownKo:
      "실내 체육관, 수영장, 헬스장이 있습니다.\n\n- 운영: 06:00~22:00\n- 주말: 09:00~18:00",
  },
  {
    key: "N4",
    titleKo: "인문사회과학동 (N4)",
    titleEn: "Humanities & Social Sciences (N4)",
    latitude: 36.37380,
    longitude: 127.35850,
    markdownKo: "인문사회과학부 연구실 및 강의실이 위치합니다.",
  },
  {
    key: "N7",
    titleKo: "기계공학동 (N7)",
    titleEn: "Mechanical Engineering (N7)",
    latitude: 36.37300,
    longitude: 127.36250,
    markdownKo: "기계공학과 연구실 및 강의실이 위치합니다.\n\n- 로봇 연구소\n- 3D 프린팅 랩",
  },
  {
    key: "N12",
    titleKo: "융합경영대학 (N12)",
    titleEn: "College of Business (N12)",
    latitude: 36.37250,
    longitude: 127.36000,
    markdownKo: "KAIST 경영대학원 및 MBA 프로그램이 위치합니다.",
  },
  {
    key: "N13",
    titleKo: "카이마루 (N13)",
    titleEn: "Kaimaru (N13)",
    latitude: 36.37260,
    longitude: 127.36220,
    markdownKo:
      "국제 식당동이 모여있는 건물입니다.\n\n- 1층: 식당가, ATM\n- 2층: 카페, 편의시설",
  },
  {
    key: "N22",
    titleKo: "국가생명연구자원정보센터 (N22)",
    titleEn: "KOBIC (N22)",
    latitude: 36.37550,
    longitude: 127.36450,
    markdownKo: "국가 생명연구자원정보 허브 센터입니다.",
  },
  {
    key: "N24",
    titleKo: "대전본원연구단지정문 (N24)",
    titleEn: "KAIST Main Gate (N24)",
    latitude: 36.37460,
    longitude: 127.36480,
    markdownKo: "KAIST 대전캠퍼스 정문입니다.",
  },

  // ── 동측 ──
  {
    key: "E2",
    titleKo: "자연과학동 (E2)",
    titleEn: "Natural Science Building (E2)",
    latitude: 36.36960,
    longitude: 127.36400,
    markdownKo: "물리학과, 화학과 연구실 및 강의실이 위치합니다.",
  },
  {
    key: "E3",
    titleKo: "전산학동 (E3-1)",
    titleEn: "Computer Science Building (E3-1)",
    latitude: 36.36900,
    longitude: 127.36270,
    markdownKo:
      "전산학부 연구실 및 강의실이 위치합니다.\n\n- 알고리즘 랩\n- AI 연구실\n- 시스템 연구실",
  },
  {
    key: "E6",
    titleKo: "자연과학동 (E6)",
    titleEn: "Natural Science Building (E6)",
    latitude: 36.36970,
    longitude: 127.36630,
    markdownKo: "수리과학과, 생명과학과 등이 위치한 건물입니다.",
  },
  {
    key: "E9",
    titleKo: "학술문화관 (E9)",
    titleEn: "Academic Cultural Complex (E9)",
    latitude: 36.37010,
    longitude: 127.36360,
    markdownKo: "도서관, 열람실, 세미나실이 있는 학술문화관입니다.",
  },
  {
    key: "E11",
    titleKo: "창의학습관 (E11)",
    titleEn: "Creative Learning Building (E11)",
    latitude: 36.37050,
    longitude: 127.36550,
    markdownKo: "강의실 및 세미나실이 위치합니다.\n\n- 대형 강의실\n- 멀티미디어실",
  },
  {
    key: "E15",
    titleKo: "정보전자공학동 (E15)",
    titleEn: "Electrical Engineering (E15)",
    latitude: 36.36880,
    longitude: 127.36500,
    markdownKo: "전기전자공학부 연구실 및 강의실이 위치합니다.",
  },
  {
    key: "E16",
    titleKo: "기초과학동 (E16)",
    titleEn: "Basic Science Building (E16)",
    latitude: 36.36910,
    longitude: 127.36680,
    markdownKo: "기초과학 연구시설이 위치합니다.",
  },

  // ── 서측 (기숙사/생활) ──
  {
    key: "W2",
    titleKo: "태울관 서측 (W2)",
    titleEn: "Taeul Hall West (W2)",
    latitude: 36.37200,
    longitude: 127.35700,
    markdownKo: "학생 편의시설이 위치한 건물입니다.\n\n- 식당, 편의점, 세탁소",
  },
  {
    key: "W4",
    titleKo: "사랑관 (W4)",
    titleEn: "Sarang Hall (W4)",
    latitude: 36.37150,
    longitude: 127.35700,
    markdownKo: "학부생 기숙사입니다.\n\n- 2인실\n- 세탁실, 휴게실 구비",
  },
  {
    key: "W5",
    titleKo: "나눔관 (W5)",
    titleEn: "Nanum Hall (W5)",
    latitude: 36.37200,
    longitude: 127.35550,
    markdownKo: "대학원생 기숙사입니다.\n\n- 1인실/2인실\n- 공용 주방 있음",
  },
  {
    key: "W6",
    titleKo: "소망관 (W6)",
    titleEn: "Somang Hall (W6)",
    latitude: 36.37180,
    longitude: 127.35450,
    markdownKo: "대학원생 기숙사입니다.\n\n- 1인실\n- 공용 라운지",
  },
  {
    key: "W8",
    titleKo: "여울관 (W8)",
    titleEn: "Yeoul Hall (W8)",
    latitude: 36.37100,
    longitude: 127.35600,
    markdownKo: "기숙사입니다.\n\n- 세탁실, 공용 주방\n- 편의점 인접",
  },
  {
    key: "W13",
    titleKo: "KAIST 배이글관 (W13)",
    titleEn: "KAIST Baegel Hall (W13)",
    latitude: 36.36950,
    longitude: 127.35800,
    markdownKo: "편의시설이 모여있는 건물입니다.",
  },

  // ── 기타 주요 건물 ──
  {
    key: "KI",
    titleKo: "KI빌딩 (E4)",
    titleEn: "KI Building (E4)",
    latitude: 36.36930,
    longitude: 127.36350,
    markdownKo: "KAIST 융합연구원 건물입니다.\n\n- 산학협력 센터\n- 회의실",
  },
  {
    key: "산경",
    titleKo: "산업경영학동 (E2-2)",
    titleEn: "Industrial & Systems Engineering (E2-2)",
    latitude: 36.36940,
    longitude: 127.36320,
    markdownKo: "산업및시스템공학과가 위치합니다.",
  },
  {
    key: "응공",
    titleKo: "응용공학동 (W1)",
    titleEn: "Applied Engineering (W1)",
    latitude: 36.37100,
    longitude: 127.35900,
    markdownKo: "신소재공학과, 원자력양자공학과 등이 위치합니다.",
  },
  {
    key: "N5",
    titleKo: "인성관 (N5)",
    titleEn: "Insung Hall (N5)",
    latitude: 36.37420,
    longitude: 127.35800,
    markdownKo: "학부생 기숙사입니다.\n\n- 2인실\n- 세탁실, 휴게실",
  },
  {
    key: "N10",
    titleKo: "교수회관 (N10)",
    titleEn: "Faculty House (N10)",
    latitude: 36.37350,
    longitude: 127.36150,
    markdownKo: "교수 편의시설 및 게스트하우스입니다.\n\n- 1층: 교수회관 식당\n- 게스트룸 운영",
  },
  {
    key: "N25",
    titleKo: "대강당 (N25)",
    titleEn: "Main Auditorium (N25)",
    latitude: 36.37480,
    longitude: 127.36300,
    markdownKo: "KAIST 대강당입니다.\n\n- 공연, 입학식, 졸업식 등 대규모 행사\n- 약 1,000석 규모",
  },
  {
    key: "E1",
    titleKo: "창의관 (E1)",
    titleEn: "Creative Building (E1)",
    latitude: 36.36980,
    longitude: 127.36280,
    markdownKo: "강의실 및 세미나실이 위치합니다.",
  },
  {
    key: "E5",
    titleKo: "기초실험동 (E5)",
    titleEn: "Basic Laboratory (E5)",
    latitude: 36.36950,
    longitude: 127.36580,
    markdownKo: "기초과학 실험실이 위치합니다.\n\n- 물리 실험실\n- 화학 실험실",
  },
  {
    key: "E7",
    titleKo: "기계항공공학동 (E7)",
    titleEn: "Aerospace Engineering (E7)",
    latitude: 36.36920,
    longitude: 127.36450,
    markdownKo: "항공우주공학과 연구실 및 강의실이 위치합니다.",
  },
  {
    key: "E10",
    titleKo: "LG사이언스홀 (E10)",
    titleEn: "LG Science Hall (E10)",
    latitude: 36.37030,
    longitude: 127.36500,
    markdownKo: "대형 강의실 및 행사장입니다.\n\n- 계단식 강의실\n- 세미나, 특강 공간",
  },
  {
    key: "W3",
    titleKo: "희망관 (W3)",
    titleEn: "Himang Hall (W3)",
    latitude: 36.37160,
    longitude: 127.35650,
    markdownKo: "기숙사입니다.\n\n- 1인실/2인실\n- 세탁실 구비",
  },
  {
    key: "W4-2",
    titleKo: "아름관 (W4-2)",
    titleEn: "Areum Hall (W4-2)",
    latitude: 36.37140,
    longitude: 127.35720,
    markdownKo: "학부생 기숙사입니다.\n\n- 2인실\n- 세탁실, 휴게실",
  },
];

// ──────────────────────────────────────────────
// Child markers — parentKey로 부모 참조
// ──────────────────────────────────────────────
type ChildDef = {
  parentKey: string;
  titleKo: string;
  titleEn: string;
  latitude: number;
  longitude: number;
  category: "dining" | "cafe" | "facility" | "library" | "etc" | "bus";
  markdownKo: string;
  dynamicType: "none" | "dining" | "bus" | "event";
};

const CHILDREN: ChildDef[] = [
  // ── N13 카이마루 내부 ──
  {
    parentKey: "N13",
    titleKo: "오니기리와 이규동",
    titleEn: "Onigiri & Igyudong",
    latitude: 36.37265,
    longitude: 127.36225,
    category: "dining",
    markdownKo:
      "맛있는 규동과 자율무들을 판매합니다.\n\n- 연락처: 042-350-0874\n- 운영시간\n  - 평일 9:00~19:30\n  - 토요일 9:00~17:30\n  - 일요일 및 공휴일 휴무\n  - Break time: 14:30~16:30\n- 메뉴메뉴\n  - 규동, 돈부리, 우동, 오니기리 등",
    dynamicType: "dining",
  },
  {
    parentKey: "N13",
    titleKo: "롤링파스타",
    titleEn: "Rolling Pasta",
    latitude: 36.37258,
    longitude: 127.36218,
    category: "dining",
    markdownKo:
      "파스타, 리조또 전문점입니다.\n\n- 운영시간: 11:00~20:00\n- Break time: 15:00~16:30\n- 토/일/공휴일 휴무",
    dynamicType: "dining",
  },
  {
    parentKey: "N13",
    titleKo: "베어스타코",
    titleEn: "Bear's Taco",
    latitude: 36.37255,
    longitude: 127.36210,
    category: "dining",
    markdownKo:
      "타코, 부리토 전문점입니다.\n\n- 운영시간: 11:00~19:30\n- Break time: 14:30~16:00",
    dynamicType: "dining",
  },
  {
    parentKey: "N13",
    titleKo: "북측카페테리아",
    titleEn: "North Cafeteria",
    latitude: 36.37270,
    longitude: 127.36230,
    category: "dining",
    markdownKo:
      "KAIST 구내식당\n\n- 조식 8:00~9:00 (3,500원)\n  - 뷔페\n  - 물김치라면(1F)\n- 중식 11:20~13:00 (5,500원)\n  - 뷔페(4,5,6)\n  - 일요일 및 공휴일 휴무\n  - Break time: 14:30~16:30\n- 석식 17:00~18:30\n  - 뷔페\n- 도시락(4,5,6)\n  - 중식 11:20~13:00 (5,500원)\n  - 뷔페\n  - 근대한우(1,5)",
    dynamicType: "dining",
  },
  {
    parentKey: "N13",
    titleKo: "탐앤탐스 카이마루점",
    titleEn: "Tom N Toms Kaimaru",
    latitude: 36.37240,
    longitude: 127.36200,
    category: "cafe",
    markdownKo: "- 운영시간: 08:00~22:00\n- 위치: 카이마루 1층",
    dynamicType: "none",
  },
  {
    parentKey: "N13",
    titleKo: "우리은행 ATM",
    titleEn: "Woori Bank ATM",
    latitude: 36.37250,
    longitude: 127.36180,
    category: "etc",
    markdownKo: "카이마루 1층에 위치한 ATM입니다.\n\n- 24시간 이용 가능",
    dynamicType: "none",
  },

  // ── W2 태울관 서측 내부 ──
  {
    parentKey: "W2",
    titleKo: "별리달리",
    titleEn: "Byeollidalli",
    latitude: 36.37205,
    longitude: 127.35710,
    category: "dining",
    markdownKo:
      "한식 분식 전문점입니다.\n\n- 운영시간: 11:00~20:00\n- Break time: 14:30~16:30\n- 메뉴: 제육볶음, 김치찌개, 돈까스 등",
    dynamicType: "dining",
  },
  {
    parentKey: "W2",
    titleKo: "풀빛마루",
    titleEn: "Pulbitmaroo",
    latitude: 36.37195,
    longitude: 127.35705,
    category: "dining",
    markdownKo:
      "채식 위주 식당입니다.\n\n- 운영시간: 11:00~14:00, 17:00~19:00\n- 비건/채식 메뉴 제공",
    dynamicType: "dining",
  },
  {
    parentKey: "W2",
    titleKo: "CU 편의점 태울관점",
    titleEn: "CU Convenience Store (W2)",
    latitude: 36.37210,
    longitude: 127.35720,
    category: "etc",
    markdownKo: "- 운영시간: 07:00~24:00",
    dynamicType: "none",
  },
  {
    parentKey: "W2",
    titleKo: "세탁소 (W2)",
    titleEn: "Laundry (W2)",
    latitude: 36.37190,
    longitude: 127.35690,
    category: "etc",
    markdownKo: "- 운영시간: 09:00~18:00\n- 주말 휴무",
    dynamicType: "none",
  },

  // ── E9 학술문화관 내부 ──
  {
    parentKey: "E9",
    titleKo: "학술정보관 (도서관)",
    titleEn: "KAIST Library",
    latitude: 36.37020,
    longitude: 127.36370,
    category: "library",
    markdownKo:
      "KAIST 중앙 도서관입니다.\n\n- 운영시간\n  - 학기중: 08:00~22:00\n  - 방학중: 09:00~18:00\n- 열람실: 24시간 (학기중)\n- 그룹 스터디룸 예약 가능",
    dynamicType: "none",
  },
  {
    parentKey: "E9",
    titleKo: "카페 인 (E9)",
    titleEn: "Cafe In (E9)",
    latitude: 36.37005,
    longitude: 127.36350,
    category: "cafe",
    markdownKo: "학술문화관 1층 카페입니다.\n\n- 운영시간: 08:30~19:00\n- 주말 휴무",
    dynamicType: "none",
  },

  // ── N3 체육관 내부 ──
  {
    parentKey: "N3",
    titleKo: "수영장",
    titleEn: "Swimming Pool",
    latitude: 36.37510,
    longitude: 127.36110,
    category: "facility",
    markdownKo:
      "KAIST 실내 수영장\n\n- 운영: 06:00~08:00, 12:00~13:00, 18:00~21:00\n- 주말: 10:00~17:00\n- 레인: 6개",
    dynamicType: "none",
  },
  {
    parentKey: "N3",
    titleKo: "헬스장",
    titleEn: "Fitness Center",
    latitude: 36.37505,
    longitude: 127.36105,
    category: "facility",
    markdownKo:
      "KAIST 헬스장\n\n- 운영: 06:00~22:00\n- 주말: 09:00~18:00\n- 재학생 무료 이용",
    dynamicType: "none",
  },
  {
    parentKey: "N3",
    titleKo: "농구코트 (실내)",
    titleEn: "Indoor Basketball Court",
    latitude: 36.37495,
    longitude: 127.36095,
    category: "facility",
    markdownKo: "실내 농구/배드민턴 코트\n\n- 예약제 운영\n- KAIST 포털에서 예약",
    dynamicType: "none",
  },

  // ── E11 창의학습관 내부 ──
  {
    parentKey: "E11",
    titleKo: "동측카페테리아",
    titleEn: "East Cafeteria",
    latitude: 36.37055,
    longitude: 127.36560,
    category: "dining",
    markdownKo: "- 중식 11:30~13:30\n- 석식 17:00~19:00",
    dynamicType: "dining",
  },

  // ── W13 내부 ──
  {
    parentKey: "W13",
    titleKo: "이발소",
    titleEn: "Barber Shop",
    latitude: 36.36955,
    longitude: 127.35810,
    category: "etc",
    markdownKo: "- 운영시간: 09:00~19:00\n- 일요일 휴무\n- 예약 가능",
    dynamicType: "none",
  },
  {
    parentKey: "W13",
    titleKo: "인쇄소",
    titleEn: "Print Shop",
    latitude: 36.36945,
    longitude: 127.35795,
    category: "etc",
    markdownKo: "- 운영시간: 09:00~18:00\n- 컬러/흑백 복사, 제본\n- 논문 인쇄",
    dynamicType: "none",
  },

  // ── W4 사랑관 내부 ──
  {
    parentKey: "W4",
    titleKo: "사랑관 세탁실",
    titleEn: "Sarang Hall Laundry",
    latitude: 36.37155,
    longitude: 127.35705,
    category: "facility",
    markdownKo: "- 1층 위치\n- 세탁기 8대, 건조기 8대\n- 24시간 이용 가능",
    dynamicType: "none",
  },

  // ── W5 나눔관 내부 ──
  {
    parentKey: "W5",
    titleKo: "나눔관 공용주방",
    titleEn: "Nanum Hall Kitchen",
    latitude: 36.37205,
    longitude: 127.35555,
    category: "facility",
    markdownKo: "- 각 층 공용주방\n- 인덕션, 전자레인지, 냉장고 구비",
    dynamicType: "none",
  },

  // ── N10 교수회관 내부 ──
  {
    parentKey: "N10",
    titleKo: "교수회관 식당",
    titleEn: "Faculty Restaurant",
    latitude: 36.37355,
    longitude: 127.36155,
    category: "dining",
    markdownKo: "교수회관 1층 식당입니다.\n\n- 중식 11:30~13:30\n- 석식 17:30~19:00\n- 한식 위주, 정식 메뉴",
    dynamicType: "dining",
  },

  // ── E3 전산학동 내부 ──
  {
    parentKey: "E3",
    titleKo: "카페 더 라운지",
    titleEn: "Cafe The Lounge",
    latitude: 36.36905,
    longitude: 127.36275,
    category: "cafe",
    markdownKo: "전산학동 1층 카페입니다.\n\n- 운영시간: 08:30~18:00\n- 주말 휴무",
    dynamicType: "none",
  },

  // ── N3 체육관 추가 시설 ──
  {
    parentKey: "N3",
    titleKo: "테니스장",
    titleEn: "Tennis Court",
    latitude: 36.37515,
    longitude: 127.36120,
    category: "facility",
    markdownKo: "실외 테니스장\n\n- 코트 4면\n- KAIST 포털에서 예약\n- 야간 조명 있음",
    dynamicType: "none",
  },
  {
    parentKey: "N3",
    titleKo: "풋살장",
    titleEn: "Futsal Court",
    latitude: 36.37520,
    longitude: 127.36130,
    category: "facility",
    markdownKo: "실외 풋살장\n\n- 인조잔디\n- KAIST 포털에서 예약",
    dynamicType: "none",
  },
];

// ──────────────────────────────────────────────
// Standalone markers (no parent)
// ──────────────────────────────────────────────
const STANDALONE = [
  // 버스 정류장
  {
    titleKo: "KAIST 정문 정류장",
    titleEn: "KAIST Main Gate Bus Stop",
    latitude: 36.37460,
    longitude: 127.36480,
    category: "bus" as const,
    markdownKo:
      "시내버스 정류장\n\n- 월평세트 (5분거리)\n  - 13:06 (남은 시간 12분 34초)\n- OLEV 과학터널 (5분거리)\n  - 12:30 (남은 시간 12분 34초)\n- 월평세트 (5분거리)\n  - 15:15 (남은 시간 12분 34초)\n- 온세스 (5분27초)\n  - 18:07 (남은 시간 6시간 12분34초)\n- 서울세트 (5분거리)\n  - 금 17:40 (남은 시간 9분 6시간12분 34초)",
    dynamicType: "bus" as const,
  },
  {
    titleKo: "오리연못 정류장",
    titleEn: "Duck Pond Bus Stop",
    latitude: 36.37200,
    longitude: 127.36300,
    category: "bus" as const,
    markdownKo: "시내버스 정류장\n\n- 104번, 301번",
    dynamicType: "bus" as const,
  },
  {
    titleKo: "한국과학기술원오리연못",
    titleEn: "KAIST Duck Pond",
    latitude: 36.37210,
    longitude: 127.36310,
    category: "facility" as const,
    markdownKo: "KAIST 캠퍼스 내 오리연못입니다.\n\n- 산책로\n- 벤치 있음",
    dynamicType: "none" as const,
  },
  {
    titleKo: "전기차충전소 (W8 앞)",
    titleEn: "EV Charging Station (W8)",
    latitude: 36.37105,
    longitude: 127.35610,
    category: "etc" as const,
    markdownKo: "- 급속 충전기 2대\n- 완속 충전기 4대",
    dynamicType: "none" as const,
  },
  {
    titleKo: "클리닉 (건강관리센터)",
    titleEn: "Health Care Center",
    latitude: 36.37300,
    longitude: 127.35900,
    category: "facility" as const,
    markdownKo:
      "KAIST 교내 건강관리센터\n\n- 운영: 09:00~17:30\n- 점심: 12:00~13:00\n- 주말/공휴일 휴무\n- 일반진료, 건강검진",
    dynamicType: "none" as const,
  },
  {
    titleKo: "우체국",
    titleEn: "Post Office",
    latitude: 36.37280,
    longitude: 127.35950,
    category: "etc" as const,
    markdownKo: "KAIST 캠퍼스 내 우체국\n\n- 운영: 09:00~18:00\n- 토/일/공휴일 휴무\n- 택배 접수, 등기, 우편",
    dynamicType: "none" as const,
  },
  {
    titleKo: "대덕한빛교회",
    titleEn: "Daedeok Hanbit Church",
    latitude: 36.36850,
    longitude: 127.35850,
    category: "etc" as const,
    markdownKo: "캠퍼스 인근 교회입니다.",
    dynamicType: "none" as const,
  },
];

// ──────────────────────────────────────────────
// Seed runner
// ──────────────────────────────────────────────
async function seedMarkers() {
  await connectDB();

  const admin = await Manager.findOne({ role: "admin" });
  if (!admin) {
    console.error("[Seed] Admin 계정이 없습니다. 먼저 npm run seed:admin 을 실행하세요.");
    await mongoose.disconnect();
    process.exit(1);
  }

  // 기존 마커 전체 삭제
  const deleted = await Marker.deleteMany({});
  if (deleted.deletedCount > 0) {
    console.log(`[Seed] 기존 마커 ${deleted.deletedCount}개 삭제`);
  }

  // 1) Parent buildings 생성
  const parentMap = new Map<string, mongoose.Types.ObjectId>();

  for (const p of PARENTS) {
    const doc = await Marker.create({
      titleKo: p.titleKo,
      titleEn: p.titleEn,
      latitude: p.latitude,
      longitude: p.longitude,
      category: "building",
      markdownKo: p.markdownKo,
      dynamicType: "none",
      createdBy: admin._id,
      status: "active",
      parentId: null,
    });
    parentMap.set(p.key, doc._id as mongoose.Types.ObjectId);
  }
  console.log(`[Seed] Parent 건물 ${parentMap.size}개 생성`);

  // 2) Child markers 생성
  let childCount = 0;
  for (const c of CHILDREN) {
    const parentId = parentMap.get(c.parentKey);
    if (!parentId) {
      console.warn(`[Seed] ⚠️ parentKey "${c.parentKey}" 를 찾을 수 없어 스킵: ${c.titleKo}`);
      continue;
    }
    await Marker.create({
      titleKo: c.titleKo,
      titleEn: c.titleEn,
      latitude: c.latitude,
      longitude: c.longitude,
      category: c.category,
      markdownKo: c.markdownKo,
      dynamicType: c.dynamicType,
      createdBy: admin._id,
      status: "active",
      parentId,
    });
    childCount++;
  }
  console.log(`[Seed] Child 마커 ${childCount}개 생성`);

  // 3) Standalone markers 생성
  for (const s of STANDALONE) {
    await Marker.create({
      ...s,
      createdBy: admin._id,
      status: "active",
      parentId: null,
    });
  }
  console.log(`[Seed] 단독 마커 ${STANDALONE.length}개 생성`);

  const total = parentMap.size + childCount + STANDALONE.length;
  console.log(`[Seed] ✅ 총 ${total}개 마커 시드 완료`);

  await mongoose.disconnect();
}

seedMarkers().catch((err) => {
  console.error("[Seed] 실패:", err);
  process.exit(1);
});
