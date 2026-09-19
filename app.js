const SUPABASE_URL = "https://emoutbhwhdoggnrhuibt.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const SUBJECTS = [
  "Islamic",
  "Arabic",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Business",
  "Geography",
  "History",
  "Af-somali",
  "English"
];
const rollNumberInput = document.getElementById("rollNumber");
const examSelect = document.getElementById("exam");
const resultContainer = document.getElementById("result");
const showResultButton = document.getElementById("showResult");
showResultButton.addEventListener("click", getResult);
async function getResult() {
  const rollNumber = rollNumberInput.value.trim();
  const exam = examSelect.value;
  if (!rollNumber || !exam) {
    resultContainer.innerHTML =
      "<p>Please enter your roll number and choose exam.</p>";
    return;
  }
  resultContainer.innerHTML = "<p>Loading...</p>";
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/Results` +
      `?select=*` +
      `&id=eq.${encodeURIComponent(rollNumber)}` +
      `&exam=eq.${encodeURIComponent(exam)}`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      resultContainer.innerHTML =
        "<p>Result not found. Check your roll number and exam.</p>";
      return;
    }
    const result = data[0];
    let total = 0;
    let count = 0;
    SUBJECTS.forEach(subject => {
      const mark = Number(result[subject]);
      if (!isNaN(mark)) {
        total += mark;
        count++;
      }
    });
    const average = count > 0 ? (total / count).toFixed(2) : "0";
    resultContainer.innerHTML = `
      <div class="result-card">
        <h2>Exam Result</h2>
        <p><strong>Roll Number:</strong> ${result.id ?? ""}</p>
        <p><strong>Name:</strong> ${result["student name"] ?? ""}</p>
        <p><strong>Class:</strong> ${result.class ?? ""}</p>
        <p><strong>Exam:</strong> ${result.exam ?? ""}</p>
        <hr>
        <h3>Subjects</h3>
        ${SUBJECTS.map(subject => `
          <p>
            <strong>${subject}:</strong>
            ${result[subject] ?? "-"}
          </p>
        `).join("")}
        <hr>
        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Average:</strong> ${average}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    resultContainer.innerHTML =
      "<p>Error loading result. Please try again.</p>";
  }
}
