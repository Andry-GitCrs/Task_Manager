$('#update-form').on('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim('');
    const current_password = document.getElementById('current_password').value.trim('')
    const new_password = document.getElementById('new_password').value.trim('');
    const confirm_password = document.getElementById('confirm_password').value.trim('');

    user = {
        "email": email,
        "old_password": current_password,
        "new_password": new_password,
        "confirmation_password": confirm_password
    }
    $(".loading-dash").css("display", 'inline');
    try {
        const response = await fetch("/api/user/update", {
            method: "PUT",
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
        showNotification("error", error)
        
    }
    $(".loading-dash").css("display", 'none');
});