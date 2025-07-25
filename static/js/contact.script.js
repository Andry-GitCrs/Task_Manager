const email_form = document.getElementById("contact-form")

email_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const first_name = document.getElementById("first_name").value.trim('')
    const last_name = document.getElementById("last_name").value.trim('')
    const phone = document.getElementById("phone").value.trim('')
    const message = document.getElementById("messageContent").value.trim('')
    const email = document.getElementById("email").value.trim('')
    user = {
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        "email": email,
        "message": message
    }

    document.getElementById('submit_feedback').innerHTML = '<i class="fas fa-spinner fa-spin text-light"></i> Sending...'
    document.getElementById('submit_feedback').disabled = true
    
    const res = verify_email(email)
    if( (await res).is_valid == true ){
        try {
            const response = await fetch("/api/send_email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            });
    
            const responseData = await response.json();
    
            if (response.ok) {  //Response with status code 200
                showNotification("success", responseData.message)

            } else {
                showNotification("error", responseData.error)
            }
        } catch (error) {
            showNotification("error", res.error)
        }
    }else{
        err = (await res).error
        showNotification('error', err)
    }
    
    document.getElementById('submit_feedback').innerHTML = '<i class="fas fa-paper-plane text-light"></i> Send'
    document.getElementById('submit_feedback').disabled = false
})


async function verify_email(email) {
    const response = await fetch('/api/verify_email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email
        }),
    });

    const data = await response.json();

    if (response.ok) {
        return {
            'is_valid': data.is_valid,
            'message': data.message
        }
    } else {
        return {
            'is_valid': false,
            'error': (await data).error
        }
    }
}


document.getElementById('menu-btn').addEventListener('click', function () {
    document.getElementById('menu-list').classList.toggle('active');
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
    notification.classList.remove('d-none');

    setTimeout(() => {
      notification.classList.add('d-none');
    }, 5000);
}

$("body").css("background-image", "url('../../static/images/bg-4.jpg')")