const SUPABASE_URL = "https://emoutbhwhdoggnrhuibt.supabase.co";

// KU 
const SUPABASE_KEY = "sb_publishable_dkQz6bZztVJu5VQMe-l-WQ_7NAXlNzp";

const TABLE = "Result";

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
  "Af-Somali",
  "English"
];

function clean(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

async function getResults() {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?select=*`;

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error("Could not load results");
  }

  return await response.json();
}

function grade(mark) {
  if (mark >= 90) return "A+";
  if (mark >= 80) return "A";
  if (mark >= 75) return "B+";
  if (mark >= 70) return "B";
  if (mark >= 65) return "C+";
  if (mark >= 60) return "C";
  if (mark >= 50) return "D";
  return "F";
}

function totalAndAverage(result) {
  const marks = SUBJECTS.map(subject =>
    Number(result[subject] ?? 0)
  );

  const total = marks.reduce((a, b) => a + b, 0);
  const average = total / SUBJECTS.length;

  return {
    total,
    average
  };
}

function positionOf(result, data) {
  const sameExam = data
    .filter(x =>
      clean(x["Exam"]) === clean(result["Exam"])
    )
    .map(x => ({
      id: clean(x["ID"]),
      average: Number(
        x["Average"] ?? totalAndAverage(x).average
      )
    }))
    .sort((a, b) => b.average - a.average);

  const position = sameExam.findIndex(
    x => x.id === clean(result["ID"])
  );

  return position < 0 ? "-" : position + 1;
}

document
  .getElementById("resultForm")
  .addEventListener("submit", async function (e) {

    e.preventDefault();

    const id = clean(
      document.getElementById("studentId").value
    );

    const exam = clean(
      document.getElementById("exam").value
    );

    const message =
      document.getElementById("message");

    message.textContent = "Loading...";

    document
      .getElementById("resultSection")
      .classList.add("hidden");

    try {

      const allResults = await getResults();

      const result = allResults.find(x =>
        clean(x["ID"]) === id &&
        clean(x["Exam"]) === exam
      );

      if (!result) {

        message.textContent =
          "Result not found. Please check your Roll Number and Exam.";

        return;
      }

      message.textContent = "";

      const rows = SUBJECTS.map(subject => [
        subject,
        Number(result[subject] ?? 0)
      ]);

      const calculated =
        totalAndAverage(result);

      document.getElementById("subjects").innerHTML =
        rows
          .map(([subject, mark]) => `
            <tr>
              <td>${subject}</td>
              <td>${mark}</td>
              <td>${grade(mark)}</td>
            </tr>
          `)
          .join("");

      const total =
        result["Total"] !== null &&
        result["Total"] !== undefined &&
        result["Total"] !== ""
          ? Number(result["Total"])
          : calculated.total;

      const average =
        result["Average"] !== null &&
        result["Average"] !== undefined &&
        result["Average"] !== ""
          ? Number(result["Average"])
          : calculated.average;

      const passFail =
        result["Pass/Fail"] ||
        (average >= 50 ? "PASS" : "FAIL");

      const position =
        result["Position"] ||
        positionOf(result, allResults);

      document.getElementById("studentInfo").innerHTML = `
        <strong>Name:</strong>
        ${result["Student Name"] ?? ""}<br>

        <strong>Roll Number:</strong>
        ${result["ID"] ?? ""}<br>

        <strong>Exam:</strong>
        ${result["Exam"] ?? ""}
      `;

      document.getElementById("summary").innerHTML = `
        <strong>Total:</strong> ${total} / 1100
        &nbsp; | &nbsp;

        <strong>Average:</strong>
        ${average.toFixed(2)}%

        &nbsp; | &nbsp;

        <strong>Result:</strong>
        ${passFail}

        &nbsp; | &nbsp;

        <strong>Position:</strong>
        ${position}
      `;

      document
        .getElementById("resultSection")
        .classList.remove("hidden");

      document
        .getElementById("resultSection")
        .scrollIntoView({
          behavior: "smooth"
        });

    } catch (error) {

      console.error(error);

      message.textContent =
        "Unable to connect to the results database. Please try again.";
    }
  });

document
  .getElementById("printBtn")
  .addEventListener("click", () => {
    window.print();
  });
