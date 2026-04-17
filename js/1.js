function getCookiePath() {
  const parts = window.location.pathname.split("/");
  parts.pop();
  return parts.join("/") + "/";
}
 
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const path = getCookiePath();
  // 同時寫入精確路徑與根路徑
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
 
function getCookie(name) {
  const match = document.cookie.split("; ").find(c => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
 
// ─── 更新頁面內容 ─────────────────────────────────────────
function setContent(title, message, note) {
  const titleEl   = document.getElementById("main-title");
  const msgEl     = document.getElementById("sub-message");
  const noteEls   = document.querySelectorAll(".note");
 
  if (titleEl) titleEl.textContent = title;
  if (msgEl)   msgEl.textContent   = message;
  if (noteEls.length > 0 && note) noteEls[0].textContent = note;
}
 
// ─── 開發者模式 ───────────────────────────────────────────
function checkDevMode(params) {
  if (params.get("dev") === "1") {
    const path = getCookiePath();
    document.cookie = `survey_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    document.cookie = `survey_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    localStorage.removeItem("completed_condition");
    localStorage.removeItem("condition");
    localStorage.removeItem("assign_time");
    console.log("[Dev] 已從 thank.html 重置所有狀態");
    setContent("開發者模式", "已重置所有填答紀錄，請返回 index.html 測試。", "");
    return true;
  }
  return false;
}
 
// ─── 主程式 ───────────────────────────────────────────────
(function () {
  const params    = new URLSearchParams(window.location.search);
 
  // 開發者模式
  if (checkDevMode(params)) return;
 
  const done      = params.get("done");
  const already   = params.get("already");
  const condition = params.get("condition");
 
  if (done === "1") {
    // ── 正常完成流程 ──────────────────────────────────────
    // 1. 寫入長效 Cookie（90天），雙路徑確保 index.html 讀得到
    setCookie("survey_completed", "true", 90);
 
    // 2. LocalStorage 也記錄，作為 Cookie 失效時的備援
    if (condition) {
      localStorage.setItem("completed_condition", condition);
    } else {
      localStorage.setItem("completed_condition", "unknown");
    }
 
    // 3. 清除進度暫存，防止再次進入 index.html 時出現「繼續填答」
    localStorage.removeItem("condition");
    localStorage.removeItem("assign_time");
 
    console.log("[Survey] 完成標記已寫入，組別:", condition || "未指定");
 
    // 4. 顯示感謝畫面（使用 HTML 既有元素，避免 CSS 失效）
    setContent(
      "感謝您的填答！",
      "您的資料已成功提交，現在可以關閉此分頁。",
      "您可以安全地關閉此視窗"
    );
 
  } else if (already === "1") {
    // ── 已完成者再次進入 ──────────────────────────────────
    setContent(
      "您已完成本研究",
      "感謝您的參與！您的資料已記錄完畢，不需要再次填寫。",
      "如有疑問，請聯絡研究人員。"
    );
 
  } else {
    // ── 直接打開 thank.html 沒有任何參數 ─────────────────
    setContent(
      "提示",
      "未偵測到完成信號。若您已填寫完畢，請直接關閉視窗。",
      "如有疑問，請聯絡研究人員。"
    );
  }
})();
