const email_form = document.getElementById("contact-form")

email_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const first_name = document.getElementById("first_name").value.trim('')
    const last_name = document.getElementById("last_name").value.trim('')
    const phone = document.getElementById("phone").value.trim('')
    const message = document.getElementById("messageContent").value.trim('')
    const email = document.getElementById("email").value.trim('')
    const user = {
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        "email": email,
        "message": message
    }

    document.getElementById('submit_feedback').textContent = 'Loading ...'
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
                document.getElementById('submit_feedback').textContent = 'Submit'

            } else {
                showNotification("error", responseData.error)
                document.getElementById('submit_feedback').textContent = 'Submit'
            }
        } catch (error) {
            showNotification("error", res.error)
            document.getElementById('submit_feedback').textContent = 'Submit'
        }
    }else{
        const err = (await res).error
        showNotification('error', err)
        document.getElementById('submit_feedback').textContent = 'Submit'
    }
    
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