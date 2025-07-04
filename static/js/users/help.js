const email_form = document.getElementById("contact-form")

email_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const first_name = document.getElementById("first_name").value.trim('')
    const last_name = document.getElementById("last_name").value.trim('')
    const phone = document.getElementById("phone").value.trim('')
    const message = document.getElementById("messageContent").value.trim('')
    const user = {
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        'email': '',
        "message": message
    }

    document.getElementById('submit_feedback').innerHTML = '<i class="fas fa-spinner fa-spin text-light"></i> Sending...'
    document.getElementById('submit_feedback').disabled = true

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
    document.getElementById('submit_feedback').innerHTML = '<i class="fas fa-paper-plane text-light"></i> Send'
    document.getElementById('submit_feedback').disabled = false
})