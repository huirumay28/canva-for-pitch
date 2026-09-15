import { PitchData } from '@/types/pitch';

export const samplePitch: PitchData = {
  id: 'sample-1',
  title: '2027 春夏品牌重塑暨數位行銷提案',
  brief: '為台灣新銳環保時尚品牌打造完整的品牌重塑策略，結合社群行銷、影音內容與 KOL 合作，鎖定 25-35 歲注重生活品質的都會消費者，提升品牌知名度並帶動線上銷售成長。',
  product: {
    name: '綠生活 Green Living',
    description: '採用回收海洋塑膠製成的環保機能服飾系列，結合台灣在地設計與永續理念',
    category: '時尚生活品牌'
  },
  client: {
    name: '綠生活股份有限公司',
    industry: '環保時尚產業',
    background: '成立於 2021 年的台灣 B 型企業，年營收達 4,500 萬元，年成長率 80%。目前主要市場集中在台北、台中、高雄都會區，並開始拓展香港與新加坡市場。品牌理念是「讓永續成為日常」，致力於推廣環保生活方式。'
  },
  insights: {
    trends: [
      '台灣消費者對永續時尚的接受度持續提升，68% 願意為環保產品支付 15-20% 溢價',
      '短影音內容主導社群互動，Instagram Reels 與 TikTok 為主要觸及管道',
      '消費者更重視 KOL 的真實性與價值觀契合度，而非粉絲數量',
      '循環時尚概念在台灣逐漸普及，二手衣物交換與租賃服務興起',
      '本土品牌故事與在地連結成為重要的差異化優勢'
    ],
    opportunities: [
      '與台灣戶外運動、瑜珈領域的中小型 KOL 合作，建立真實口碑',
      '運用使用者原創內容（UGC）展現真實生活情境，強化品牌親和力',
      '製作海洋保育教育內容，結合 NGO 合作提升品牌社會影響力',
      '推出限量聯名系列，透過透明供應鏈故事創造話題',
      '建立會員社群，發展循環經濟模式（舊衣回收折抵）'
    ],
    challenges: [
      '環保時尚市場競爭激烈，國際品牌與本土品牌皆積極佈局',
      '生產成本較快時尚品牌高出 30-40%，價格競爭力有限',
      '需克服消費者對「漂綠」的疑慮，建立可信度',
      '品牌知名度侷限於核心市場，需擴大觸及範圍',
      '數位行銷資源有限，需要精準的預算分配策略'
    ]
  },
  deliverables: [
    '三個月社群內容規劃與執行（包含貼文、限動、Reels）',
    '12 支短影音內容製作（產品故事、穿搭示範、永續理念）',
    'KOL 合作策略與媒合執行（10-15 位中小型意見領袖）',
    'EDM 行銷活動規劃（6 波次主題式推播）',
    '官網購物體驗優化與 landing page 設計',
    '每週數據分析報告與月度策略檢討會議'
  ],
  constraints: {
    budget: 'NT$ 350 萬',
    timeline: '16 週執行期（策略規劃 2 週、內容製作 8 週、上線與優化 6 週）',
    requirements: [
      '所有內容須符合 B 型企業永續標準，避免過度消費主義訊息',
      '至少 30% 內容需採用真實顧客與 UGC，展現品牌真實性',
      '不得與快時尚品牌有關聯的 KOL 合作',
      '所有數位內容需符合無障礙網頁規範（WCAG 2.1 AA）',
      '優先選用台灣在地供應商與創作者'
    ]
  },
  metrics: [
    {
      name: '目標觸及人數',
      value: 180,
      unit: '萬',
      trend: 'up'
    },
    {
      name: '社群互動率',
      value: 5.8,
      unit: '%',
      trend: 'up'
    },
    {
      name: '官網轉換率',
      value: 3.2,
      unit: '%',
      trend: 'up'
    },
    {
      name: '單次獲客成本',
      value: 850,
      unit: '元',
      trend: 'down'
    },
    {
      name: '品牌認知提升',
      value: 42,
      unit: '%',
      trend: 'up'
    },
    {
      name: '影片完看率',
      value: 65,
      unit: '%',
      trend: 'up'
    }
  ],
  visuals: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1445384763658-0400939829cd?w=800',
      caption: '海洋保育 — 品牌核心價值',
      category: '品牌理念'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      caption: '環保機能服飾設計靈感',
      category: '產品視覺'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800',
      caption: '目標客群生活型態',
      category: '受眾洞察'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      caption: '數據導向的策略思考',
      category: '策略規劃'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      caption: '跨部門協作執行',
      category: '執行流程'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      caption: '創意發想工作坊',
      category: '創意發展'
    }
  ],
  keySummary: {
    objective: '透過整合性數位行銷策略，在四個月內提升品牌認知度 42%，並帶動官網銷售成長，預期創造 NT$ 1,200 萬的歸因營收。鎖定 25-35 歲注重永續生活的都會消費者，以真實故事與社群互動建立品牌信任度。',
    approach: '採用多管道整合策略，結合中小型 KOL 合作、使用者原創內容與教育性短影音，在 Instagram、TikTok 與 Facebook 建立品牌社群。透過透明的供應鏈故事與海洋保育倡議，強化品牌的永續承諾與差異化定位。',
    expectedOutcome: '達成 180 萬觸及人數、5.8% 社群互動率，建立綠生活品牌在環保時尚領域的領導地位。建立長期的社群基礎，培養品牌忠誠度，為後續的會員計畫與循環經濟模式奠定基礎。'
  }
};
