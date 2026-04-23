let selectedDate = "";
let currentYear;
let currentMonth;

// ===== 計算 =====
function calc() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const base = Number(document.getElementById("type").value);
  const manual = document.getElementById("manual").checked;

  if (manual) {
    document.getElementById("result").innerText =
      document.getElementById("manualPay").value + " 円";
    return;
  }

  let s = new Date("2000-01-01 " + start);
  let e = new Date("2000-01-01 " + end);

  let total = 0;
  let minutes = 0;

  while (s < e) {
    let m = 1.0;

    if (s.getHours() >= 22 || s.getHours() < 5) m += 0.25;
    if (minutes >= 540) m += 0.25;

    total += base * m * 0.25;
    minutes += 15;
    s.setMinutes(s.getMinutes() + 15);
  }

  if (minutes < 240) total = base * 4;

  document.getElementById("result").innerText =
    Math.round(total) + " 円";
}

// 手入力切替
document.getElementById("manual").addEventListener("change", function() {
  document.getElementById("manualBox").style.display =
    this.checked ? "block" : "none";
});

// ===== カレンダー =====
function generateCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  const week = ["日","月","火","水","木","金","土"];

  week.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "week";
    div.innerText = w;

    if (i === 0) div.classList.add("sun");
    if (i === 6) div.classList.add("sat");

    calendar.appendChild(div);
  });

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += "<div></div>";
  }

  for (let d = 1; d <= lastDate; d++) {
    const div = document.createElement("div");
    div.className = "day";
    div.innerText = d;

    div.onclick = () => {
      selectedDate = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

      document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));
      div.classList.add("selected");
    };

    calendar.appendChild(div);
  }
}

// ===== 月変更 =====
document.getElementById("monthPicker").addEventListener("change", function() {
  const val = this.value;
  if (!val) return;

  const [y, m] = val.split("-");
  currentYear = Number(y);
  currentMonth = Number(m) - 1;

  generateCalendar();
  renderList();
});

// ===== 保存 =====
function saveData() {
  if (!selectedDate) {
    alert("日付を選択してください");
    return;
  }

  const result = document.getElementById("result").innerText;
  if (!result) {
    alert("金額を計算してください");
    return;
  }

  const value = Number(result.replace(" 円",""));

  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");
  data.push({ date: selectedDate, value });
  localStorage.setItem("salaryData", JSON.stringify(data));

  renderList();

  // 🔥 ここからリセット処理
  document.getElementById("start").value = "";
  document.getElementById("end").value = "";
  document.getElementById("type").value = "1250";
  document.getElementById("manual").checked = false;
  document.getElementById("manualBox").style.display = "none";
  document.getElementById("manualPay").value = "";
  document.getElementById("result").innerText = "";
  selectedDate = "";
}

// ===== 一覧 =====
function renderList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  let monthTotal = 0;
  const monthStr = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}`;

  data.forEach((item, index) => {
    if (item.date.startsWith(monthStr)) {
      monthTotal += item.value;

      const li = document.createElement("li");
      li.className = "list-item";

      li.innerHTML = `
        <span>${item.date} : ${item.value}円</span>
        <div class="button-group">
          <button class="small-btn" onclick="editData(${index})">編集</button>
          <button class="small-btn" onclick="deleteData(${index})">削除</button>
        </div>
      `;

      list.appendChild(li);
    }
  });

  document.getElementById("total").innerText =
    `${currentMonth + 1}月の合計：${monthTotal}円`;
}

// ===== 編集 =====
function editData(index) {
  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  const newVal = prompt("金額を変更", data[index].value);

  if (newVal !== null) {
    data[index].value = Number(newVal);
    localStorage.setItem("salaryData", JSON.stringify(data));
    renderList();
  }
}

// ===== 削除 =====
function deleteData(index) {
  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  data.splice(index, 1);
  localStorage.setItem("salaryData", JSON.stringify(data));
  renderList();
}

// 起動時
window.onload = function() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();

  document.getElementById("monthPicker").value =
    now.toISOString().slice(0,7);

  generateCalendar();
  renderList();
};

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}