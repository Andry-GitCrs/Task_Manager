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
            const cardsWrapper = document.getElementById('userCardsWrapper');
            cardsWrapper.innerHTML = ''; // clear previous

            userData.data.all_users.forEach(user => {
                const total = user.tasks_count + user.user_subtasks_count;
                const finished = user.finished_tasks_count + user.finished_subtasks_count;
                const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
                const activityColor = percent >= 50 ? 'success' : percent >= 20 ? 'warning' : 'danger';
                const activityText = `${percent}%`;

                document.getElementById('simple_users_nbr').textContent = userData.data.total_users;
                document.getElementById('admin_nbr').textContent = userData.data.total_admin;

                const card = user_card(user, activityColor, activityText);
                cardsWrapper.appendChild(card);
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

function user_card(user, activityColor, activityText) {
    const col = document.createElement("div");
    col.className = "col-sm-12 col-md-6 col-lg-4 d-flex justify-content-center mb-4";

    col.innerHTML = `
        <div class="card user-ui-card border rounded-top-4" id="row${user.user_id}" style="z-index: 1">
            <div class="card__img rounded-top-4">
                <img src="${user.cover_pic}" alt="" width="100%" height="100%" class="rounded-top-4" style="object-fit: cover;"/>
            </div>

            <div class="card__avatar position-relative" style="top: -50px; margin: 0 auto">
                <span class="position-absolute bottom-0 end-0" id="user${user.user_id}"></span>
                <img src="${user.profile_pic}" alt="avatar" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">
            </div>

            <div class="card__title text-center" style="transform: translateY(-50%)">
                <span class="small"><span class="text-muted">#${user.user_id}</span> ${user.username ? user.username : user.email.split('@')[0]}</span>
                <p class="card__subtitle my-2">
                    ${user.bio}
                </p>
                <span class="small">
                    <i class="fas fa-calendar-plus fs-6 text-success"></i> ${formatDate(user.created_at).date}
                    <span class="btn text-success time rounded-pill border border-success">${formatDate(user.created_at).time}</span>
                </span>
            </div>
            <div class="d-flex flex-column gap-2 px-3 text-center mt-2 w-100" style="transform: translateY(-25%)">
                <!-- Tasks -->
                <div class="doughnut-container text-center my-3">
                    <div class="small mt-2 text-muted w-50 text-start text-truncate">
                        <span class="fw-bold"><i class="fas fa-user-shield text-secondary fs-6"></i> • </span> <strong class="badge bg-${user.admin ? 'success' : 'danger'}"> ${user.admin ? 'Admin' : 'User'}</strong> <br />
                        <span class="fw-bold"><i class="fas fa-flag text-${user.stat ? 'success' : 'danger'} fs-6"></i> • </span><span class="fw-bold"> ${user.stat ? 'Active' : 'Suspended'}</span> <br />
                        <strong class=""><i class="fas fa-tasks text-secondary fs-6"></i> • <strong>${user.finished_tasks_count}</strong> / ${user.tasks_count}</strong>  <br>
                        <strong class=""><i class="fas fa-stream text-primary fs-6"></i> • <strong>${user.finished_subtasks_count}</strong> / ${user.user_subtasks_count}</strong> <br>
                        <strong class="" style="max-width: 100px; overflow: hidden;"><i class="fas fa-envelope text-secondary fs-6"></i> • <span class="small" >${user.email}</span> </strong> 
                    </div>

                    <div>
                        <h5 class="small"><i class="fas fa-bolt text-${activityColor} fs-5"></i> Activitie</h5>
                        <div class="doughnut" id="progress${user.user_id}">
                            <span class="doughnut-label text-${activityColor}" id="label${user.user_id}">${activityText}</span>
                        </div>
                    </div>
                </div>

                <!-- Actions Dropdown -->
                <div class="dropdown">
                    <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user-gear text-open text-secondary fs-6"></i> Action
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end text-start shadow-sm rounded-3 p-2" style="min-width: 200px">
                        <!-- Admin toggle -->
                        <li class="d-flex justify-content-between align-items-center mb-2 px-2">
                            <div>
                                <i class="fas fa-user-shield fs-6 me-2 ${user.admin ? 'text-success' : 'text-danger'}"></i>
                                <small>Admin</small>
                            </div>
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input" type="checkbox" ${user.admin ? 'checked' : ''} onchange="toggleAdmin(${user.user_id}, this.checked)">
                            </div>
                        </li>

                        <!-- Status toggle -->
                        <li class="d-flex justify-content-between align-items-center mb-2 px-2">
                            <div>
                                <i class="fas fa-flag fs-6 me-2 text-success"></i>
                                <small>Status</small>
                            </div>
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input" type="checkbox" ${user.stat ? 'checked' : ''} onchange="toggleStatus(${user.user_id}, this.checked)">
                            </div>
                        </li>

                        <!-- Edit Profile -->
                        <li class="px-2">
                            <button class="dropdown-item d-flex align-items-center gap-2" onclick="editProfile(${user.user_id})">
                                <i class="fas fa-id-badge fs-6 text-primary"></i> <span>Edit Profile</span>
                            </button>
                        </li>

                        <!-- Delete User -->
                        <li class="px-2">
                            <button class="dropdown-item d-flex align-items-center gap-2 text-danger" onclick="deleteUser(${user.user_id})">
                                <i class="fas fa-trash-alt fs-6 text-danger"></i> <span>Delete User</span>
                            </button>
                        </li>
                    </ul>
                </div>
                <span class="small">
                    <i class="fas fa-calendar-check fs-6 text-warning"></i> ${formatDate(user.updated_at).date}
                    <span class="btn text-success time rounded-pill border border-success"> ${formatDate(user.updated_at).time}</span>
                </span>
            </div>


        </div>
    `;
    const total = user.tasks_count + user.user_subtasks_count;
    const done = user.finished_tasks_count + user.finished_subtasks_count;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const progressCircle = col.querySelector(`#progress${user.user_id}`);
    const label = col.querySelector(`#label${user.user_id}`);

    if (progressCircle && label) {
        progressCircle.style.background = `conic-gradient(var(--bs-${activityColor}) ${percent}%, #dee2e6 ${percent}%)`;
        label.textContent = `${percent}%`;
    }

  return col;
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
                showNotification("error", data.error)
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