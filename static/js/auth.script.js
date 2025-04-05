/* Login and Register */
let loginForm = document.getElementById("login_form")
const loginImg = document.getElementById("login-img")
const registerBtn = document.getElementById("register-btn")

let registerForm = document.getElementById("register_form")
const registerImg = document.getElementById("register-img")
const loginBtn = document.getElementById("login-btn")


/* Menu  */

let list = $("#menu-list")
let listStat = false

$(".menu-toggler").on("click", () => {
    console.log("dfgbdfhb")
    if(!listStat){
        list.css("display", "flex")
        listStat = true
    }else{
        list.css("display", "none")
        listStat = false
    }
} )


/* End menu */

registerBtn.addEventListener("click", (e) => {
    e.preventDefault()
    registerForm.classList.remove("d-none")
    registerImg.classList.remove("d-none")
    loginForm.classList.add("d-none")
    loginImg.classList.add("d-none")
    document.getElementById("login_error").textContent = ""
    document.getElementById("login_info").textContent = ""
    empty_login_field()
})

loginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    loginForm.classList.remove("d-none")
    loginImg.classList.remove("d-none")
    registerForm.classList.add("d-none")
    registerImg.classList.add("d-none")
    document.getElementById("register_error").textContent = ""
    document.getElementById("register_info").textContent = ""
    empty_register_field()
})

//Auth
// Login handler
$("#login_form").on("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            const token = responseData.token
            localStorage.setItem("token", token);
            document.getElementById("login_error").textContent = ""
            document.getElementById("login_info").textContent = "Login successful"
            empty_login_field()
            userDashboard()
        } else {
            document.getElementById("login_error").textContent = responseData.error
        }
    } catch (error) {
        document.getElementById("login_error").textContent = error
    }
})

// Register handler
$("#register_form").on("submit", async (e) => {
    e.preventDefault()
    const email = document.getElementById("new_email").value
    const password = document.getElementById("new_password").value
    const confirmation_password = document.getElementById("new_confirmation_password").value

    try {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, confirmation_password })
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            document.getElementById("register_error").textContent = ""
            document.getElementById("register_info").textContent = "Registration successful!"
            empty_register_field()
            loginForm.classList.remove("d-none")
            loginImg.classList.remove("d-none")
            registerForm.classList.add("d-none")
            registerImg.classList.add("d-none")
        } else {
            document.getElementById("register_error").textContent = responseData.error
        }
    } catch (error) {
        document.getElementById("register_error").textContent = error
    }
})

function empty_login_field(){
    document.getElementById("email").value = ""
    document.getElementById("password").value = ""
}

function empty_register_field(){
    document.getElementById("new_email").value = ""
    document.getElementById("new_password").value = ""
    document.getElementById("new_confirmation_password").value = ""
}
/* End Login and Register */

//Handle dashboard
async function userDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in first!");
        return;
    }

    try {
            const response = await fetch("/dashboard", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }});

        if (response.ok) {
            window.location.href = "/dashboard";  
        } else {
            alert("Unauthorized! Redirecting to login...");
            localStorage.removeItem("token"); 
            window.location.href = "/auth"; 
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
    }
}



$("#header").css("background-image", "url('../../static/images/bg-4.avif')")