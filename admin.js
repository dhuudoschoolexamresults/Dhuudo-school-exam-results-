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
      <th>Roll Number</th><th>Name</th><th>Exam</th>
      <th>Biology</th><th>Chemistry</th><th>Mathematics</th><th>English</th><th>Action</th>
    </tr></thead><tbody>
    ${filtered.map((r, i) => {
      const originalIndex = data.indexOf(r);
      return `<tr>
        <td>${esc(r.id)}</td><td>${esc(r.name)}</td><td>${esc(r.exam)}</td>
        <td>${r.subjects?.Biology ?? ""}</td><td>${r.subjects?.Chemistry ?? ""}</td>
        <td>${r.subjects?.Mathematics ?? ""}</td><td>${r.subjects?.English ?? ""}</td>
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
    subjects: {
      Biology: Number(document.getElementById("newBiology").value || 0),
      Chemistry: Number(document.getElementById("newChemistry").value || 0),
      Mathematics: Number(document.getElementById("newMathematics").value || 0),
      English: Number(document.getElementById("newEnglish").value || 0)
    }
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
  ["newBiology","newChemistry","newMathematics","newEnglish"].forEach(id => document.getElementById(id).value = 0);
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
      subjects: {
        Biology: Number(r["Biology"] || 0),
        Chemistry: Number(r["Chemistry"] || 0),
        Mathematics: Number(r["Mathematics"] || r["Maths"] || 0),
        English: Number(r["English"] || 0)
      }
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
  const csv = "Student ID,Student Name,Exam,Biology,Chemistry,Mathematics,English\nDH-2026-001,Ahmed Ali,Final,85,78,80,75\n";
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Dhuudo_Results_Template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

render();
