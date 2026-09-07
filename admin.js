const KEY = "dhuudoResults";

function getResults(){
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch(e){ return []; }
}
function saveResults(data){
  localStorage.setItem(KEY, JSON.stringify(data));
}
function esc(v){
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
function subjectsOf(r){
  return r.subjects || {};
}
const SUBJECTS = [
  "Islamic", "Arabic", "Biology", "Chemistry", "Physics",
  "Mathematics", "Business", "Geography", "History", "Af-Somali", "English"
];
function totalAndAverage(r){
  const marks = SUBJECTS.map(s => Number(subjectsOf(r)[s] ?? 0));
  const total = marks.reduce((a,b)=>a+b,0);
  return { total, average: total / SUBJECTS.length };
}
function isPass(r){
  return totalAndAverage(r).average >= 50;
}
function getPosition(r, data){
  const sameExam = data.filter(x => x.exam === r.exam);
  const ranked = sameExam.map(x => ({id:String(x.id), average:totalAndAverage(x).average}))
    .sort((a,b)=>b.average-a.average);
  const pos = ranked.findIndex(x => x.id.toLowerCase() === String(r.id).toLowerCase());
  return pos < 0 ? "-" : pos + 1;
}
function render(){
  const data = getResults();
  const q = (document.getElementById("searchBox")?.value || "").trim().toLowerCase();
  const filtered = data.filter(r =>
    String(r.id).toLowerCase().includes(q) ||
    String(r.name).toLowerCase().includes(q)
  );

  const uniqueStudents = new Set(data.map(r => String(r.id).toLowerCase())).size;
  document.getElementById("totalStudents").textContent = uniqueStudents;
  document.getElementById("totalResults").textContent = data.length;
  document.getElementById("finalResults").textContent = data.filter(r => r.exam === "Final").length;
  document.getElementById("otherResults").textContent = data.filter(r => r.exam !== "Final").length;

  const el = document.getElementById("adminTable");
  if(!filtered.length){
    el.innerHTML = '<p class="empty">No results found.</p>';
    return;
  }

  el.innerHTML = `<div class="small-table"><table>
    <thead><tr>
      <th>Roll Number</th><th>Name</th><th>Exam</th><th>Total</th><th>Average</th><th>Pass/Fail</th><th>Position</th><th>Action</th>
    </tr></thead><tbody>
    ${filtered.map((r) => {
      const originalIndex = data.indexOf(r);
      const {total, average} = totalAndAverage(r);
      return `<tr>
        <td>${esc(r.id)}</td><td>${esc(r.name)}</td><td>${esc(r.exam)}</td>
        <td>${total}</td><td>${average.toFixed(2)}%</td><td>${isPass(r) ? "PASS" : "FAIL"}</td><td>${getPosition(r,data)}</td>
        <td><button class="delete-one" data-index="${originalIndex}">Delete</button></td>
      </tr>`;
    }).join("")}
    </tbody></table></div>`;

  document.querySelectorAll(".delete-one").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const data = getResults();
      if(confirm(`Delete result for ${data[index]?.name || data[index]?.id || "this student"}?`)){
        data.splice(index, 1);
        saveResults(data);
        render();
      }
    });
  });
}

document.getElementById("addForm").addEventListener("submit", e => {
  e.preventDefault();
  const result = {
    id: document.getElementById("newId").value.trim(),
    name: document.getElementById("newName").value.trim(),
    exam: document.getElementById("newExam").value,
    subjects: Object.fromEntries(SUBJECTS.map(s => [s, Number(document.getElementById("new" + s.replace(/[^A-Za-z]/g, "")).value || 0)]))
  };
  if(!result.id || !result.name) return;

  const data = getResults();
  const exists = data.some(r => r.id.toLowerCase() === result.id.toLowerCase() && r.exam === result.exam);
  if(exists){
    alert("This Roll Number already has a result for this exam.");
    return;
  }
  data.push(result);
  saveResults(data);
  e.target.reset();
  SUBJECTS.forEach(s => { const el = document.getElementById("new" + s.replace(/[^A-Za-z]/g, "")); if(el) el.value = 0; });
  render();
  alert("Result saved successfully.");
});

document.getElementById("excelFile").addEventListener("change", async e => {
  const file = e.target.files[0];
  if(!file) return;
  const msg = document.getElementById("uploadMessage");
  try{
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, {type:"array"});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, {defval:""});
    const imported = rows.map(r => ({
      id: String(r["Student ID"] || r["Roll Number"] || "").trim(),
      name: String(r["Student Name"] || r["Name"] || "").trim(),
      exam: String(r["Exam"] || "Final").trim(),
      subjects: Object.fromEntries(SUBJECTS.map(s => [s, Number(r[s] || 0)]))
    })).filter(r => r.id && r.name);

    const existing = getResults();
    const map = new Map(existing.map(r => [`${r.id.toLowerCase()}|${r.exam}`, r]));
    imported.forEach(r => map.set(`${r.id.toLowerCase()}|${r.exam}`, r));
    saveResults([...map.values()]);
    render();
    msg.textContent = `${imported.length} result(s) imported successfully.`;
  }catch(err){
    msg.textContent = "Could not read this file. Check the Excel columns.";
  }
});

document.getElementById("searchBox").addEventListener("input", render);

document.getElementById("clearBtn").addEventListener("click", () => {
  if(confirm("Delete ALL results stored in this browser?")){
    localStorage.removeItem(KEY);
    render();
  }
});

document.getElementById("downloadTemplate").addEventListener("click", () => {
  const csv = "Student ID,Student Name,Exam,Islamic,Arabic,Biology,Chemistry,Physics,Mathematics,Business,Geography,History,Af-Somali,English\nDH-2026-001,Ahmed Ali,Final,85,78,80,75,82,88,79,81,77,84,90\n";
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Dhuudo_Results_Template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

render();
