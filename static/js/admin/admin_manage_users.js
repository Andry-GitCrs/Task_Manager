const fetchUserData = async () => {
    document.getElementById("loading").style.display = 'inline'
    try {
        const response = await fetch('/admin/api/fetchUsers');
        const data = await response.json();
        if(response.ok){
            userData = data
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

                const row = document.createElement('tr');
                row.id = `row${user.user_id}`
                row.innerHTML = `
                    <td class='fw-bold'>${user.user_id}</td>
                    <td class='text-start'>${user.email}</td>
                    <td>${user.tasks_count}</td>
                    <td>${user.finished_tasks_count}</td>
                    <td>${user.user_subtasks_count}</td>
                    <td>${user.finished_subtasks_count}</td>
                    <td class='date'>${formatDate(user.created_at)}</td>
                    <td class='date'>${formatDate(user.updated_at)}</td>
                    <td><span class="badge bg-${activityColor}">${activityText}</span></td>
                    <td>
                        <div class="form-check form-switch d-flex justify-content-center">
                            <input class="form-check-input" type="checkbox" ${user.stat ? 'checked' : ''} onchange="toggleStatus(${user.user_id}, this.checked)">
                        </div>
                    </td>
                    <td class='d-flex gap-2'>
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
                            <i class="fas fa-trash text-danger"></i>
                        </button>
                    </td>
                `;
                            
                tableBody.appendChild(row);

            });
        }else{
            showNotification("success", data.message)
        }
    } catch (error) {
        showNotification("error", error)
        
    }
    document.getElementById("loading").style.display = 'none'
}

fetchUserData()
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
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
    notification.className = 'position-fixed top-0 start-50 translate-middle-x mt-3 px-4 py-3 shadow rounded text-white d-flex align-items-center gap-2';
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
        }else{
            showNotification("error", data.error)
        }
    } catch (error) {
        showNotification("error", error)
    }
    document.getElementById("loading").style.display = 'none';
}