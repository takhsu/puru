# puru 網站

puru 系列首頁：品牌展示與 puru CUT 下載頁。純靜態網頁（HTML／CSS／JS），沒有建置步驟，不需要任何付費服務。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 全部內容與結構 |
| `style.css` | 色彩、字體、版面（開頭有品牌色票變數） |
| `app.js` | 最上方的 `SITE` 設定區（下載、回饋、原始碼連結）＋首頁章魚動畫 |
| `assets/marks/` | 桌面與系統圖示的各尺寸原圖 |
| `assets/shot-editor.png` | 圖片編輯器示範截圖（使用虛構的示範資料） |

字體：主標題與標誌用系統的 Georgia 粗斜體（和 puru 字標同一個字型）；內文與按鈕用 Archivo，取景框的小字用 JetBrains Mono，兩者從 Google Fonts 載入。

## 上線前要補的三個連結

只改 `app.js` 最上方的 `SITE`：

```js
const SITE = {
  downloadUrl: "",   // 例："https://github.com/<帳號>/<程式庫>/releases/latest"
  downloadMeta: "Windows 10／11（64 位元）· 免安裝版 · 免費",
  feedbackUrl: "",   // 回饋信箱或表單，例如 "mailto:你的信箱"（空白時顯示「準備中」）
  sourceUrl: ""      // 原始碼程式庫網址
};
```

網址留空時，頁面會誠實顯示「下載連結準備中」，不會放壞掉的按鈕。

## 免費上線（GitHub Pages）

1. 在 GitHub 建立一個公開的程式庫（例如 `puru`），把這個資料夾的內容放到根目錄。
2. 程式庫的 Settings › Pages：Source 選 `Deploy from a branch`，Branch 選 `main`／`/ (root)`。
3. 幾分鐘後網站會在 `https://<帳號>.github.io/<程式庫>/`。
4. 安裝檔不要放在網站裡：到程式庫的 Releases 建立新版本，把 zip 當附件上傳，再把 `downloadUrl` 指向 `.../releases/latest`。
5. 想用自己的網域再到 Pages 設定 Custom domain（網域本身要另外購買，可不做）。

## 預覽

任何靜態伺服器都可以，例如在這個資料夾執行 `npx serve`。直接雙擊 `index.html` 也能看大部分內容，但部分瀏覽器會擋住本機檔案的字體與動畫。

## 設計規則（給之後修改的人）

- 底色只有三種，依序是開場章魚紅 `#CC1212`、中段白、終幕黑。紅是唯一的角色色。
- 主標題一律用 Georgia 粗斜體（英文），中文說明接在下方；中文用 700，不要用 800（系統中文字型沒有真的 800，會被硬加粗）。
- 文案裡的標準寫法是「puru CUT」。
- 首屏章魚是循環動畫（轉發條、東張西望、跳一下），取自 App 開場動畫並拿掉 puru 字樣與 CUT 藥丸。
- 滾動動效：畫面四角的取景框（時間碼、區塊名稱、進度線、百分比）、區塊標題隨滾動拉伸到位、圖片視差、內容淡入。`prefers-reduced-motion` 時全部靜止在最終狀態。
- 版權：「puru」「puru CUT」的名稱、章魚造型、圖示與動畫保留權利。
