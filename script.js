// === CONFIG ===
const sheetID = "1f4qn9xI0iSxyQz_JRuP3RrCuPnXO3BV12KopVKI3qks";
const sheetName = "Sheet1";
const query = encodeURIComponent("SELECT A,B"); // A=Name, B=Stars
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}&tq=${query}`;
const CACHE_KEY = "studentStarsData_v1";

const tbody = document.querySelector("#studentTable tbody");

function renderRows(studentsSorted) {
  tbody.innerHTML = "";
  studentsSorted.forEach((s, i) => {
    // Top 3 medals
    let rankDisp = i + 1;
    if (i === 0) rankDisp = "🥇";
    else if (i === 1) rankDisp = "🥈";
    else if (i === 2) rankDisp = "🥉";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${rankDisp}</td>
      <td title="${s.name}">${s.name}</td>
      <td class="stars">${s.stars}</td>
      <td>${s.total}</td>
    `;
    tbody.appendChild(tr);
  });
}

function rowsToStudents(rows) {
  const list = [];
  rows.forEach(r => {
    const name = r.c?.[0]?.v || ""; // Column A
    const stars = r.c?.[1]?.v || ""; // Column B
    if (name.trim() === "" && stars.trim() === "") return;
    const total = (stars.match(/🌟/g) || []).length;
    list.push({ name, stars, total });
  });
  // Sort by total desc, then by name asc for deterministic order
  list.sort((a, b) => (b.total - a.total) || a.name.localeCompare(b.name));
  return list;
}

function displayFromLocal() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    const students = rowsToStudents(parsed);
    renderRows(students);
    return true;
  } catch {
    return false;
  }
}

function fetchAndRender() {
  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows || [];
      // Save for offline
      localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
      const students = rowsToStudents(rows);
      renderRows(students);
    })
    .catch(() => {
      console.warn("Offline or fetch failed — showing last saved data.");
      if (!displayFromLocal()) {
        tbody.innerHTML = `<tr><td colspan="4">No data available offline yet</td></tr>`;
      }
    });
}

// Try online first, fall back to local cache if needed.
fetchAndRender();
