const params    = new URLSearchParams(window.location.search);
const done      = params.get("done");
const already   = params.get("already");
const condition = params.get("condition");
 
if (done === "1") {
  // ── 正常完成流程 ─────────────────────────────────────────
  // 1. 寫入長效 Cookie（90天），讓 index.html 知道此人已完成
  document.cookie = "survey_completed=true; path=/; max-age=7776000";
 
  // 2. 記錄完成組別（方便除錯）
  if (condition) localStorage.setItem("completed_condition", condition);
 
  // 3. 清除進度暫存，防止重整後仍出現「繼續填答」
  localStorage.removeItem("condition");
  localStorage.removeItem("assign_time");
 
  // 4. 顯示感謝畫面
  document.body.innerHTML = `
    <div class="card" style="margin:100px auto;text-align:center;">
      <h1>感謝您的填答！</h1>
      <p>您的資料已成功提交，現在可以關閉此分頁。</p>
    </div>`;
 
} else if (already === "1") {
  // ── 已完成者再次進入（由 index.html 導過來）──────────────
  document.body.innerHTML = `
    <div class="card" style="margin:100px auto;text-align:center;">
      <h1>您已完成本研究</h1>
      <p>感謝您的參與！您的資料已記錄完畢，不需要再次填寫。</p>
      <p class="note">如有疑問，請聯絡研究人員。</p>
    </div>`;
 
} else {
  // ── 直接打開 thank.html 沒有任何參數 ─────────────────────
  document.body.innerHTML = `
    <div class="card" style="margin:100px auto;text-align:center;">
      <h1>提示</h1>
      <p>未偵測到完成信號。若您已填寫完畢，請直接關閉視窗。</p>
    </div>`;
}