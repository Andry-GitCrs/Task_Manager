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

$('#forgot-password-form').on('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim('');
    const new_password = document.getElementById('new_password').value.trim('');
    const confirm_password = document.getElementById('confirm_password').value.trim('');
    const otp = document.getElementById('otp').value.trim('');
    let submitBtn = document.getElementById('submit');

    user = {
        "email": email,
        "new_password": new_password,
        "confirmation_password": confirm_password,
        "otp": otp
    }
    $(".loading-dash").css("display", 'inline');
    submitBtn.disabled = true;
    try {
        const response = await fetch("/api/user/forgot_password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            showNotification("success", responseData.message)
            submitBtn.textContent = 'Redirecting...';
            setTimeout(() => {
              location.href = '/auth'
              submitBtn.textContent = 'Submit';
            }, 2000);

        } else {
            showNotification("error", responseData.error)

        }

    } catch (error) {
        showNotification("error", error)
        
    }
    $(".loading-dash").css("display", 'none');
    submitBtn.disabled = false;
});

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
    const email = $("#email").val().trim()
    if(email === "") {
        showNotification("error", "Please enter your email address");
        return
    }
    $("#send-otp").prop("disabled", true);
    $("#send-otp").html('<i class="fas fa-spinner fa-spin text-success"></i>')
    $.post(`/api/user/sendOtp/${email}`)
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
        console.error(error);
        showNotification("error", error);
        $("#send-otp").html('<i class="fas fa-paper-plane text-success"></i> Send');
        $("#send-otp").prop("disabled", false);
    });
})


$("body").css("background-image", "url('../../static/images/bg-4.jpg')")