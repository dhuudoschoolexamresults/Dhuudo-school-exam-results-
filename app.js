function getResults(){
  try { return JSON.parse(localStorage.getItem("dhuudoResults") || "[]"); }
  catch(e){ return []; }
}
function grade(m){
  if(m>=90)return"A+";
  if(m>=80)return"A";
  if(m>=75)return"B+";
  if(m>=70)return"B";
  if(m>=65)return"C+";
  if(m>=60)return"C";
  if(m>=50)return"D";
  return"F";
}
document.getElementById("resultForm").addEventListener("submit", e=>{
  e.preventDefault();
  const id=document.getElementById("studentId").value.trim().toLowerCase();
  const exam=document.getElementById("exam").value;
  const msg=document.getElementById("message");
  const r=getResults().find(x=>String(x.id).toLowerCase()===id && x.exam===exam);
  if(!r){
    msg.textContent="Result not found. Please check your Roll Number and Exam.";
    document.getElementById("resultSection").classList.add("hidden");
    return;
  }
  msg.textContent="";
  const rows=Object.entries(r.subjects || {});
  let total=0;
  document.getElementById("subjects").innerHTML=rows.map(([s,m])=>{
    total+=Number(m);
    return `<tr><td>${s}</td><td>${m}</td><td>${grade(Number(m))}</td></tr>`;
  }).join("");
  const avg=rows.length ? total/rows.length : 0;
  document.getElementById("studentInfo").innerHTML=
    `<strong>Name:</strong> ${r.name}<br><strong>Roll Number:</strong> ${r.id}<br><strong>Exam:</strong> ${r.exam}`;
  document.getElementById("summary").innerHTML=
    `<strong>Total:</strong> ${total} &nbsp; | &nbsp; <strong>Average:</strong> ${avg.toFixed(2)}% &nbsp; | &nbsp; <strong>Overall Grade:</strong> ${grade(avg)}`;
  document.getElementById("resultSection").classList.remove("hidden");
  document.getElementById("resultSection").scrollIntoView({behavior:"smooth"});
});
document.getElementById("printBtn").addEventListener("click",()=>window.print());
