const SUBJECTS = [
  "Islamic", "Arabic", "Biology", "Chemistry", "Physics",
  "Mathematics", "Business", "Geography", "History", "Af-Somali", "English"
];
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
function totalAndAverage(r){
  const marks = SUBJECTS.map(s => Number((r.subjects || {})[s] ?? 0));
  const total = marks.reduce((a,b)=>a+b,0);
  return {total, average: total / SUBJECTS.length};
}
function positionOf(r, data){
  const ranked = data.filter(x=>x.exam===r.exam)
    .map(x=>({id:String(x.id).toLowerCase(), average:totalAndAverage(x).average}))
    .sort((a,b)=>b.average-a.average);
  const pos=ranked.findIndex(x=>x.id===String(r.id).toLowerCase());
  return pos<0 ? "-" : pos+1;
}
document.getElementById("resultForm").addEventListener("submit", e=>{
  e.preventDefault();
  const id=document.getElementById("studentId").value.trim().toLowerCase();
  const exam=document.getElementById("exam").value;
  const msg=document.getElementById("message");
  const all=getResults();
  const r=all.find(x=>String(x.id).toLowerCase()===id && x.exam===exam);
  if(!r){
    msg.textContent="Result not found. Please check your Roll Number and Exam.";
    document.getElementById("resultSection").classList.add("hidden");
    return;
  }
  msg.textContent="";
  const rows=SUBJECTS.map(s=>[s, Number((r.subjects||{})[s] ?? 0)]);
  const {total, average}=totalAndAverage(r);
  document.getElementById("subjects").innerHTML=rows.map(([s,m])=>
    `<tr><td>${s}</td><td>${m}</td><td>${grade(m)}</td></tr>`
  ).join("");
  const pass=average>=50;
  const position=positionOf(r,all);
  document.getElementById("studentInfo").innerHTML=
    `<strong>Name:</strong> ${r.name}<br><strong>Roll Number:</strong> ${r.id}<br><strong>Exam:</strong> ${r.exam}`;
  document.getElementById("summary").innerHTML=
    `<strong>Total:</strong> ${total} / 1100 &nbsp; | &nbsp; <strong>Average:</strong> ${average.toFixed(2)}% &nbsp; | &nbsp; <strong>Result:</strong> ${pass ? "PASS" : "FAIL"} &nbsp; | &nbsp; <strong>Position:</strong> ${position}`;
  document.getElementById("resultSection").classList.remove("hidden");
  document.getElementById("resultSection").scrollIntoView({behavior:"smooth"});
});
document.getElementById("printBtn").addEventListener("click",()=>window.print());
