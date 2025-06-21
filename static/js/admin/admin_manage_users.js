var CURRENT_USER_ID = undefined;
var online_users = [];
const fetchUserData = async () => {
    document.getElementById("loading").style.display = 'inline'
    try {
        const response = await fetch('/admin/api/fetchUsers');
        const data = await response.json();
        if(response.ok){
            userData = data
            CURRENT_USER_ID = userData.user_id
            showNotification("success", data.message)
            const tableBody = document.getElementById('userTableBody');
            userData.data.all_users.forEach(user => {
                const total = user.tasks_count + user.user_subtasks_count;
                const finished = user.finished_tasks_count + user.finished_subtasks_count;
                const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
                const activityColor = percent >= 20 ? 'success' : percent >= 50 ? 'warning' : 'danger';
                const activityText = `${percent}%`;
                document.getElementById('simple_users_nbr').textContent = userData.data.total_users
                document.getElementById('admin_nbr').textContent = userData.data.total_admin

                const row = user_row(user, activityColor, activityText)
                            
                tableBody.appendChild(row);

            });
        }else{
            CURRENT_USER_ID = userData.user_id
            showNotification("success", data.message)
        }
    } catch (error) {
        showNotification("error", error)
        
    }
    document.getElementById("loading").style.display = 'none'
}

function user_row(user, activityColor, activityText){
    const row = document.createElement('tr');
    row.id = `row${user.user_id}`
    row.innerHTML = `
        <td class='fw-bold'><img src="${user.profile_pic}" class="avatar-sm rounded-circle" alt="avatar" style="width: 50px; height: 50px; object-fit: cover;" /></td>
        <td class='text-start'><span class="small text-muted">#${user.user_id}</span> ${user.email} <span id="user${user.user_id}"></span></td>
        <td>${user.tasks_count}</td>
        <td>${user.finished_tasks_count}</td>
        <td>${user.user_subtasks_count}</td>
        <td>${user.finished_subtasks_count}</td>
        <td class='date'>
            ${formatDate(user.created_at).date}
            <span class="btn text-success time rounded-pill border border-success">${formatDate(user.created_at).time}</span>
        </td>
        <td class='date'>
            ${formatDate(user.updated_at).date}
            <span class="btn text-success time rounded-pill border border-success">${formatDate(user.updated_at).time}</span>
        </td>
        <td><span class="badge bg-${activityColor}">${activityText}</span></td>
        <td>
            <div class="form-check form-switch d-flex justify-content-center">
                <input class="form-check-input" type="checkbox" ${user.stat ? 'checked' : ''} onchange="toggleStatus(${user.user_id}, this.checked)">
            </div>
        </td>
        <td class=''>
            <div class="dropdown">
                <button class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-pen text-success"></i>
                </button>
                <ul class="dropdown-menu">
                    <li class="text-center d-flex justify-content-between align-items-center gap-2 px-2">
                        <i class="fas fa-user-shield ${user.admin ? 'text-success' : 'text-danger'}"></i>
                        <h6 class="m-0">Admin</h6>
                        <div class="form-check form-switch d-flex justify-content-center">
                            <input class="form-check-input" type="checkbox" ${user.admin ? 'checked' : ''} onchange="toggleAdmin(${user.user_id}, this.checked)">
                        </div>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" onclick="editProfile(${user.user_id})">
                            <i class="fas fa-id-badge me-2"></i> Edit Profile
                        </a>
                    </li>
                </ul>
            </div>
            <button class="btn btn-sm" onclick="deleteUser(${user.user_id})">
                <i class="fas fa-trash-alt text-danger"></i>
            </button>
        </td>
    `;
    return row
}

fetchUserData()
function formatDate(dateStr) {
    const date = new Date(dateStr);

    // Format date: Jan 25 2025
    const optionsDate = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);

    // Format time: 20:00
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

    return {
        date: formattedDate,
        time: formattedTime
    };
}


async function toggleStatus(userId) {
    document.getElementById("loading").style.display = 'inline';
    try{
        const response = await fetch(`/api/admin/suspendUser/${userId}`,{
            method: "PUT",
        });
        const data = await response.json();
        if(response.ok){
            showNotification("success", data.message)
        }else{
            showNotification("error", data.error)
        }
    } catch (error) {
        showNotification("error", error)
    }
    document.getElementById("loading").style.display = 'none';
}

async function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user ${userId}?`)) {
        document.getElementById("loading").style.display = 'inline';
        try{
            const response = await fetch(`/api/admin/deteteUser/${userId}`,{
                method: "DELETE",
            });
            const data = await response.json();
            if(response.ok){
                showNotification("success", data.message)
                document.getElementById(`row${userId}`).remove()
            }else{
                showNotification("error", data.message)
            }
        } catch (error) {
            showNotification("error", error)
        }
        document.getElementById("loading").style.display = 'none';
    }
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
    notification.classList.remove('d-none');

    setTimeout(() => {
      notification.classList.add('d-none');
    }, 5000);

    notification.addEventListener('click', () => {
        notification.classList.add('d-none');
    })
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    sidebar.classList.toggle('hidden');
    main.classList.toggle('full');
}

//Edit user feature
function editUser(user_id) {
    showNotification("success", `${user_id} is being edited`)   
}

//Edit profile feature
function editProfile(user_id) {
    showNotification("success", `${user_id} is being edited`)   
}

async function toggleAdmin(user_id) {
    document.getElementById("loading").style.display = 'inline';
    try{
        const response = await fetch(`/admin/api/editUserRole/${user_id}`,{
            method: "PUT",
        });
        const data = await response.json();
        if(response.ok){
            showNotification("success", data.message)
            try {
                const response = await fetch(`/api/user/notifications/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "user_id": user_id,
                        "message": `<span class='fw-bold btn bg-light border m-0'> <i class='fas fa-bullhorn text-success'></i> Role update</span> ${data.data ? 'Congratulation' : ''} You have been ${data.data ? 'granted' : 'removed from'} admin role`
                    })
                }); 

            } catch (error) {
                showNotification("error", error.message)
            }

        }else{
            showNotification("error", data.error)
        }

    } catch (error) {
        showNotification("error", error)
    }

    document.getElementById("loading").style.display = 'none';
}

const adduser_form = document.getElementById('adduser')

adduser_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const new_email = document.getElementById("new_email").value.trim('')
    const new_password = document.getElementById("password").value.trim('')
    const confirm_password = document.getElementById("confirm_password").value.trim('')
    const admin_privilege = document.getElementById("adminSwitch").checked

    new_user = {
        "email": new_email,
        "password": new_password,
        "confirmation_password": confirm_password,
        "admin_privilege": admin_privilege
    }

    try {
        const response = await fetch("/admin/adduser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(new_user)
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            showNotification("success", responseData.message)
            const user = responseData.data             
            let simple_user_nbr = document.getElementById('simple_users_nbr')
            let admin_nbr = document.getElementById('admin_nbr')
            const tableBody = document.getElementById('userTableBody')
            const row = user_row(user, 'danger', '0%')
            simple_user_nbr = parseInt(simple_user_nbr.textContent)
            admin_nbr = parseInt(admin_nbr.textContent)
            simple_user_nbr += 1
            document.getElementById('simple_users_nbr').textContent = simple_user_nbr
            document.getElementById('admin_nbr').textContent = user.admin ? admin_nbr + 1 : admin_nbr 
            tableBody.appendChild(row)

        } else {
            showNotification("error", responseData.error)
        }

    } catch (error) {
        showNotification("error", error)
    }

    document.getElementById("loading").style.display = "none";
})

document.getElementById("toggleFormBtn").addEventListener("click", () => {
    const form = document.getElementById("userForm");
    form.classList.toggle("d-none");
});

// Initialize Socket.IO
const socket = io({
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: true // Ensures a fresh connection
  });

socket.on('connect', () => {
    // Now tell server to join
    socket.emit('join', { user_id: CURRENT_USER_ID });
});

socket.on("user_online", (data) => {
    online_users = data
    document.getElementById('online_users_nbr').textContent = online_users.length
    online_users.map(user => {
        document.getElementById(`user${user}`).innerHTML = `<span class='btn ${ user == CURRENT_USER_ID ? 'btn-warning' : 'btn-success'} px-2 rounded-pill online'>${ user == CURRENT_USER_ID ? 'You' : 'Online'}</span>`
    })
});

socket.on("user_offline", (data) => {
    online_users = data.online_users
    document.getElementById(`user${data.disconnected}`).innerHTML = '';
    document.getElementById('online_users_nbr').textContent = online_users.length;
    online_users.map(user => {
        document.getElementById(`user${user}`).innerHTML = `<span class='btn ${ user == CURRENT_USER_ID ? 'btn-warning' : 'btn-success'} px-2 rounded-pill online'>${ user == CURRENT_USER_ID ? 'You' : 'Online'}</span>`
    })
});

let announcement_form = document.getElementById('announcement_form')

announcement_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const announcement_subject = document.getElementById("announcement_subject").value.trim('')
    const announcement = document.getElementById("announcement").value.trim('')

    if (announcement_subject == '' || announcement == '') {
        showNotification("error", 'All fields are required')
        return
    }

    try {
        const response = await fetch("/api/admin/notifications/announcement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "announcement_subject": announcement_subject,
                "announcement": announcement
            })
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            showNotification("success", responseData.message)
            announcement_form.reset()
        } else {
            showNotification("error", responseData.error)
        }

    } catch (error) {
        showNotification("error", error)
    }
})