# Community Intelligence Layer — 雙軌進度追蹤
## 最後更新：2026.04.14

---

## 核心認知：這是兩個產品，一條路

| 軌道 | 是什麼 | 目的 | 優先級 |
|------|--------|------|--------|
| Track A: GSC Taipei 內部 OS | Hub 的營運系統——onboarding、專案追蹤、行政自動化、知識傳承 | 真正解決問題、產生可展示的成果 | 核心 |
| Track B: WhatsApp 對外助手 | 面向所有社群經營者的 AI 營運顧問 + 知識飛輪 | Credibility、network、content、proprietary data 收集 | 放大器 |

Track A 是引擎。Track B 是擴音器。沒有 A，B 只是空話。沒有 B，A 只是內部工具。

---

## Track A: GSC Taipei 內部 OS

### 已完成 ✅
- [x] WhatsApp Cloud API 串接（Meta 直連）
- [x] Node.js server 部署到 Zeabur
- [x] Supabase 資料庫建立（users + interactions）
- [x] Claude API 串接
- [x] Webhook 超時修復 + message dedup
- [x] Context window 限制（最近 10 則）
- [x] 每日訊息限制（50 則/人/天）
- [x] Onboarding flow（四步驟）
- [x] 基本對話能力
- [x] 知識庫大更新：global cases + real cases + v2 知識庫
- [x] 排版修復（WhatsApp formatting rules）
- [x] Multi-player brain 定位植入 system prompt
- [x] 模型可切換（ANTHROPIC_MODEL env var）
- [x] Analytics endpoint + health check
- [x] Error resilience + long message splitting

### Phase 2（Week 3-4）— Hub 內部功能
- [ ] 時序提醒系統：根據 GSC 營運行事曆自動推送（招募季、Impact Report 季、換屆期）
- [ ] 專案追蹤：每兩週 ping 各 DRI 更新進度 → 自動彙整 status report
- [ ] Onboarding 自動化：新成員加入 → 系統自動引導完整流程
- [ ] Meeting 管理：agenda 提醒、會後紀要自動整理
- [ ] 合作邀約處理：收到 email/DM → 分類 → 草擬回覆 → tag 負責人

### Phase 3（Month 2-3）— 深度營運
- [ ] Community Memory：歷屆決策 log + 專案 recap 可查詢
- [ ] Alumni 連結系統：根據需求配對合適的 alumni mentor
- [ ] IG / LinkedIn 內容排程建議
- [ ] 年度 Impact Report 自動數據收集
- [ ] 跨 Hub 知識共享機制

---

## Track B: WhatsApp 對外助手

### 已完成 ✅
- [x] Bot 上線運作
- [x] 基本對話和 onboarding 功能
- [x] 全球案例知識庫注入（解決冷啟動）
- [x] Multi-player brain 定位 + 差異化回答
- [x] 排版修復

### 本週要做 🔄
- [ ] 3-5 人內部測試
- [ ] 測試所有核心場景（自我介紹、營運建議、中英文、prompt injection）

### Phase 2（Week 3-4）— 首次對外
- [ ] 10 人 beta 測試（GSC 全球網絡中找最常抱怨「營運好累」的人）
- [ ] 第一篇 LinkedIn 文章（有真實使用數據和 feedback 後再發）
- [ ] 開始收集 proprietary data（使用者的問題、做法、feedback）
- [ ] Analytics 每週 review

### Phase 3（Month 2-3）— 擴大
- [ ] 50 人使用
- [ ] 第二篇 LinkedIn 文章（分享 learnings + 數據）
- [ ] 個人化推送機制（根據 profile 和時機）
- [ ] Community Health Audit 工具
- [ ] GitHub 開源

---

## Google Drive 資料整理計畫

### 方式：用 Claude 批量整理（最高效）

1. 從 GSC Taipei Google Drive 下載以下類型的文件：
   - Impact Reports（歷屆）
   - 專案 recap / 事後回顧
   - 活動企劃書
   - 會議紀錄中的重要決策
   - Onboarding 文件
   - 合作夥伴溝通紀錄

2. 開一個 Claude 對話，用這個 prompt 批量整理：

```
我有一批社群組織的內部文件。請幫我提取可以作為 AI 知識庫的內容。

規則：
1. 格式：Case: [名稱] → Problem → Approach → Result → Key Learning
2. 去除所有個人姓名、手機號碼、email
3. 去除內部爭議或敏感討論
4. 只保留對其他社群有參考價值的營運經驗
5. 用英文輸出
6. 每個案例控制在 5-8 行

文件內容：
[貼上文件]
```

3. 審查輸出 → 確認沒有敏感資訊 → 存為 .md 檔案 → 放到 knowledge/ 資料夾

### 預估時間：2-3 小時可處理 20-30 份文件

---

## 知識庫檔案結構（目標）

```
knowledge/
├── community-ops.md          # 營運 best practices + 模板 + 對話規則
├── real-cases.md             # 全球 GSC hub 案例（從公開資料整理）
├── taipei-hub.md             # GSC Taipei 專屬資訊（公開可分享的）
└── (未來) user-contributed.md # 使用者貢獻的案例（經審核後加入）
```

---

## LinkedIn 發文計畫

| 篇數 | 時機 | 主題 | 前提條件 |
|------|------|------|---------|
| 第 1 篇 | 知識庫完善 + 10 人測試後 | 為什麼社群需要 multi-player brain | Bot 穩定 + 有真實 feedback |
| 第 2 篇 | 50 人使用後 | Building in public: 我踩的坑 | 有使用數據和具體 learnings |
| 第 3 篇 | 功能擴展後 | 從 chatbot 到社群 OS 的進化 | Track A 的內部功能上線 |
| 第 4 篇 | 開源時 | GitHub 開源 + playbook | Code 穩定 + 文件完整 |
