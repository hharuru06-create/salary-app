let selectedDate = "";
let currentYear = new Date().getFullYear();

/* 手入力 */
document.getElementById("manual").addEventListener("change", function () {
  document.getElementById("manualBox").style.display =
    this.checked ? "block" : "none";
});

/* 計算 */
function calc() {

  // ★ 追加（時間未入力チェック）
  if (!document.getElementById("manual").checked) {
    if (!start.value || !end.value) {
      return alert("開始と終了時間を入力してください");
    }
  }

  if (document.getElementById("manual").checked) {

    // ★ 手入力もチェック
    if (!manualPay.value) {
      return alert("金額を入力してください");
    }

    document.getElementById("result").innerText =
      document.getElementById("manualPay").value + " 円";
    return;
  }

  let s = new Date("2000 " + start.value);
  let e = new Date("2000 " + end.value);

  // ★ 開始 > 終了チェック
  if (s >= e) {
    return alert("終了時間は開始時間より後にしてください");
  }

  let total = 0;

  while (s < e) {
    total += Number(type.value) * 0.25;
    s.setMinutes(s.getMinutes() + 15);
  }

  document.getElementById("result").innerText =
    Math.round(total) + " 円";
}

/* 保存 */
function saveData() {
  if (!selectedDate) return alert("日付を選択選択してください");

  let val = Number(
    document.getElementById("result").innerText.replace(" 円", "")
  );

  if (!val || val === 0) return alert("金額を入力してください");

  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  data.push({
    id: Date.now() + Math.random(), // ★完全一意ID
    date: selectedDate,
    value: val
  });

  localStorage.setItem("salaryData", JSON.stringify(data));

  renderList();

  // ===== リセット =====
  document.getElementById("start").value = "";
  document.getElementById("end").value = "";
  document.getElementById("type").selectedIndex = 0;
  document.getElementById("manual").checked = false;
  document.getElementById("manualBox").style.display = "none";
  document.getElementById("manualPay").value = "";
  document.getElementById("result").innerText = "";
}

/* カレンダー */
function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();

  const weeks = ["日","月","火","水","木","金","土"];

  weeks.forEach((w, i) => {
    let d = document.createElement("div");
    d.innerText = w;
    d.className = "week";
    if(i === 0) d.classList.add("sun");
    if(i === 6) d.classList.add("sat");
    cal.appendChild(d);
  });

  for(let i=0;i<firstDay;i++){
    cal.appendChild(document.createElement("div"));
  }

  for (let i = 1; i <= lastDate; i++) {
    let d = document.createElement("div");
    d.className = "day";
    d.innerText = i;

    d.onclick = () => {
      selectedDate = `${year}-${String(month).padStart(2,"0")}-${String(i).padStart(2,"0")}`;
      document.querySelectorAll(".day").forEach(x=>x.classList.remove("selected"));
      d.classList.add("selected");
    };

    cal.appendChild(d);
  }
}

/* 一覧 */
function renderList() {
  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  let sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  let list = document.getElementById("list");
  list.innerHTML = "";

  let total = 0;

  sorted.forEach((d) => {
    total += d.value;

    let li = document.createElement("li");
    li.className = "list-item";

    li.innerHTML = `
      <span>${d.date} : ${d.value}円</span>
      <div class="btn-group">
        <button class="btn-small" onclick="editData('${d.id}')">編集</button>
        <button class="btn-small" onclick="deleteData('${d.id}')">削除</button>
      </div>
    `;

    list.appendChild(li);
  });

  document.getElementById("total").innerText = "合計：" + total + "円";
}

/* 編集 */
function editData(id) {
  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  let item = data.find(d => String(d.id) === String(id));

  if (!item) return;

  let newVal = prompt("金額を編集", item.value);
  if (newVal !== null) {
    item.value = Number(newVal);

    localStorage.setItem("salaryData", JSON.stringify(data));
    renderList();
  }
}

/* 削除 */
function deleteData(id) {
  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  data = data.filter(d => String(d.id) !== String(id));

  localStorage.setItem("salaryData", JSON.stringify(data));
  renderList();
}

/* ページ切替 */
function showPage(p) {
  document.getElementById("calcPage").style.display = p==="calc"?"block":"none";
  document.getElementById("reportPage").style.display = p==="report"?"block":"none";
  document.getElementById("monthPage").style.display = "none";

  document.getElementById("tabCalc").classList.toggle("active", p==="calc");
  document.getElementById("tabReport").classList.toggle("active", p==="report");

  if (p === "report") loadReport();
}

/* レポート */
function loadReport() {
  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  let m = Array(12).fill(0);
  let total = 0;

  data.forEach(d => {
    let dt = new Date(d.date);
    if (dt.getFullYear() == currentYear) {
      m[dt.getMonth()] += d.value;
      total += d.value;
    }
  });

  document.getElementById("yearTotal").innerText =
    "合計：" + total + "円";

  let chart = document.getElementById("chart");
  chart.innerHTML = "";

  const max = Math.max(...m, 1);

  m.forEach((v, i) => {
    let wrap = document.createElement("div");
    wrap.className = "bar-wrap";

    let bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (v / max * 100) + "px";
    bar.innerText = v;

    let label = document.createElement("div");
    label.className = "bar-month";
    label.innerText = (i + 1) + "月";

    wrap.appendChild(bar);
    wrap.appendChild(label);

    wrap.onclick = () => showMonth(i);

    chart.appendChild(wrap);
  });
}

/* 月詳細 */
function showMonth(month) {
  document.getElementById("reportPage").style.display = "none";
  document.getElementById("monthPage").style.display = "block";

  let list = document.getElementById("monthList");
  list.innerHTML = "";

  let data = JSON.parse(localStorage.getItem("salaryData") || "[]");

  // ★ 古い順に並び替え
  data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

  data.forEach(d => {
    let dt = new Date(d.date);
    if (dt.getFullYear() == currentYear && dt.getMonth() == month) {
      let li = document.createElement("li");
      li.innerText = d.date + " : " + d.value + "円";
      list.appendChild(li);
    }
  });
}

/* 戻る */
function backToReport() {
  document.getElementById("monthPage").style.display = "none";
  document.getElementById("reportPage").style.display = "block";
}

/* 初期 */
window.onload = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");

  document.getElementById("monthPicker").value = `${y}-${m}`;

  const yearSelect = document.getElementById("yearSelect");

  for (let i = 2020; i <= 2030; i++) {
    let opt = document.createElement("option");
    opt.value = i;
    opt.innerText = i + "年";
    yearSelect.appendChild(opt);
  }

  yearSelect.value = y;

  yearSelect.onchange = () => {
    currentYear = Number(yearSelect.value);
    loadReport();
  };

  renderCalendar();
  renderList();
};