// =======================================
// SECURITY
// =======================================

if(localStorage.getItem("admin")!="true"){

    window.location.href="index.html";

}

// =======================================

window.onload=function(){

    loadStudents();

    dashboard();

    loadAdminSubjects();

    loadAnnouncements();

    loadStudentDropdown();

    loadAdminMocks();

}

// =======================================

function showAdmin(id){

document.getElementById("dashboard").style.display="none";

document.getElementById("students").style.display="none";

document.getElementById("subjects").style.display="none";

document.getElementById("mock").style.display="none";

document.getElementById("announcement").style.display="none";

document.getElementById(id).style.display="block";

}

// =======================================

function logoutAdmin(){

localStorage.removeItem("admin");

window.location="index.html";

}

// =======================================

async function loadStudents(){

const {data}=await supabaseClient

.from("students")

.select("*");

let html="";

data.forEach(student=>{

html += `

<tr>

<td>${student.full_name}</td>

<td>${student.email}</td>

<td>${student.exam}</td>

<td>

<button onclick="viewStudent('${student.id}')">

View

</button>

</td>

</tr>

`;

});

document.getElementById("studentTable").innerHTML=html;

}

// =======================================

async function dashboard(){

const {data:students}=await supabaseClient

.from("students")

.select("*");

const {data:subjects}=await supabaseClient

.from("syllabus")

.select("*");

const {data:mocks}=await supabaseClient

.from("mock_tests")

.select("*");

document.getElementById("totalStudents").innerText=students.length;

document.getElementById("totalSubjects").innerText=subjects.length;

document.getElementById("totalMocks").innerText=mocks.length;

}

// ======================================
// ADD SUBJECT
// ======================================

async function addAdminSubject(){

const subject=document.getElementById("subjectName").value.trim();

if(subject===""){

alert("Enter Subject");

return;

}

const {error}=await supabaseClient

.from("admin_subjects")

.insert([{

subject_name:subject

}]);

if(error){

alert(error.message);

return;

}

document.getElementById("subjectName").value="";

loadAdminSubjects();

}

// ======================================

async function loadAdminSubjects(){

const {data}=await supabaseClient

.from("admin_subjects")

.select("*")

.order("created_at");

let html="";

data.forEach(item=>{

html+=`

<tr>

<td>${student.full_name}</td>

<td>${student.email}</td>

<td>${student.exam}</td>

<td>

<button

onclick="viewStudent('${student.id}')">

View

</button>

</td>

</tr>

`;

});

document.getElementById("adminSubjectTable").innerHTML=html;

}

// ======================================

async function deleteAdminSubject(id){

await supabaseClient

.from("admin_subjects")

.delete()

.eq("id",id);

loadAdminSubjects();

}

// ======================================
// PUBLISH ANNOUNCEMENT
// ======================================

async function publishAnnouncement(){

    const title=document.getElementById("announcementTitle").value.trim();

    const message=document.getElementById("announcementMessage").value.trim();

    if(title==="" || message===""){

        alert("Fill all fields");

        return;

    }

    const {error}=await supabaseClient

    .from("announcements")

    .insert([{

        title,

        message

    }]);

    if(error){

        alert(error.message);

        return;

    }

    document.getElementById("announcementTitle").value="";

    document.getElementById("announcementMessage").value="";

    loadAnnouncements();

}



// ======================================
// LOAD ANNOUNCEMENTS
// ======================================

async function loadAnnouncements(){

    const { data,error } = await supabaseClient

    .from("announcements")

    .select("*")

    .order("created_at",{ascending:false});

    if(error){

        console.log(error);

        return;

    }

    let html="";

    data.forEach(item=>{

        html+=`

        <tr>

            <td>${item.title}</td>

            <td>${item.message}</td>

            <td>${new Date(item.created_at).toLocaleDateString()}</td>

            <td>

                <button

                onclick="deleteAnnouncement('${item.id}')"

                style="background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">

                🗑 Delete

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("announcementList").innerHTML=html;

}

// ======================================
// DELETE ANNOUNCEMENT
// ======================================

async function deleteAnnouncement(id){

    if(!confirm("Delete this announcement?")){

        return;

    }

    const {error}=await supabaseClient

    .from("announcements")

    .delete()

    .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

    loadAnnouncements();

}

// ==========================================
// VIEW STUDENT DETAILS
// ==========================================

async function viewStudent(studentId){

// Student Profile

const {data:student}=await supabaseClient

.from("students")

.select("*")

.eq("id",studentId)

.single();


// Subjects

const {data:subjects}=await supabaseClient

.from("syllabus")

.select("*")

.eq("student_id",studentId);


// Revision

const {data:revisions}=await supabaseClient

.from("revisions")

.select("*")

.eq("student_id",studentId);


// Mock Tests

const {data:mocks}=await supabaseClient

.from("mock_tests")

.select("*")

.eq("student_id",studentId);


let avg=0;

if(mocks.length>0){

mocks.forEach(item=>{

avg+=Number(item.accuracy);

});

avg=(avg/mocks.length).toFixed(1);

}


document.getElementById("studentDetails").innerHTML=

`

<div class="subjectCard">

<h2>${student.full_name}</h2>

<p>

<b>Email :</b>

${student.email}

</p>

<p>

<b>Exam :</b>

${student.exam}

</p>

<hr>

<p>

📚 Subjects :

${subjects.length}

</p>

<p>

📅 Revisions :

${revisions.length}

</p>

<p>

📝 Mock Tests :

${mocks.length}

</p>

<p>

🎯 Average :

${avg}%

</p>

</div>

`;

}

// ==========================================
// VIEW STUDENT
// ==========================================

async function viewStudent(studentId){

    const {data:student}=await supabaseClient

    .from("students")

    .select("*")

    .eq("id",studentId)

    .single();

    const {data:subjects}=await supabaseClient

    .from("syllabus")

    .select("*")

    .eq("student_id",studentId);

    const {data:revisions}=await supabaseClient

    .from("revisions")

    .select("*")

    .eq("student_id",studentId);

    const {data:mocks}=await supabaseClient

    .from("mock_tests")

    .select("*")

    .eq("student_id",studentId);

    let avg=0;

    if(mocks.length>0){

        mocks.forEach(item=>{

            avg+=Number(item.accuracy);

        });

        avg=(avg/mocks.length).toFixed(1);

    }

    document.getElementById("studentDetails").innerHTML=`

    <div class="subjectCard">

        <h2>${student.full_name}</h2>

        <p><b>Email :</b> ${student.email}</p>

        <p><b>Exam :</b> ${student.exam}</p>

        <hr>

        <p>📚 Subjects : ${subjects.length}</p>

        <p>📅 Revisions : ${revisions.length}</p>

        <p>📝 Mock Tests : ${mocks.length}</p>

        <p>🎯 Average : ${avg}%</p>

    </div>

    `;

}

// ==========================================
// LOAD ALL MOCK TESTS
// ==========================================

// ===========================================
// SAVE MOCK TEST
// ===========================================

async function saveMockTest(){

    const student=document.getElementById("mockStudent").value;

    const subject=document.getElementById("mockSubject").value;

    const mock=document.getElementById("mockName").value;

    const marks=Number(document.getElementById("mockMarks").value);

    const total=Number(document.getElementById("mockTotal").value);

    if(student==""||subject==""||mock==""||marks==0||total==0){

        alert("Fill all fields");

        return;

    }

    const accuracy=((marks/total)*100).toFixed(1);

    const {error}=await supabaseClient

    .from("mock_tests")

    .insert([{

        student_id:student,

        subject:subject,

        mock_name:mock,

        marks:marks,

        total_marks:total,

        accuracy:accuracy

    }]);

    if(error){

        alert(error.message);

        return;

    }

    alert("Mock Test Saved");

    document.getElementById("mockStudent").value="";

    document.getElementById("mockSubject").value="";

    document.getElementById("mockName").value="";

    document.getElementById("mockMarks").value="";

    document.getElementById("mockTotal").value="";

    loadAdminMocks();

}


// ===========================================
// LOAD STUDENTS INTO DROPDOWN
// ===========================================

async function loadStudentDropdown(){

    const {data}=await supabaseClient

    .from("students")

    .select("*")

    .order("full_name");

    let html='<option value="">Select Student</option>';

    data.forEach(student=>{

        html+=`

        <option value="${student.id}">

        ${student.full_name}

        </option>

        `;

    });

    document.getElementById("mockStudent").innerHTML=html;

}

// ===========================================
// SAVE MOCK TEST
// ===========================================

async function saveMockTest(){

    const student=document.getElementById("mockStudent").value;

    const subject=document.getElementById("mockSubject").value;

    const mock=document.getElementById("mockName").value;

    const marks=Number(document.getElementById("mockMarks").value);

    const total=Number(document.getElementById("mockTotal").value);

    if(student==""||subject==""||mock==""||marks==0||total==0){

        alert("Fill all fields");

        return;

    }

    const accuracy=((marks/total)*100).toFixed(1);

    const {error}=await supabaseClient

    .from("mock_tests")

    .insert([{

        student_id:student,

        subject:subject,

        mock_name:mock,

        marks:marks,

        total_marks:total,

        accuracy:accuracy

    }]);

    if(error){

        alert(error.message);

        return;

    }

    alert("Mock Test Saved");

    document.getElementById("mockStudent").value="";

    document.getElementById("mockSubject").value="";

    document.getElementById("mockName").value="";

    document.getElementById("mockMarks").value="";

    document.getElementById("mockTotal").value="";

    loadAdminMocks();

}