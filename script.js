let allStudents = [];
let departmentChart = null;
let companyChart = null;

async function loadAnalytics() {
    try {
        const response = await fetch("/api/analytics");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Analytics failed");

        document.getElementById("totalStudents").textContent =
            data.total_students;

        document.getElementById("placedStudents").textContent =
            data.placed_students;

        document.getElementById("unplacedStudents").textContent =
            data.unplaced_students;

        document.getElementById("placementRate").textContent =
            data.placement_rate + "%";

        document.getElementById("averagePackage").textContent =
            Number(data.average_package).toFixed(2) + " LPA";

        if (departmentChart) departmentChart.destroy();
        if (companyChart) companyChart.destroy();

        departmentChart = new Chart(
            document.getElementById("departmentChart"),
            {
                type: "bar",
                data: {
                    labels: Object.keys(data.department_stats),
                    datasets: [{
                        label: "Number of Students",
                        data: Object.values(data.department_stats)
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            }
        );

        companyChart = new Chart(
            document.getElementById("companyChart"),
            {
                type: "doughnut",
                data: {
                    labels: Object.keys(data.company_stats),
                    datasets: [{
                        label: "Placements",
                        data: Object.values(data.company_stats)
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            }
        );
    } catch (error) {
        console.error(error);
        document.getElementById("formMessage").textContent =
            "Could not load analytics. Check the Flask terminal and MySQL connection.";
    }
}

async function loadStudents() {
    const response = await fetch("/api/students");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Could not load students");
    }

    allStudents = data;
    renderStudents(allStudents);
}

function renderStudents(students) {
    const table = document.getElementById("studentTable");
    table.replaceChildren();

    if (!students.length) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7;
        cell.textContent = "No students found.";
        return;
    }

    students.forEach(student => {
        const row = table.insertRow();

        [
            student.student_id,
            student.name,
            student.department,
            student.cgpa ?? "-",
            student.skills || "-",
            student.company_name || "Not placed",
            student.package_lpa ?? "-"
        ].forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value;
        });
    });
}

document.getElementById("searchInput").addEventListener("input", event => {
    const query = event.target.value.toLowerCase();

    renderStudents(allStudents.filter(student =>
        String(student.name || "").toLowerCase().includes(query) ||
        String(student.department || "").toLowerCase().includes(query)
    ));
});

document.getElementById("studentForm").addEventListener("submit", async event => {
    event.preventDefault();

    const message = document.getElementById("formMessage");

    const student = {
        name: document.getElementById("name").value.trim(),
        department: document.getElementById("department").value.trim(),
        cgpa: document.getElementById("cgpa").value,
        graduation_year: document.getElementById("graduationYear").value,
        skills: document.getElementById("skills").value.trim()
    };

    try {
        const response = await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Could not add student");

        message.textContent = "Student added successfully!";
        event.target.reset();

        await loadStudents();
        await loadAnalytics();
    } catch (error) {
        message.textContent = "Error: " + error.message;
    }
});

function exportCSV() {
    window.location.href = "/api/export";
}

async function initializeDashboard() {
    try {
        await loadStudents();
        await loadAnalytics();
    } catch (error) {
        console.error(error);
        document.getElementById("studentTable").innerHTML =
            '<tr><td colspan="7">Unable to load data. Check MySQL and Flask.</td></tr>';
    }
}

initializeDashboard();