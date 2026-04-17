const params    = new URLSearchParams(window.location.search);
const done      = params.get("done");
const already   = params.get("already");
const condition = params.get("condition");

// 修正 1：自動抓取當前目錄路徑，確保 Cookie 在 GitHub Pages 專案資料夾內通用
const currentPath = window.location.pathname.replace('thank.html', '');

if (done === "1") {
  // ── 正常完成流程 ─────────────────────────────────────────
  
  // 修正 2：明確指定 path 為 currentPath，避免在 root 網域發生衝突
  document.cookie = `survey_completed=true; path=${currentPath}; max-age=7776000; SameSite=Lax`;

  if (condition) localStorage.setItem("completed_condition", condition);

  localStorage.removeItem("condition");
  localStorage.removeItem("assign_time");

  document.body.innerHTML = `
    <div class="card" style="margin:100px auto;text-align:center;">
      <h1>感謝您的填答！</h1>
      <p>您的資料已成功提交，現在可以關閉此分頁。</p>
    </div>`;

} else if (already === "1" || localStorage.getItem("completed_condition")) {
  // 修正 3：增加對 localStorage 的檢查，雙重防護更穩健
  document.body.innerHTML = `
    <div class="card" style="margin:100px auto;text-align:center;">
      <h1>您已完成本研究</h1>
      <p>感謝您的參與！您的資料已記錄完畢，不需要再次填寫。</p>
      <p class="note">如有疑問，請聯絡研究人員。</p>
    </div>`;

} else {
  document.body.innerHTML = `
    <div class="card" style="margin:100px auto;text-align:center;">
      <h1>提示</h1>
      <p>未偵測到完成信號。若您已填寫完畢，請直接關閉視窗。</p>
    </div>`;
}
