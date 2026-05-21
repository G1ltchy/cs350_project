import type { MarkerDetail } from "../types/marker";

export const mockMarkers: MarkerDetail[] = [
  {
    id: "kaimaru",
    titleKo: "카이마루",
    titleEn: "Kaimaru",
    category: "dining",
    latitude: 36.3721,
    longitude: 127.3602,
    parentId: null,
    markdownKo:
      "KAIST 대표 학생식당입니다. 오늘의 메뉴 정보와 운영 정보를 확인할 수 있습니다.",
    dynamicType: "dining",
    externalUrl: "https://www.kaist.ac.kr"
  },
  {
    id: "main-gate-bus",
    titleKo: "본원 정문 버스정류장",
    titleEn: "Main Gate Bus Stop",
    category: "bus",
    latitude: 36.3695,
    longitude: 127.361,
    parentId: null,
    markdownKo: "KAIST 정문 근처 버스정류장입니다.",
    dynamicType: "bus",
    externalUrl: "https://www.kaist.ac.kr"
  },
  {
    id: "n1",
    titleKo: "N1",
    titleEn: "N1",
    category: "building",
    latitude: 36.373,
    longitude: 127.365,
    parentId: null,
    markdownKo:
      "KAIST N1 건물입니다. 강의실, 연구실, 편의시설 정보를 확인할 수 있습니다.",
    dynamicType: "none",
    children: [
      {
        id: "n1-room-101",
        titleKo: "N1 101호",
        category: "facility",
        latitude: 36.37305,
        longitude: 127.36505,
        parentId: "n1",
        dynamicType: "none"
      },
      {
        id: "n1-cafe",
        titleKo: "N1 카페",
        category: "cafe",
        latitude: 36.37308,
        longitude: 127.36508,
        parentId: "n1",
        dynamicType: "none"
      }
    ]
  },
  {
    id: "festival",
    titleKo: "동아리 박람회",
    titleEn: "Club Fair",
    category: "event",
    latitude: 36.3712,
    longitude: 127.3625,
    parentId: null,
    markdownKo:
      "오늘 오후 6시까지 진행되는 동아리 박람회입니다. 다양한 동아리 부스를 확인할 수 있습니다.",
    dynamicType: "event",
    activeUntil: "2026-05-21T18:00:00+09:00"
  }
];