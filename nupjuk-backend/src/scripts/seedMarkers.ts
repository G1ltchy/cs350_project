import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Marker } from "../models/Marker";
import { Manager } from "../models/Manager";
import { connectDB } from "../config/db";

// ──────────────────────────────────────────────
// Parent buildings (category: "building")
// 좌표 출처: Kakao Local Search API (2026-06)
// ──────────────────────────────────────────────
const PARENTS = [
  // ════════════════════════════════════════════
  //  북측 (N)
  // ════════════════════════════════════════════
  {
    key: "N0",
    titleKo: "동문 (N0)",
    titleEn: "East Gate (N0)",
    latitude: 36.37352,
    longitude: 127.36708,
    markdownKo: "KAIST 대전캠퍼스 동문입니다.",
  },
  {
    key: "N1",
    titleKo: "김병호·김삼열 IT융합빌딩 (N1)",
    titleEn: "Kim Beang-Ho & Kim Sam-Youl ITC Building (N1)",
    latitude: 36.37422,
    longitude: 127.36572,
    markdownKo:
      "전기및전자공학부, 전산학부 강의실 및 연구실이 위치한 건물입니다.\n\n- 지하 1층 ~ 지상 6층",
  },
  {
    key: "N2",
    titleKo: "행정분관 (N2)",
    titleEn: "Branch Administration Building (N2)",
    latitude: 36.37295,
    longitude: 127.36363,
    markdownKo: "행정 업무를 처리하는 분관 건물입니다.",
  },
  {
    key: "N3",
    titleKo: "류근철스포츠컴플렉스 (N3)",
    titleEn: "Ryu Geun-Chul Sports Complex (N3)",
    latitude: 36.37250,
    longitude: 127.36147,
    markdownKo:
      "실내 체육관, 수영장, 헬스장이 있습니다.\n\n- 운영: 06:00~22:00\n- 주말: 09:00~18:00",
  },
  {
    key: "N4",
    titleKo: "디지털인문사회과학부동 (N4)",
    titleEn: "School of Digital Humanities & Computational Social Sciences (N4)",
    latitude: 36.37323,
    longitude: 127.36264,
    markdownKo: "인문사회과학부 연구실 및 강의실이 위치합니다.",
  },
  {
    key: "N5",
    titleKo: "융합연구동 (N5)",
    titleEn: "Convergence Research Building (N5)",
    latitude: 36.37399,
    longitude: 127.36388,
    markdownKo: "융합 연구시설이 위치합니다.",
  },
  {
    key: "N6",
    titleKo: "교수회관 (N6)",
    titleEn: "Faculty House (N6)",
    latitude: 36.37457,
    longitude: 127.36481,
    markdownKo:
      "교수 편의시설 및 게스트하우스입니다.\n\n- 1층: 교수회관 식당\n- 게스트룸 운영",
  },
  {
    key: "N7",
    titleKo: "기계공학동 (N7)",
    titleEn: "Mechanical Engineering Building (N7)",
    latitude: 36.37242,
    longitude: 127.35871,
    markdownKo:
      "기계공학과, 항공우주공학과 연구실 및 강의실이 위치합니다.\n\n- 우주항공빌딩 포함",
  },
  {
    key: "N9",
    titleKo: "실습동 (N9)",
    titleEn: "Practice Building (N9)",
    latitude: 36.37424,
    longitude: 127.36158,
    markdownKo: "실습 시설이 위치합니다.",
  },
  {
    key: "N10",
    titleKo: "교직원분관 (N10)",
    titleEn: "Undergraduate Branch Library (N10)",
    latitude: 36.37416,
    longitude: 127.36041,
    markdownKo: "교직원분관 건물입니다.",
  },
  {
    key: "N11",
    titleKo: "학생식당 (N11)",
    titleEn: "Student Cafeteria (N11)",
    latitude: 36.37389,
    longitude: 127.35943,
    markdownKo: "KAIST 학생식당입니다.",
  },
  {
    key: "N12",
    titleKo: "학생회관 2 (N12)",
    titleEn: "Student Center 2 (N12)",
    latitude: 36.37418,
    longitude: 127.35982,
    markdownKo:
      "북측 식당가 및 복지동이 모여있는 건물입니다.",
  },
  {
    key: "N13",
    titleKo: "태울관 (N13)",
    titleEn: "Taeul Hall (N13)",
    latitude: 36.37305,
    longitude: 127.36003,
    markdownKo: "학부 강의 및 학생 편의시설이 있는 건물입니다.",
  },
  {
    key: "N13-1",
    titleKo: "장영신학생회관 (N13-1)",
    titleEn: "Chung Young Shin Student Center (N13-1)",
    latitude: 36.37313,
    longitude: 127.36047,
    markdownKo: "학생 자치활동 공간 및 편의시설이 위치합니다.",
  },
  {
    key: "N14",
    titleKo: "사랑관 (N14)",
    titleEn: "Sarang Hall (N14)",
    latitude: 36.37379,
    longitude: 127.35833,
    markdownKo: "학부생 기숙사입니다.\n\n- 2인실\n- 세탁실, 휴게실 구비",
  },
  {
    key: "N15",
    titleKo: "교직원 숙소 (N15)",
    titleEn: "Staff Accommodation (N15)",
    latitude: 36.37488,
    longitude: 127.35983,
    markdownKo: "교직원 숙소입니다.",
  },
  {
    key: "N16",
    titleKo: "소망관 (N16)",
    titleEn: "Somang Hall (N16)",
    latitude: 36.37386,
    longitude: 127.35749,
    markdownKo: "기숙사입니다.\n\n- 1인실\n- 공용 라운지",
  },
  {
    key: "N17",
    titleKo: "성실관 (N17)",
    titleEn: "Seongsil Hall (N17)",
    latitude: 36.37433,
    longitude: 127.35888,
    markdownKo: "학부생 기숙사입니다.",
  },
  {
    key: "N18",
    titleKo: "진리관 (N18)",
    titleEn: "Jinri Hall (N18)",
    latitude: 36.37478,
    longitude: 127.35919,
    markdownKo: "학부생 기숙사입니다.",
  },
  {
    key: "N19",
    titleKo: "아름관 (N19)",
    titleEn: "Areum Hall (N19)",
    latitude: 36.37414,
    longitude: 127.35653,
    markdownKo: "학부생 기숙사입니다.",
  },
  {
    key: "N20",
    titleKo: "신뢰관 (N20)",
    titleEn: "Sinoe Hall (N20)",
    latitude: 36.37529,
    longitude: 127.35899,
    markdownKo: "학부생 기숙사입니다.",
  },
  {
    key: "N21",
    titleKo: "지혜관 (N21)",
    titleEn: "Jihye Hall (N21)",
    latitude: 36.37594,
    longitude: 127.35854,
    markdownKo: "학부생 기숙사입니다.",
  },
  {
    key: "N22",
    titleKo: "동문창업관 (N22)",
    titleEn: "Alumni Venture Hall (N22)",
    latitude: 36.37479,
    longitude: 127.36425,
    markdownKo: "동문 창업 지원 시설입니다.",
  },
  {
    key: "N23",
    titleKo: "fMRI센터 (N23)",
    titleEn: "fMRI Center (N23)",
    latitude: 36.37542,
    longitude: 127.36407,
    markdownKo: "fMRI 연구 센터입니다.",
  },
  {
    key: "N24",
    titleKo: "LG이노베이션홀 (N24)",
    titleEn: "LG Innovation Hall (N24)",
    latitude: 36.37534,
    longitude: 127.36357,
    markdownKo: "산업디자인학과 및 LG 연구시설이 위치합니다.",
  },
  {
    key: "N25",
    titleKo: "산업디자인학과동 (N25)",
    titleEn: "Dept. of Industrial Design Building (N25)",
    latitude: 36.37372,
    longitude: 127.36191,
    markdownKo: "산업디자인학과 연구실 및 강의실이 위치합니다.",
  },
  {
    key: "N26",
    titleKo: "고성능집적시스템연구센터 (N26)",
    titleEn: "Center for High-Performance Integrated Systems (N26)",
    latitude: 36.37547,
    longitude: 127.36160,
    markdownKo: "고성능 집적시스템 연구 센터입니다.",
  },
  {
    key: "N27",
    titleKo: "유레카관 (N27)",
    titleEn: "Eureka Hall (N27)",
    latitude: 36.37551,
    longitude: 127.36072,
    markdownKo: "학부생 기숙사입니다.",
  },
  {
    key: "N28",
    titleKo: "에너지환경연구센터 (N28)",
    titleEn: "Energy & Environment Research Center (N28)",
    latitude: 36.37546,
    longitude: 127.36252,
    markdownKo: "에너지 및 환경 관련 연구 센터입니다.",
  },
  {
    key: "N29",
    titleKo: "KAIST 메타융합관 2 (N29)",
    titleEn: "KAIST Meta-Convergence Building 2 (N29)",
    latitude: 36.37539,
    longitude: 127.35989,
    markdownKo: "메타융합 연구시설입니다.",
  },

  // ════════════════════════════════════════════
  //  동측 (E)
  // ════════════════════════════════════════════
  {
    key: "E1",
    titleKo: "정문 (E1)",
    titleEn: "Main Gate (E1)",
    latitude: 36.36569,
    longitude: 127.36384,
    markdownKo: "KAIST 대전캠퍼스 정문입니다.",
  },
  {
    key: "E2",
    titleKo: "산업경영학동 (E2)",
    titleEn: "Industrial Engineering & Management Building (E2)",
    latitude: 36.36729,
    longitude: 127.36430,
    markdownKo:
      "산업및시스템공학과, 데이터사이언스대학원이 위치합니다.",
  },
  {
    key: "E3",
    titleKo: "정보전자공학동 (E3)",
    titleEn: "Information & Electronics Building (E3)",
    latitude: 36.36871,
    longitude: 127.36550,
    markdownKo:
      "전산학부, 전기및전자공학부 연구실 및 강의실이 위치합니다.",
  },
  {
    key: "E3-1",
    titleKo: "전산학부동 (E3-1)",
    titleEn: "School of Computing Building (E3-1)",
    latitude: 36.36803,
    longitude: 127.36575,
    markdownKo:
      "전산학부 연구실 및 강의실이 위치합니다.\n\n- 알고리즘 랩\n- AI 연구실\n- 시스템 연구실",
  },
  {
    key: "E4",
    titleKo: "KI빌딩 (E4)",
    titleEn: "KAIST Institute Buildings (E4)",
    latitude: 36.36821,
    longitude: 127.36388,
    markdownKo: "KAIST 융합연구원 건물입니다.\n\n- 산학협력 센터\n- 회의실",
  },
  {
    key: "E5",
    titleKo: "교직원회관 (E5)",
    titleEn: "Faculty Club (E5)",
    latitude: 36.36928,
    longitude: 127.36363,
    markdownKo: "교직원 편의시설입니다.",
  },
  {
    key: "E6",
    titleKo: "자연과학동 (E6)",
    titleEn: "Natural Science Building (E6)",
    latitude: 36.36983,
    longitude: 127.36451,
    markdownKo:
      "수리과학과, 물리학과, 생명과학과 등이 위치합니다.",
  },
  {
    key: "E7",
    titleKo: "기초과학연구동 (E7)",
    titleEn: "Computational Science Building (E7)",
    latitude: 36.36910,
    longitude: 127.36640,
    markdownKo: "기초과학 연구시설이 위치합니다.",
  },
  {
    key: "E8",
    titleKo: "세종관 (E8)",
    titleEn: "Sejong Hall (E8)",
    latitude: 36.37111,
    longitude: 127.36656,
    markdownKo: "강의실 및 연구실이 위치합니다.",
  },
  {
    key: "E9",
    titleKo: "학술문화관 (E9)",
    titleEn: "Academic Cultural Complex (E9)",
    latitude: 36.36959,
    longitude: 127.36240,
    markdownKo:
      "중앙도서관, 열람실, 세미나실이 있는 학술문화관입니다.",
  },
  {
    key: "E10",
    titleKo: "중앙창고 (E10)",
    titleEn: "Central Warehouse / KAIST Art Museum (E10)",
    latitude: 36.37127,
    longitude: 127.36535,
    markdownKo: "중앙 물류 창고 및 KAIST 미술관이 위치합니다.",
  },
  {
    key: "E11",
    titleKo: "학생지원동 (E11)",
    titleEn: "Student Affairs Building (E11)",
    latitude: 36.37046,
    longitude: 127.36262,
    markdownKo:
      "입학처, 학생복지, 학생생활처가 위치합니다.",
  },
  {
    key: "E12",
    titleKo: "중앙기계실 (E12)",
    titleEn: "Central Mechanical Room (E12)",
    latitude: 36.37124,
    longitude: 127.36444,
    markdownKo: "중앙 기계설비 시설입니다.",
  },
  {
    key: "E14",
    titleKo: "본관 (E14)",
    titleEn: "Main Administration Building (E14)",
    latitude: 36.37045,
    longitude: 127.36116,
    markdownKo:
      "KAIST 본관입니다.\n\n- 교학처\n- 연구처\n- 기획예산처\n- 행정처",
  },
  {
    key: "E15",
    titleKo: "대강당 (E15)",
    titleEn: "Main Auditorium (E15)",
    latitude: 36.37201,
    longitude: 127.36317,
    markdownKo:
      "KAIST 대강당입니다.\n\n- 공연, 입학식, 졸업식 등 대규모 행사\n- 약 1,000석 규모",
  },
  {
    key: "E16",
    titleKo: "정문술빌딩 (E16)",
    titleEn: "Jeongmun-Sul Building (E16)",
    latitude: 36.37171,
    longitude: 127.36184,
    markdownKo:
      "강의실 및 연구실이 위치합니다.\n\n- 바이오및뇌공학과\n- 의과학대학원",
  },
  {
    key: "E17",
    titleKo: "운동장 (E17)",
    titleEn: "Sports Field (E17)",
    latitude: 36.36956,
    longitude: 127.36849,
    markdownKo: "KAIST 캠퍼스 운동장입니다.",
  },
  {
    key: "E18",
    titleKo: "대전질환모델동물센터 (E18)",
    titleEn: "Daegeon Disease-model Animal Center (E18)",
    latitude: 36.36825,
    longitude: 127.36816,
    markdownKo: "질환 모델 동물 연구 센터입니다.",
  },
  {
    key: "E19",
    titleKo: "나노종합기술원 (E19)",
    titleEn: "National Nano Fab Center (E19)",
    latitude: 36.36826,
    longitude: 127.36685,
    markdownKo: "KAIST 부설 나노종합기술원입니다.",
  },
  {
    key: "E20",
    titleKo: "계룡관 (E20)",
    titleEn: "Kyeryong Hall (E20)",
    latitude: 36.37254,
    longitude: 127.36704,
    markdownKo: "기숙사입니다.",
  },
  {
    key: "E21",
    titleKo: "KAIST 클리닉 (E21)",
    titleEn: "KAIST Clinic & Pappalardo Center (E21)",
    latitude: 36.36940,
    longitude: 127.36987,
    markdownKo:
      "KAIST 교내 건강관리센터\n\n- 운영: 09:00~17:30\n- 점심: 12:00~13:00\n- 주말/공휴일 휴무\n- 일반진료, 건강검진",
  },
  {
    key: "E22",
    titleKo: "기초과학연구원 KAIST캠퍼스 (E22)",
    titleEn: "Institute for Basic Science KAIST Campus (E22)",
    latitude: 36.36933,
    longitude: 127.36699,
    markdownKo: "기초과학연구원 KAIST 캠퍼스 연구동입니다.",
  },

  // ════════════════════════════════════════════
  //  서측 (W)
  // ════════════════════════════════════════════
  {
    key: "W1",
    titleKo: "응용공학동 (W1)",
    titleEn: "Applied Engineering Building (W1)",
    latitude: 36.36575,
    longitude: 127.36131,
    markdownKo:
      "신소재공학과, 건설및환경공학과, 생명화학공학과가 위치합니다.",
  },
  {
    key: "W2",
    titleKo: "학생회관 1 (W2)",
    titleEn: "Student Center 1 (W2)",
    latitude: 36.36708,
    longitude: 127.36077,
    markdownKo:
      "서측 식당가 및 학생 편의시설이 위치합니다.",
  },
  {
    key: "W3",
    titleKo: "갈릴레이관 (W3)",
    titleEn: "Galilei Hall (W3)",
    latitude: 36.36739,
    longitude: 127.35791,
    markdownKo: "기숙사입니다.\n\n- 1인실/2인실\n- 세탁실 구비",
  },
  {
    key: "W4",
    titleKo: "서측기숙사 (W4)",
    titleEn: "West Dormitory (W4)",
    latitude: 36.36833,
    longitude: 127.35689,
    markdownKo:
      "서측 기숙사 단지입니다.\n\n- 희망관(Peace Hall)\n- 나눔관\n- 꿈나래관(Dream Hall)",
  },
  {
    key: "W5",
    titleKo: "인터내셔널빌리지 (W5)",
    titleEn: "International Village (W5)",
    latitude: 36.36972,
    longitude: 127.35562,
    markdownKo:
      "미르관, 나래관, 인터내셔널빌리지가 위치합니다.",
  },
  {
    key: "W6",
    titleKo: "미르관·나래관 (W6)",
    titleEn: "Mir Hall & Narae Hall (W6)",
    latitude: 36.37043,
    longitude: 127.35601,
    markdownKo: "대학원생 기숙사입니다.\n\n- 1인실/2인실\n- 공용 주방 있음",
  },
  {
    key: "W7",
    titleKo: "우정연구동 (W7)",
    titleEn: "Housing Research Building (W7)",
    latitude: 36.37106,
    longitude: 127.35580,
    markdownKo: "연구동입니다.",
  },
  {
    key: "W8",
    titleKo: "교육지원동 (W8)",
    titleEn: "Educational Support Building (W8)",
    latitude: 36.36996,
    longitude: 127.35993,
    markdownKo: "교육 지원 시설이 위치합니다.",
  },
  {
    key: "W9",
    titleKo: "노천극장 (W9)",
    titleEn: "Outdoor Theater (W9)",
    latitude: 36.37095,
    longitude: 127.35815,
    markdownKo: "야외 공연장입니다.",
  },
  {
    key: "W10",
    titleKo: "풍동실험동 (W10)",
    titleEn: "Wind Tunnel Laboratory (W10)",
    latitude: 36.37137,
    longitude: 127.35687,
    markdownKo: "풍동 실험 시설입니다.",
  },
  {
    key: "W11",
    titleKo: "외국인교수아파트 (W11)",
    titleEn: "International Faculty Apartment (W11)",
    latitude: 36.37209,
    longitude: 127.35626,
    markdownKo: "외국인 교수 숙소입니다.",
  },
  {
    key: "W13",
    titleKo: "KAIST 메타융합관 1 (W13)",
    titleEn: "KAIST Meta-Convergence Building 1 (W13)",
    latitude: 36.36616,
    longitude: 127.36035,
    markdownKo: "메타융합 연구시설입니다.",
  },
  {
    key: "W14",
    titleKo: "롯데-카이스트 R&D센터 (W14)",
    titleEn: "LOTTE-KAIST R&D Center (W14)",
    latitude: 36.36581,
    longitude: 127.36057,
    markdownKo: "롯데-KAIST 산학협력 R&D 센터입니다.",
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
  // ── N12 학생회관2 (북측 식당가) ──
  {
    parentKey: "N12",
    titleKo: "오니기리와 이규동",
    titleEn: "Onigiri & Igyudong",
    latitude: 36.37393,
    longitude: 127.35968,
    category: "dining",
    markdownKo:
      "맛있는 규동과 오니기리를 판매합니다.\n\n- 운영시간\n  - 평일 9:00~19:30\n  - 토요일 9:00~17:30\n  - 일요일 및 공휴일 휴무\n  - Break time: 14:30~16:30",
    dynamicType: "dining",
  },
  {
    parentKey: "N12",
    titleKo: "롤링파스타",
    titleEn: "Rolling Pasta",
    latitude: 36.37388,
    longitude: 127.35963,
    category: "dining",
    markdownKo:
      "파스타, 리조또 전문점입니다.\n\n- 운영시간: 11:00~20:00\n- Break time: 15:00~16:30\n- 토/일/공휴일 휴무",
    dynamicType: "dining",
  },
  {
    parentKey: "N12",
    titleKo: "베어스타코",
    titleEn: "Bear's Taco",
    latitude: 36.37397,
    longitude: 127.35968,
    category: "dining",
    markdownKo:
      "타코, 부리토 전문점입니다.\n\n- 운영시간: 11:00~19:30\n- Break time: 14:30~16:00",
    dynamicType: "dining",
  },
  {
    parentKey: "N12",
    titleKo: "별리달리",
    titleEn: "Byeollidalli",
    latitude: 36.37365,
    longitude: 127.35907,
    category: "dining",
    markdownKo:
      "한식 분식 전문점입니다.\n\n- 운영시간: 11:00~20:00\n- Break time: 14:30~16:30",
    dynamicType: "dining",
  },
  {
    parentKey: "N12",
    titleKo: "풀빛마루",
    titleEn: "Pulbitmaroo",
    latitude: 36.37418,
    longitude: 127.35982,
    category: "dining",
    markdownKo:
      "채식 위주 식당입니다.\n\n- 운영시간: 11:00~14:00, 17:00~19:00\n- 비건/채식 메뉴 제공",
    dynamicType: "dining",
  },
  {
    parentKey: "N11",
    titleKo: "북측카페테리아",
    titleEn: "North Cafeteria",
    latitude: 36.37392,
    longitude: 127.35948,
    category: "dining",
    markdownKo:
      "KAIST 구내식당\n\n- 조식 8:00~9:00 (3,500원)\n- 중식 11:20~13:00 (5,500원)\n- 석식 17:00~18:30",
    dynamicType: "dining",
  },

  // ── N1 IT융합빌딩 내부 ──
  {
    parentKey: "N1",
    titleKo: "탐앤탐스 카이스트점",
    titleEn: "Tom N Toms KAIST",
    latitude: 36.37410,
    longitude: 127.36538,
    category: "cafe",
    markdownKo: "- 운영시간: 08:00~22:00\n- 위치: N1 1층",
    dynamicType: "none",
  },

  // ── E9 학술문화관 내부 ──
  {
    parentKey: "E9",
    titleKo: "중앙도서관",
    titleEn: "KAIST Library",
    latitude: 36.36962,
    longitude: 127.36245,
    category: "library",
    markdownKo:
      "KAIST 중앙 도서관입니다.\n\n- 운영시간\n  - 학기중: 08:00~22:00\n  - 방학중: 09:00~18:00\n- 열람실: 24시간 (학기중)\n- 그룹 스터디룸 예약 가능",
    dynamicType: "none",
  },

  // ── N3 류근철스포츠컴플렉스 내부 ──
  {
    parentKey: "N3",
    titleKo: "수영장",
    titleEn: "Swimming Pool",
    latitude: 36.37255,
    longitude: 127.36150,
    category: "facility",
    markdownKo:
      "KAIST 실내 수영장\n\n- 운영: 06:00~08:00, 12:00~13:00, 18:00~21:00\n- 주말: 10:00~17:00\n- 레인: 6개",
    dynamicType: "none",
  },
  {
    parentKey: "N3",
    titleKo: "헬스장",
    titleEn: "Fitness Center",
    latitude: 36.37248,
    longitude: 127.36143,
    category: "facility",
    markdownKo:
      "KAIST 헬스장\n\n- 운영: 06:00~22:00\n- 주말: 09:00~18:00\n- 재학생 무료 이용",
    dynamicType: "none",
  },
  {
    parentKey: "N3",
    titleKo: "농구코트 (실내)",
    titleEn: "Indoor Basketball Court",
    latitude: 36.37245,
    longitude: 127.36140,
    category: "facility",
    markdownKo:
      "실내 농구/배드민턴 코트\n\n- 예약제 운영\n- KAIST 포털에서 예약",
    dynamicType: "none",
  },
  {
    parentKey: "N3",
    titleKo: "풋살장",
    titleEn: "Futsal Court",
    latitude: 36.37237,
    longitude: 127.36022,
    category: "facility",
    markdownKo:
      "실외 풋살장\n\n- 인조잔디\n- KAIST 포털에서 예약",
    dynamicType: "none",
  },

  // ── N6 교수회관 내부 ──
  {
    parentKey: "N6",
    titleKo: "교수회관 식당",
    titleEn: "Faculty Restaurant",
    latitude: 36.37460,
    longitude: 127.36485,
    category: "dining",
    markdownKo:
      "교수회관 1층 식당입니다.\n\n- 중식 11:30~13:30\n- 석식 17:30~19:00\n- 한식 위주, 정식 메뉴",
    dynamicType: "dining",
  },

  // ── E3-1 전산학부동 내부 ──
  {
    parentKey: "E3-1",
    titleKo: "카페 더 라운지",
    titleEn: "Cafe The Lounge",
    latitude: 36.36806,
    longitude: 127.36578,
    category: "cafe",
    markdownKo:
      "전산학부동 1층 카페입니다.\n\n- 운영시간: 08:30~18:00\n- 주말 휴무",
    dynamicType: "none",
  },
];

// ──────────────────────────────────────────────
// Standalone markers (no parent)
// ──────────────────────────────────────────────
const STANDALONE = [
  {
    titleKo: "KAIST 오리연못",
    titleEn: "KAIST Duck Pond",
    latitude: 36.36785,
    longitude: 127.36294,
    category: "facility" as const,
    markdownKo:
      "KAIST 캠퍼스 내 오리연못입니다.\n\n- 산책로\n- 벤치 있음",
    dynamicType: "none" as const,
  },
  {
    titleKo: "한국과학기술원 우편취급국",
    titleEn: "KAIST Post Office",
    latitude: 36.37387,
    longitude: 127.35929,
    category: "etc" as const,
    markdownKo:
      "KAIST 캠퍼스 내 우체국\n\n- 운영: 09:00~18:00\n- 토/일/공휴일 휴무",
    dynamicType: "none" as const,
  },
  {
    titleKo: "대덕한빛교회",
    titleEn: "Daedeok Hanbit Church",
    latitude: 36.36430,
    longitude: 127.35846,
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
