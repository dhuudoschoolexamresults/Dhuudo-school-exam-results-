function getResults(){return JSON.parse(localStorage.getItem("dhuudoResults")||"[]")}
function saveResults(x){localStorage.setItem("dhuudoResults",JSON.stringify(x))}
function render(){
  const data=getResults(), el=document.getElementById("adminTable");
  if(!data.length){el.innerHTML="<p>No results uploaded yet.</p>";return}
  el.innerHTML=`<div class="small-table"><table><thead><tr><th>ID</th><th>Name</th><th>Exam</th><th>Biology</th><th>Chemistry</th><th>Mathematics</th><th>English</th></tr></thead><tbody>`+
    data.map(r=>`<tr><td>${r.id}</td><td>${r.name}</td><td>${r.exam}</td><td>${r.subjects.Biology??""}</td><td>${r.subjects.Chemistry??""}</td><td>${r.subjects.Mathematics??""}</td><td>${r.subjects.English??""}</td></tr>`).join("")+
    "</tbody></table></div>";
}
document.getElementById("excelFile").addEventListener("change", async e=>{
  const file=e.target.files[0]; if(!file)return;
  const data=await file.arrayBuffer();
  const wb=XLSX.read(data,{type:"array"});
  const ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(ws,{defval:""});
  const results=rows.map(r=>({
    id:String(r["Student ID"]||r["Roll Number"]||"").trim(),
    password:"",
    name:String(r["Student Name"]||r["Name"]||"").trim(),
    exam:String(r["Exam"]||"Final").trim(),
    subjects:{
      Biology:Number(r["Biology"]||0),
      Chemistry:Number(r["Chemistry"]||0),
      Mathematics:Number(r["Mathematics"]||r["Maths"]||0),
      English:Number(r["English"]||0)
    }
  })).filter(r=>r.id && r.name);
  saveResults(results);
  render();
  alert(`${results.length} results uploaded successfully.`);
});
document.getElementById("clearBtn").addEventListener("click",()=>{
  if(confirm("Clear all locally stored results?")){localStorage.removeItem("dhuudoResults");render();}
});
render();