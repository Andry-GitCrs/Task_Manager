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

// Password toggle functionality
const toggleBtn = document.getElementById('toggle-register-passwords');
toggleBtn.addEventListener('click', () => {
    const pwd1 = document.getElementById('new_password');
    const pwd2 = document.getElementById('new_confirmation_password');

    const isHidden = pwd1.type === 'password';

    pwd1.type = isHidden ? 'text' : 'password';
    pwd2.type = isHidden ? 'text' : 'password';

    toggleBtn.classList.toggle('fa-eye');
    toggleBtn.classList.toggle('fa-eye-slash');
});

const toggleLoginBtn = document.getElementById('toggle-login-password');
toggleLoginBtn.addEventListener('click', () => {
    const pwd = document.getElementById('password');
    const isHidden = pwd.type === 'password';

    pwd.type = isHidden ? 'text' : 'password';
    toggleLoginBtn.classList.toggle('fa-eye');
    toggleLoginBtn.classList.toggle('fa-eye-slash');
});

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
function showNotification(type, message, duration = 5000) {
    const containerId = 'notification-container';

    // Create the container once
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'position-fixed bottom-0 end-0 p-3 d-flex flex-column align-items-end gap-2 z-9999';
        document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'toast-notification px-4 py-3 shadow rounded text-white d-flex align-items-center justify-content-between gap-3';
    notification.style.minWidth = '280px';
    notification.style.opacity = 0;
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    // Icon
    const icon = document.createElement('i');
    icon.classList.add('fas');

    // Set icon and background based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-success');
            icon.classList.add('fa-check-circle');
            break;
        case 'error':
            notification.classList.add('bg-danger');
            icon.classList.add('fa-circle-exclamation');
            break;
        case 'info':
            notification.classList.add('bg-info');
            icon.classList.add('fa-info-circle');
            break;
        case 'warning':
            notification.classList.add('bg-warning', 'text-dark');
            icon.classList.add('fa-exclamation-triangle');
            break;
        default:
            notification.classList.add('bg-secondary');
            icon.classList.add('fa-bell');
    }

    // Message
    const messageBox = document.createElement('span');
    messageBox.textContent = message;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `<i className="fas fa-times"></i>`;
    closeBtn.className = 'btn-close btn-close-white ms-auto';
    closeBtn.style.filter = 'brightness(0) invert(1)';
    closeBtn.style.fontSize = '1rem';
    closeBtn.style.opacity = '0.8';
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = 0;
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 500);
    });

    // Assemble notification
    const contentWrap = document.createElement('div');
    contentWrap.className = 'd-flex align-items-center gap-2';
    contentWrap.appendChild(icon);
    contentWrap.appendChild(messageBox);

    notification.appendChild(contentWrap);
    notification.appendChild(closeBtn);
    container.appendChild(notification);

    // Show animation
    setTimeout(() => {
        notification.style.opacity = 1;
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Auto-hide
    setTimeout(() => {
        notification.style.opacity = 0;
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 500);
    }, duration);
}

$("#send-otp").on('click', () => {
    const email = $("#new_email").val().trim()
    if(email === "") {
        showNotification("error", "Please enter your email address");
        return
    }
    $("#send-otp").prop("disabled", true);
    $("#send-otp").html('<i class="fas fa-spinner fa-spin text-success"></i>')
    const encodedEmail = encodeURIComponent(email);
    $.post(`/api/user/sendOtp?email=${encodedEmail}`)
    .done((data) => {
        showNotification("success", data.message);
        let countdown = 60;
        const btn = $("#send-otp");
        btn.html(`<span class="text-secondary fw-bold">${countdown}s</span>`);
        const interval = setInterval(() => {
            countdown--;
            btn.html(`<span class="text-secondary fw-bold">${countdown}s</span>`);
            if (countdown <= 0) {
                clearInterval(interval);
                btn.html('<i class="fas fa-paper-plane text-success"></i> Send');
                btn.prop("disabled", false);
            }
        }, 1000);
    })
    .fail((xhr) => {
        const error = xhr.responseJSON?.error || "An unexpected error occurred";
        showNotification("error", error);
        $("#send-otp").html('<i class="fas fa-paper-plane text-success"></i> Send');
        $("#send-otp").prop("disabled", false);
    });
})

/* End Login and Register */
$("body").css("background-image", "url('../../static/images/bg-4.jpg')")