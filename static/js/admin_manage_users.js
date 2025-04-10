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
                row.id = `row${user.user_id}`
                row.innerHTML = `
                    <td class=' fw-bold'>${user.user_id}</td>
                    <td class='text-start'>${user.email}</td>
                    <td class=''>${user.tasks_count}</td>
                    <td class=''>${user.finished_tasks_count}</td>
                    <td class=''>${user.user_subtasks_count}</td>
                    <td class=''>${user.finished_subtasks_count}</td>
                    <td class=''>${formatDate(user.created_at)}</td>
                    <td class=''>${formatDate(user.updated_at)}</td>
                    <td class=''><span class="badge bg-${activityColor}">${activityText}</span></td>
                    <td class=''>
                        <div class="form-check form-switch d-flex justify-content-center">
                            <input class="form-check-input" type="checkbox" ${user.stat ? 'checked' : ''} onchange="toggleStatus(${user.user_id}, this.checked)">
                        </div>
                    </td>
                    <td class=''>
                        <button class="btn" onclick="editUser(${user.user_id})"><i class="fas fa-pen text-success"></i></button>
                        <button class="btn" onclick="deleteUser(${user.user_id})"><i class="fas fa-trash text-danger"></i></button>
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

async function toggleStatus(userId) {
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
}

async function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user ${userId}?`)) {
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

//Edit user feature
function editUser(user) {
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editPassword').value = "";

    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
  }

  // Handle form submission
  document.getElementById('editUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;
    const password = document.getElementById('editPassword').value;

    // Your logic here: send to server, update UI, etc.
    console.log({ userId, email, role, password });

    // Close modal after saving
    bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
  });

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    sidebar.classList.toggle('hidden');
    main.classList.toggle('full');
    $(".toggle-btn").css("margin-left", "20%")
}