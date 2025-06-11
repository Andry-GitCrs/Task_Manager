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


document.getElementById('menu-btn').addEventListener('click', function () {
    document.getElementById('menu-list').classList.toggle('active');
});


/* End menu */

registerBtn.addEventListener("click", (e) => {
    e.preventDefault()
    registerForm.classList.remove("d-none")
    registerImg.classList.remove("d-none")
    loginForm.classList.add("d-none")
    loginImg.classList.add("d-none")
    empty_login_field()
})

loginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    loginForm.classList.remove("d-none")
    loginImg.classList.remove("d-none")
    registerForm.classList.add("d-none")
    registerImg.classList.add("d-none")
    empty_register_field()
})

//Auth
// Login handler
$("#login_form").on("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    $("#log-in").prop("disabled", true);
    $(".loading").css("display", 'inline');
    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            showNotification("success", responseData.message)
            empty_login_field()
            $("#log-in").prop("disabled", false);
            $(".loading").css("display", 'none');
            location.href = '/dashboard'
        } else {
            showNotification("error", responseData.error)
            $("#log-in").prop("disabled", false);
    $(".loading").css("display", 'none');
        }
    } catch (error) {
        showNotification("error", error)
        $("#log-in").prop("disabled", false);
    $(".loading").css("display", 'none');
    }
})

// Register handler
$("#register_form").on("submit", async (e) => {
    e.preventDefault()
    const email = $("#new_email").val().trim()
    const password = document.getElementById("new_password").value
    const confirmation_password = document.getElementById("new_confirmation_password").value
    const otp = document.getElementById("otp").value
    
    $("#register").prop("disabled", true);
    $(".loading").css("display", 'inline');

    try {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, confirmation_password, otp })
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            showNotification("success", responseData.message)
            empty_register_field()
            loginForm.classList.remove("d-none")
            loginImg.classList.remove("d-none")
            registerForm.classList.add("d-none")
            registerImg.classList.add("d-none")
            $("#register").prop("disabled", false);
            $(".loading").css("display", 'none');
        } else {
            showNotification("error", responseData.error)
            $("#register").prop("disabled", false);
            $(".loading").css("display", 'none');
        }
    } catch (error) {
        showNotification("error", error)
        $("#register").prop("disabled", false);
        $(".loading").css("display", 'none');
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

//Notification displayer
function showNotification(type, message) {
    const notification = document.getElementById('notification');
    const messageBox = document.getElementById('notification-message');
    const icon = document.getElementById('notification-icon');

    // Reset classes
    notification.className = 'position-fixed bottom-0 end-0 mb-3 me-3 px-4 py-3 shadow rounded text-white d-flex align-items-center gap-2';
    icon.className = '';

    if (type === 'error') {
        notification.classList.add('bg-danger');
        icon.classList.add('fas', 'fa-circle-exclamation');
    } else if (type === 'success') {
        notification.classList.add('bg-success');
        icon.classList.add('fas', 'fa-check-circle');
    }

    messageBox.textContent = message;

    // Show with animation
    notification.style.opacity = 0;
    notification.style.transform = 'translateY(20px)';
    notification.classList.remove('d-none');

    setTimeout(() => {
        notification.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        notification.style.opacity = 1;
        notification.style.transform = 'translateY(0)';
    }, 10); // Small delay to trigger transition

    // Hide after 5 seconds
    setTimeout(() => {
        notification.style.opacity = 0;
        notification.style.transform = 'translateY(20px)';
        
        // After animation ends, hide the element
        setTimeout(() => {
            notification.classList.add('d-none');
        }, 500); // Match transition duration
    }, 5000);
}

$("#send-otp").on('click', () => {
    const email = $("#new_email").val().trim()
    if(email === "") {
        showNotification("error", "Please enter your email address");
        return
    }
    $("#send-otp").prop("disabled", true);
    $(".loading").css("display", 'inline');
    const encodedEmail = encodeURIComponent(email);
    $.post(`/api/user/sendOtp?email=${encodedEmail}`)
    .done((data) => {
        showNotification("success", data.message);
    })
    .fail((xhr) => {
        const error = xhr.responseJSON?.error || "An unexpected error occurred";
        console.error(error);
        showNotification("error", error);
    })
    .always(() => {
        $("#send-otp").prop("disabled", false);
        $(".loading").hide();
    });
})

/* End Login and Register */
$("body").css("background-image", "url('../../static/images/bg-4.jpg')")