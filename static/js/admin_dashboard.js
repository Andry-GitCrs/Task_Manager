
const fetchUserData = async () => {
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

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class='text-center fw-bold'>${user.user_id}</td>
                    <td>${user.email}</td>
                    <td class='text-center'>${user.tasks_count}</td>
                    <td class='text-center'>${user.finished_tasks_count}</td>
                    <td class='text-center'>${user.user_subtasks_count}</td>
                    <td class='text-center'>${user.finished_subtasks_count}</td>
                    <td class='text-center'>${formatDate(user.created_at)}</td>
                    <td class='text-center'>${formatDate(user.updated_at)}</td>
                    <td class='text-center'><span class="badge bg-${activityColor}">${activityText}</span></td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" ${user.stat ? 'checked' : ''} onchange="toggleStatus(${user.user_id}, this.checked)">
                            <label class="form-check-label">${user.stat ? 'Active' : 'Inactive'}</label>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm" onclick="editUser(${user.user_id})"><i class="fas fa-pen text-success"></i></button>
                        <button class="btn btn-sm" onclick="deleteUser(${user.user_id})"><i class="fas fa-trash text-danger"></i></button>
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
}


fetchUserData()


function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
}

async function toggleStatus(userId, status) {
    try{
        const response = await fetch(`/api/admin/suspendUser/${userId}`,{
            method: "PUT",
        });
        const data = await response.json();
        if(response.ok){
            showNotification("success", data.message)
        }else{
            showNotification("error", data.message)
        }
    } catch (error) {
        showNotification("error", error)
    }
}

function editUser(userId) {
    alert(`Edit user #${userId}`);
}

function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user ${userId}?`)) {
        showNotification("success", `Deleted user ${userId}`);
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



























