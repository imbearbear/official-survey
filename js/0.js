const surveys = [
  { id: "E1_A1B1C1", url: "https://forms.fillout.com/t/d9vkYZ4H94us?condition=E1_A1B1C1" },
  { id: "E1_A1B1C2", url: "https://forms.fillout.com/t/rkQVgYQcCRus?condition=E1_A1B1C2" },
  { id: "E1_A1B2C1", url: "https://forms.fillout.com/t/8V2GYVa5VYus?condition=E1_A1B2C1" },
  { id: "E1_A1B2C2", url: "https://forms.fillout.com/t/122N7tnu1vus?condition=E1_A1B2C2" },
  { id: "E1_A2B1C1", url: "https://forms.fillout.com/t/bQXGdzHAWZus?condition=E1_A2B1C1" },
  { id: "E1_A2B1C2", url: "https://forms.fillout.com/t/gbnJAFmcE5us?condition=E1_A2B1C2" },
  { id: "E1_A2B2C1", url: "https://forms.fillout.com/t/qYNv47YD33us?condition=E1_A2B2C1" },
  { id: "E1_A2B2C2", url: "https://forms.fillout.com/t/hSXYFvrVPbus?condition=E1_A2B2C2" },
  { id: "E2_A1B1",   url: "https://forms.fillout.com/t/ouu5wcr9hDus?condition=E2_A1B1" },
  { id: "E2_A1B2",   url: "https://forms.fillout.com/t/4URLVZnyi4us?condition=E2_A1B2" },
  { id: "E2_A2B1",   url: "https://forms.fillout.com/t/ak6R3cP4XYus?condition=E2_A2B1" },
  { id: "E2_A2B2",   url: "https://forms.fillout.com/t/cL7L62Mma3us?condition=E2_A2B2" },
];
 
const RESUME_MS = 24 * 60 * 60 * 1000; // 24 小時內可恢復填答
 
// ─── Cookie 工具（修正 path 問題）─────────────────────────
/**
 * 自動取得正確的 cookie path
 * 例如：在 /official-survey/ 目錄下，path 應為 /official-survey/
 * 而非 /，否則 GitHub Pages 子目錄讀不到
 */
function getCookiePath() {
  // 取得當前路徑的「目錄」部分
  const parts = window.location.pathname.split("/");
  parts.pop(); // 移除檔名
  return parts.join("/") + "/";
}
 
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const path = getCookiePath();
  // 同時設定精確路徑與根路徑，確保跨頁面讀取
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
 
function getCookie(name) {
  const match = document.cookie.split("; ").find(c => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
 
// ─── 工具函式 ───────────────────────────────────────────────
function getSurveyById(id) {
  return surveys.find(s => s.id === id) || null;
}
 
/**
 * 跳轉至問卷
 * condition 參數讓 Fillout 的「提交後跳轉」能帶回正確的組別資訊
 * 注意：Fillout 端請將「提交後跳轉 URL」設為：
 *   https://你的網址/thank.html?done=1&condition={condition的填答值}
 */
function redirect(survey) {
  setTimeout(() => {
    // 檢查原始 URL 是否已經包含問號
    const separator = survey.url.includes('?') ? '&' : '?';
    // 只有在 URL 還沒包含該 condition 時才補上
    const finalUrl = survey.url.includes('condition=') 
      ? survey.url 
      : survey.url + separator + "condition=" + encodeURIComponent(survey.id);
    
    window.location.href = finalUrl;
  }, 600);
}

// ─── UI 函式 ───────────────────────────────────────────────
function showResumeUI(survey) {
  // 注意：移除「重新開始」按鈕，避免同一人填多份不同組別問卷造成數據污染
  document.querySelector(".card").innerHTML = `
    <h1>繼續填答問卷</h1>
    <p>偵測到您之前已開始填答，尚未完成。<br>點擊下方按鈕繼續填答。</p>
    <p class="note">如填答過程遇到問題，請聯絡研究人員。</p>
    <div class="btn-group" style="margin-top:1.5rem;">
      <button class="btn-primary" onclick="continueResume('${survey.id}', '${survey.url}')">
        繼續填答
      </button>
    </div>
  `;
}
 
function showLoadingUI(message) {
  document.querySelector(".card").innerHTML = `
    <h1>${message}</h1>
    <p class="note">請稍候，即將跳轉至問卷頁面……</p>
  `;
}
 
// ─── 流程函式 ─────────────────────────────────────────────
function continueResume(id, url) {
  window.location.href = url + "?condition=" + encodeURIComponent(id);
}
 
function clearProgress() {
  localStorage.removeItem("condition");
  localStorage.removeItem("assign_time");
}
 
function assignNew() {
  const picked = surveys[Math.floor(Math.random() * surveys.length)];
  localStorage.setItem("condition", picked.id);
  localStorage.setItem("assign_time", Date.now().toString());
  console.log("[Survey] 隨機分派組別:", picked.id);
  showLoadingUI("跳轉中……");
  redirect(picked);
}
 
// ─── 開發者模式 ───────────────────────────────────────────
/**
 * 在 URL 加上 ?dev=1 可重置所有狀態，方便測試
 * 例如：https://你的網址/index.html?dev=1
 * 上線後不需要移除，一般受試者不會知道這個參數
 */
function checkDevMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("dev") === "1") {
    clearProgress();
    // 清除所有 survey 相關 cookie
    const cookiePath = getCookiePath();
    document.cookie = `survey_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${cookiePath}`;
    document.cookie = `survey_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    localStorage.removeItem("completed_condition");
    console.log("[Dev] 已重置所有填答狀態");
    // 移除 dev 參數後重新載入
    window.location.href = window.location.pathname;
    return true;
  }
  return false;
}
 
// ─── 主程式 ───────────────────────────────────────────────
$(document).ready(function () {
  // 開發者模式優先處理
  if (checkDevMode()) return;
 
  // 1. 防重複填答：Cookie 與 LocalStorage 雙重檢查
  const cookieCompleted = getCookie("survey_completed");
  const lsCompleted     = localStorage.getItem("completed_condition");
 
  if (cookieCompleted || lsCompleted) {
    window.location.href = "thank.html?already=1";
    return;
  }
 
  // 2. 檢查是否有未完成的進行中紀錄
  const savedCondition = localStorage.getItem("condition");
  const assignTime     = parseInt(localStorage.getItem("assign_time") || "0", 10);
  const elapsed        = Date.now() - assignTime;
 
  if (savedCondition && elapsed < RESUME_MS) {
    const survey = getSurveyById(savedCondition);
    if (survey) {
      showResumeUI(survey);
      return;
    }
  }
 
  // 3. 紀錄不存在或已過期 → 清除並分派新問卷
  if (savedCondition) {
    console.log("[Survey] 紀錄已過期，重新分派");
    clearProgress();
  }
 
  assignNew();
});
