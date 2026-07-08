// ===============================
// SHOW / HIDE FORMS
// ===============================

function showRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
}

function showLogin() {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}


// ===============================
// REGISTER
// ===============================

async function register() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const exam = document.getElementById("exam").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !exam || !password) {

        alert("Please fill all fields.");

        return;
    }

    // Create Authentication User

    const { data, error } = await supabaseClient.auth.signUp({

        email: email,

        password: password

    });

    console.log("SIGNUP DATA :", data);
    console.log("SIGNUP ERROR :", error);

    if (error) {

        alert(error.message);

        return;
    }

    // Check user

    if (!data.user) {

        alert("User not created.");

        return;
    }

    // Save Student Information

    const { error: studentError } = await supabaseClient

        .from("students")

        .upsert({

            id: data.user.id,

            full_name: name,

            email: email,

            exam: exam

        });

    console.log("STUDENT INSERT :", studentError);

    if (studentError) {

        console.log(studentError);

    }

    alert("Registration Successful!");

    showLogin();

}



// ===============================
// LOGIN
// ===============================

async function login() {

    const email = document.getElementById("loginEmail").value.trim();

    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {

        alert("Enter Email & Password");

        return;

    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({

        email: email,

        password: password

    });

    console.log("LOGIN DATA :", data);
    console.log("LOGIN ERROR :", error);

    if (error) {

        alert(error.message);

        return;

    }

    localStorage.setItem("studentEmail", email);

    window.location.href = "app.html";

}

// ===================================
// ADMIN LOGIN
// ===================================

function adminLogin(){

    const email=document.getElementById("loginEmail").value.trim();

    const password=document.getElementById("loginPassword").value;

    if(

        email==="admin@deepstambh.com"

        &&

        password==="admin123"

    ){

        localStorage.setItem("admin","true");

        window.location.href="admin.html";

    }

    else{

        alert("Invalid Admin Credentials");

    }

}


async function forgotPassword(){

    const email = document.getElementById("loginEmail").value.trim();

    if(email === ""){

        alert("Please enter your email address first.");

        return;

    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {

        redirectTo: window.location.origin + "/reset-password.html"

    });

    if(error){

        alert(error.message);

        return;

    }

    alert("Password reset link has been sent to your email.");

}


async function updatePassword(){

    const password = document.getElementById("newPassword").value;

    if(password.length<6){

        alert("Password must be at least 6 characters.");

        return;

    }

    const { error } = await supabaseClient.auth.updateUser({

        password: password

    });

    if(error){

        alert(error.message);

        return;

    }

    alert("Password updated successfully.");

    window.location.href="index.html";

}