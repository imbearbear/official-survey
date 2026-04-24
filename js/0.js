//github正式版本
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
 
const RESUME_MS = 24 * 60 * 60 * 1000; // 24小時內可繼續填答
 
// 正確解析 cookie
function getCookie(name) {
  const match = document.cookie.split("; ").find(c => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
 
function getSurveyById(id) {
  return surveys.find(s => s.id === id) || null;
}
 
// 統一跳轉邏輯，確保帶上 condition 參數
function redirect(survey) {
  setTimeout(() => {
    // 直接使用陣列中定義好的完整網址，不再額外拼接參數
    window.location.href = survey.url;
  }, 800);
}
 
function showResumeUI(survey) {
  document.querySelector(".card").innerHTML = `
    <h1>繼續填答問卷</h1>
    <p>偵測到您之前已開始填答，尚未完成。</p>
    <p class="note">請點擊下方按鈕以回到您剛才的進度。</p>
    <div class="btn-group">
      <button class="btn-primary" onclick="continueResume('${survey.id}', '${survey.url}')">
        繼續填答
      </button>
    </div>
  `;
}
 
// 2. 修正繼續填答：同樣直接使用 url，不要再加參數
function continueResume(id, url) {
  window.location.href = url;
}
 
function resetAndNew() {
  localStorage.removeItem("condition");
  localStorage.removeItem("assign_time");
  assignNew();
}
 
// 改為純隨機抽籤邏輯
function assignNew() {
  // 從 12 組中隨機挑選一組
  const picked = surveys[Math.floor(Math.random() * surveys.length)];
 
  // 記錄本次分配，供中途退出恢復使用
  localStorage.setItem("condition",   picked.id);
  localStorage.setItem("assign_time", Date.now().toString());
 
  console.log("隨機分派組別:", picked.id);
  redirect(picked);
}
 
$(document).ready(function () {
  // 1. 檢查是否已完成（透過 Cookie 或 LocalStorage 雙重防護）
  const isCompleted = getCookie("survey_completed") || localStorage.getItem("completed_condition");
  
  if (isCompleted) {
    window.location.href = "thank.html?already=1";
    return;
  }
 
  // 2. 檢查是否有進行中的紀錄
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
 
  // 3. 無紀錄或紀錄過期，執行新分派
  if (savedCondition) {
    localStorage.removeItem("condition");
    localStorage.removeItem("assign_time");
  }
  assignNew();
});
