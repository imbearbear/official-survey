(function() {
  const params    = new URLSearchParams(window.location.search);
  const done      = params.get("done");
  const already   = params.get("already");
  const condition = params.get("condition");

  // 取得正確的路徑用於 Cookie
  const getPath = () => {
    const p = window.location.pathname.split("/");
    p.pop();
    return p.join("/") + "/";
  };

  const setContent = (title, msg, note) => {
    const card = document.querySelector(".card");
    if (card) {
      card.innerHTML = `
        <h1>${title}</h1>
        <p>${msg}</p>
        <p class="note">${note}</p>
      `;
    }
  };

  if (done === "1") {
    // 1. 寫入雙重路徑 Cookie，確保 index.html 能讀到
    const path = getPath();
    document.cookie = `survey_completed=true; path=${path}; max-age=7776000; SameSite=Lax`;
    document.cookie = `survey_completed=true; path=/; max-age=7776000; SameSite=Lax`;

    // 2. 紀錄完成組別
    if (condition) localStorage.setItem("completed_condition", condition);

    // 3. 清除進度暫存，這步最重要！
    localStorage.removeItem("condition");
    localStorage.removeItem("assign_time");

    console.log("[Survey] 完成標記已寫入，組別:", condition || "未指定");

    setContent(
      "感謝您的填答！",
      "您的資料已成功提交，現在可以關閉此分頁。",
      "您可以安全地關閉此視窗"
    );

  } else if (already === "1" || localStorage.getItem("completed_condition")) {
    // 加上 localStorage 檢查，防止重複填答
    setContent(
      "您已完成本研究",
      "感謝您的參與！您的資料已記錄完畢，不需要再次填寫。",
      "如有疑問，請聯絡研究人員。"
    );
  } else {
    setContent(
      "提示",
      "未偵測到完成信號。若您已填寫完畢，請直接關閉視窗。",
      "如有疑問，請聯絡研究人員。"
    );
  }
})();
