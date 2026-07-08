// ---------------- Navigation ----------------

function showSection(section){

    document.querySelectorAll(".section").forEach(sec=>{

        sec.style.display="none";

    });

    document.getElementById(section).style.display="block";

    if(window.innerWidth <= 768){

        const sidebar=document.getElementById("sidebar");

        if(sidebar){

            sidebar.classList.remove("active");

        }

    }

}

// ---------------- Logout ----------------

async function logout(){

    await supabaseClient.auth.signOut();

    window.location="index.html";

}

// ---------------- Add Subject ----------------

async function addSubject(){

    const subject=document.getElementById("subject").value.trim();

    const topic=document.getElementById("topic").value.trim();

    if(subject==="" || topic===""){

        alert("Please enter Subject and Topic");

        return;

    }

    const {data:{user}}=await supabaseClient.auth.getUser();

    const {error}=await supabaseClient

    .from("syllabus")

    .insert([{

        student_id:user.id,

        subject:subject,

        topic:topic,

        completed:false

    }]);

    if(error){

        alert(error.message);

        return;

    }

    document.getElementById("subject").value="";

    document.getElementById("topic").value="";

    loadSubjects();

}

// ---------------- Complete Topic ----------------

async function completeTopic(id){

    const {error}=await supabaseClient

    .from("syllabus")

    .update({

        completed:true

    })

    .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

    loadSubjects();

}

// ---------------- Load Subjects ----------------

// =======================
// LOAD SUBJECTS
// =======================

async function loadSubjects(){

    const { data: { user } } = await supabaseClient.auth.getUser();

    const { data, error } = await supabaseClient
        .from("syllabus")
        .select("*")
        .eq("student_id", user.id);

    if(error){

        console.log(error);

        return;

    }

    console.log(data);

    let html = "";

    let completed = 0;

    data.forEach(subject=>{

        if(subject.completed){

            completed++;

        }

        html += `

        <tr>

            <td>${subject.subject}</td>

            <td>${subject.topic}</td>

            <td>

            ${subject.completed ? "✅ Completed" : "⏳ Pending"}

            </td>

            <td>

            ${
                subject.completed

                ?

                "-"

                :

                `<button onclick="completeTopic('${subject.id}')">

                Complete

                </button>`

            }

            </td>

        </tr>

        `;

    });

    document.getElementById("subjectTable").innerHTML = html;

    document.getElementById("subjectCount").innerText = data.length;

    document.getElementById("completedCount").innerText = completed;

}

// ---------------- Page Load ----------------

window.onload = function(){

    // Student Page
    if(document.getElementById("dashboard")){

        loadDashboardStats();
        loadSubjectCards();
        loadRevisions();
        loadMockTests();
        loadStudentAnnouncements();
        loadProfile();

    }

    // Admin Page
    if(document.getElementById("announcementTitle")){

        loadAdminSubjects();
        loadAnnouncements();
        loadAdminMocks();
        loadStudentDropdown();

    }

}

// ---------------- Add Revision ----------------

async function addRevision(){

const topic=document.getElementById("revisionTopic").value;

const revisionDate=document.getElementById("revisionDate").value;

if(topic==="" || revisionDate===""){

alert("Fill all fields");

return;

}

const {data:{user}}=await supabaseClient.auth.getUser();

const {error}=await supabaseClient

.from("revisions")

.insert([{

student_id:user.id,

topic:topic,

revision_date:revisionDate,

completed: false

}]);


if(error){

alert(error.message);

return;

}

document.getElementById("revisionTopic").value="";

document.getElementById("revisionDate").value="";

loadRevisions();

}

// ---------------- Complete Revision ----------------

async function completeRevision(id){

await supabaseClient

.from("revisions")

.update({

status:"Completed"

})

.eq("id",id);

loadRevisions();

}

// ---------------- Load Revision ----------------

async function loadRevisions(){

    const { data:{user} } = await supabaseClient.auth.getUser();

    const { data, error } = await supabaseClient
    .from("revisions")
    .select("*")
    .eq("student_id", user.id)
    .order("revision_date");

    if(error){

        console.log(error);

        return;

    }

    let html="";

    data.forEach(item=>{

        html+=`

        <tr>

            <td>${item.topic}</td>

            <td>${item.revision_date}</td>

            <td>

                ${item.completed ? "✅ Completed" : "⏳ Pending"}

            </td>

            <td>

                ${
                    item.completed

                    ?

                    `<button onclick="undoRevision('${item.id}')">

                    ↩ Undo

                    </button>`

                    :

                    `<button onclick="completeRevision('${item.id}')">

                    ✅ Complete

                    </button>`

                }

                <button
                onclick="deleteRevision('${item.id}')"
                style="background:red;color:white;margin-left:8px;">

                🗑 Delete

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("revisionTable").innerHTML=html;

}

// ================= COMPLETE REVISION =================

async function completeRevision(id){

    console.log("Revision ID:", id);

    const { data, error } = await supabaseClient
        .from("revisions")
        .update({
            completed: true
        })
        .eq("id", id)
        .select();

    console.log("Updated:", data);
    console.log("Error:", error);

    if(error){
        alert(error.message);
        return;
    }

    await loadRevisions();
    await loadDashboardStats();

}

// ================= UNDO REVISION =================

async function undoRevision(id){

    await supabaseClient

    .from("revisions")

    .update({

        completed:false

    })

    .eq("id",id);

    loadRevisions();

    loadDashboardStats();

}

// ================= DELETE REVISION =================

async function deleteRevision(id){

    if(!confirm("Delete this revision?")){

        return;

    }

    const { error } = await supabaseClient

    .from("revisions")

    .delete()

    .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

    loadRevisions();

    loadDashboardStats();

}

// ---------------- Add Mock Test ----------------

async function addMockTest(){

    const mockName = document.getElementById("mockName").value;
    const marks = Number(document.getElementById("marksObtained").value);
    const total = Number(document.getElementById("totalMarks").value);

    if(!mockName || !marks || !total){

        alert("Please fill all fields");

        return;

    }

    const accuracy = ((marks / total) * 100).toFixed(2);

    const { data:{user} } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient

    .from("mock_tests")

    .insert([{

        student_id: user.id,

        mock_name: mockName,

        marks: marks,

        total_marks: total,

        accuracy: accuracy

    }]);

    if(error){

        alert(error.message);

        return;

    }

    document.getElementById("mockName").value = "";
    document.getElementById("marksObtained").value = "";
    document.getElementById("totalMarks").value = "";

    loadMockTests();

}

// ---------------- Load Mock Tests ----------------

async function loadMockTests(){

    const { data:{user} } = await supabaseClient.auth.getUser();

    const { data } = await supabaseClient
        .from("mock_tests")
        .select("*")
        .eq("student_id", user.id);

    let table = "";

    data.forEach(item=>{

        table += `

        <tr>

            <td>${item.mock_name}</td>

            <td>${item.marks}</td>

            <td>${item.total_marks}</td>

            <td>${item.accuracy}%</td>

            <td>

                <button
                    onclick="deleteMockTest('${item.id}')"
                    style="background:#dc2626;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;">

                    🗑 Delete

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("mockTable").innerHTML = table;

    document.getElementById("mockCount").innerText = data.length;

}

// ================= DELETE MOCK TEST =================

async function deleteMockTest(id){

    if(!confirm("Delete this mock test?")){

        return;

    }

    const { error } = await supabaseClient

        .from("mock_tests")

        .delete()

        .eq("id", id);

    if(error){

        alert(error.message);

        return;

    }

    loadMockTests();

    loadDashboardStats();

    loadProfile();

}

// ==========================
// Dashboard Statistics
// ==========================

async function loadDashboardStats(){

    const { data:{user} } = await supabaseClient.auth.getUser();

    // ================= Subjects =================

    const { data: subjects } = await supabaseClient

    .from("subjects")

    .select("*")

    .eq("student_id", user.id);

    document.getElementById("subjectCount").innerText =
        subjects ? subjects.length : 0;

    // ================= Syllabus Topics =================

    const { data: syllabus } = await supabaseClient

    .from("syllabus")

    .select("*")

    .eq("student_id", user.id);

    document.getElementById("completedCount").innerText =
        syllabus ? syllabus.filter(item => item.completed).length : 0;

    // ================= Revisions =================

    const { data: revisions } = await supabaseClient

    .from("revisions")

    .select("*")

    .eq("student_id", user.id);

    document.getElementById("revisionCount").innerText =
        revisions ? revisions.length : 0;

    // ================= Mock Tests =================

    const { data: mocks } = await supabaseClient

    .from("mock_tests")

    .select("*")

    .eq("student_id", user.id);

    document.getElementById("mockCount").innerText =
        mocks ? mocks.length : 0;

    // ================= Average =================

    if(!mocks || mocks.length === 0){

        document.getElementById("averageScore").innerText = "0%";

    }else{

        let total = 0;

        mocks.forEach(mock=>{

            total += Number(mock.accuracy);

        });

        const avg = (total/mocks.length).toFixed(1);

        document.getElementById("averageScore").innerText = avg + "%";

    }

}


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile(){

    try{

        const { data:{user}, error:userError } = await supabaseClient.auth.getUser();

        if(userError || !user){

            console.log(userError);

            return;

        }

        // ================= Student =================

        const { data:student, error:studentError } = await supabaseClient

            .from("students")

            .select("*")

            .eq("id", user.id)

            .single();

        if(studentError){

            console.log(studentError);

        }else{

            document.getElementById("studentName").textContent =
                student?.full_name || "Not Available";

            document.getElementById("studentEmail").textContent =
                student?.email || "Not Available";

            document.getElementById("studentExam").textContent =
                student?.exam || "Not Selected";

        }

        // ================= Subjects =================

        const { count:subjectCount } = await supabaseClient

            .from("subjects")

            .select("*",{count:"exact",head:true})

            .eq("student_id",user.id);

        document.getElementById("profileSubjects").textContent =
            subjectCount || 0;

        // ================= Completed Topics =================

        const { count:completedCount } = await supabaseClient

            .from("syllabus")

            .select("*",{count:"exact",head:true})

            .eq("student_id",user.id)

            .eq("completed",true);

        document.getElementById("profileCompleted").textContent =
            completedCount || 0;

        // ================= Revisions =================

        const { count:revisionCount } = await supabaseClient

            .from("revisions")

            .select("*",{count:"exact",head:true})

            .eq("student_id",user.id);

        document.getElementById("profileRevision").textContent =
            revisionCount || 0;

        // ================= Mock Tests =================

        const { data:mocks=[] } = await supabaseClient

            .from("mock_tests")

            .select("accuracy")

            .eq("student_id",user.id);

        document.getElementById("profileMocks").textContent =
            mocks.length;

        let avg=0;

        if(mocks.length>0){

            mocks.forEach(m=>avg+=Number(m.accuracy||0));

            avg=(avg/mocks.length).toFixed(1);

        }

        document.getElementById("profileAverage").textContent =
            avg+"%";

    }

    catch(err){

        console.error("PROFILE ERROR:",err);

    }

}

// ======================================================
// SUBJECT FOLDER SYSTEM
// ======================================================

// Create Subject

async function createSubject(){

    const subject=document.getElementById("newSubject").value.trim();

    if(subject===""){

        alert("Enter Subject Name");

        return;

    }

    const {data:{user}}=await supabaseClient.auth.getUser();

    const {error}=await supabaseClient

    .from("subjects")

    .insert([{

        student_id:user.id,

        subject_name:subject

    }]);

    if(error){

        console.log(error);

        alert(error.message);

        return;

    }

    document.getElementById("newSubject").value="";

    loadSubjectCards();

}



// Load Subject Cards

async function loadSubjectCards(){

    const { data:{user} } = await supabaseClient.auth.getUser();

    const { data, error } = await supabaseClient
        .from("subjects")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at");

    if(error){
        console.log(error);
        return;
    }

    let html = "";

    data.forEach(subject=>{

        html += `

        <div class="subjectCard">

            <div class="subjectHeader">

                <h3>📘 ${subject.subject_name}</h3>

                <button onclick="deleteSubject('${subject.id}')">
                    🗑
                </button>

            </div>

            <div class="progressBar">
                <div class="progressFill" id="progress-${subject.id}"></div>
            </div>

            <small id="progressText-${subject.id}">
                0%
            </small>

            <hr>

            <!-- TOPICS WILL APPEAR HERE -->

            <div
                id="topics-${subject.id}"
                class="topicList">

                Loading Topics...

            </div>

            <br>

            <input
                type="text"
                id="topicInput-${subject.id}"
                placeholder="Enter Topic">

            <button onclick="addTopic('${subject.id}')">

                ➕ Add Topic

            </button>

        </div>

        `;

    });

    document.getElementById("subjectsContainer").innerHTML = html;

    for(const subject of data){

        await loadTopics(subject.id);

    }

}

// Delete Subject

async function deleteSubject(id){

    if(!confirm("Are you sure you want to delete this subject?")){
        return;
    }

    console.log("Deleting Subject ID:", id);

    // Delete all topics of this subject first
    const { error: topicError } = await supabaseClient
        .from("syllabus")
        .delete()
        .eq("subject_id", id);

    console.log("Topic Delete Error:", topicError);

    // Delete the subject
    const { error: subjectError } = await supabaseClient
        .from("subjects")
        .delete()
        .eq("id", id);

    console.log("Subject Delete Error:", subjectError);

    if(subjectError){
        alert(subjectError.message);
        return;
    }

    alert("Subject Deleted Successfully");

    loadSubjectCards();
    loadDashboardStats();

}

// ======================================================
// ADD TOPIC
// ======================================================

async function addTopic(subjectId){

    alert("Button Clicked");

    console.log("Subject ID:", subjectId);

    const input = document.getElementById(`topicInput-${subjectId}`);

    if(!input){
        alert("Input box not found!");
        return;
    }

    const topic = input.value.trim();

    if(topic === ""){
        alert("Please enter a topic.");
        return;
    }

    const { data:{user}, error:userError } = await supabaseClient.auth.getUser();

    if(userError || !user){
        alert("User not logged in.");
        console.log(userError);
        return;
    }

    const { data, error } = await supabaseClient
        .from("syllabus")
        .insert([{
            student_id: user.id,
            subject_id: subjectId,
            topic: topic,
            completed: false
        }])
        .select();

    console.log("Inserted Data:", data);
    console.log("Insert Error:", error);

    if(error){
        alert(error.message);
        return;
    }

    alert("Topic Added Successfully");

    input.value = "";

    await loadTopics(subjectId);

    await loadDashboardStats();

}

// ======================================================
// LOAD TOPICS
// ======================================================

async function loadTopics(subjectId){

    const { data, error } = await supabaseClient
        .from("syllabus")
        .select("*")
        .eq("subject_id", subjectId);

    if(error){
        console.log(error);
        return;
    }

    let html = "";

    if(data.length === 0){
        html = "<p>No topics added yet.</p>";
    }

    data.forEach(item=>{

        html += `

        <div class="topicItem">

            <span>

                ${item.completed ? "✅" : "📖"}

                ${item.topic}

            </span>

            <div>

                ${
                    item.completed
                    ?
                    `<button onclick="markIncomplete('${item.id}','${subjectId}')">
                        Undo
                    </button>`
                    :
                    `<button onclick="completeTopic('${item.id}','${subjectId}')">
                        Complete
                    </button>`
                }

                <button
                    onclick="deleteTopic('${item.id}','${subjectId}')"
                    style="background:#dc2626;color:white;margin-left:8px;">
                    Delete
                </button>

            </div>

        </div>

        `;

    });

    document.getElementById(`topics-${subjectId}`).innerHTML = html;

    const completed = data.filter(item => item.completed).length;

    updateProgress(subjectId, data.length, completed);

}

// Delete Topic

async function deleteTopic(id, subjectId){

    if(!confirm("Delete this topic?")){
        return;
    }

    const { error } = await supabaseClient
        .from("syllabus")
        .delete()
        .eq("id", id);

    if(error){
        alert(error.message);
        return;
    }

    loadTopics(subjectId);
    loadDashboardStats();

}


// Mark Incomplete

async function markIncomplete(id, subjectId){

    await supabaseClient
        .from("syllabus")
        .update({
            completed:false
        })
        .eq("id", id);

    loadTopics(subjectId);

}

// ======================================================
// COMPLETE TOPIC
// ======================================================

async function completeTopic(id,subjectId){

    await supabaseClient

    .from("syllabus")

    .update({

        completed:true

    })

    .eq("id",id);

    loadTopics(subjectId);

}

// ======================================================
// DELETE TOPIC
// ======================================================

async function deleteTopic(id,subjectId){

    await supabaseClient

    .from("syllabus")

    .delete()

    .eq("id",id);

    loadTopics(subjectId);

}

// ======================================================
// UPDATE PROGRESS BAR
// ======================================================

function updateProgress(subjectId,total,completed){

    let percent=0;

    if(total>0){

        percent=Math.round((completed/total)*100);

    }

    document.getElementById(`progress-${subjectId}`).style.width=percent+"%";

    document.getElementById(`progressText-${subjectId}`).innerHTML=

    `${completed}/${total} Topics Completed (${percent}%)`;

}

// =====================================
// STUDENT ANNOUNCEMENTS
// =====================================

async function loadStudentAnnouncements(){

    const { data, error } = await supabaseClient
        .from("announcements")
        .select("*")
        .order("created_at", { ascending:false })
        .limit(1);

    const box = document.getElementById("studentAnnouncement");

    if(!box) return;

    if(error || !data || data.length===0){

        box.innerHTML = `
            <div class="announcementCard">
                <h4>No Announcement</h4>
                <p>No announcements available.</p>
            </div>
        `;

        return;

    }

    box.innerHTML = `
        <div class="announcementCard">
            <h4>${data[0].title}</h4>
            <p>${data[0].message}</p>
        </div>
    `;

}
// =====================================
// MOBILE SIDEBAR
// =====================================

function toggleSidebar(){

    const sidebar = document.getElementById("sidebar");

    if(!sidebar) return;

    sidebar.classList.toggle("active");

}