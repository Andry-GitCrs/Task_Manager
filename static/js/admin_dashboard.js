
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
            makeLineChart(userData)
            makeCircularChart(userData)
            makeBarChart(userData)
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

function makeLineChart(userData) {
    const lineCtx = document.getElementById('user_activity_lineChart').getContext('2d');
    const lineLabels = userData.data.active_users.map(user => user.email);
    const taskData = userData.data.active_users.map(user => user.tasks_count);
    const finishedSubtaskData = userData.data.active_users.map(user => user.finished_subtasks_count);
    // Charts

    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: lineLabels,
            datasets: [
                {
                    label: 'Tasks',
                    data: taskData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13,110,253,0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Finished Subtasks',
                    data: finishedSubtaskData,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25,135,84,0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'User Activities Over Time'
                }
            }
        }
    });
}

function makeCircularChart(userData){
    const circularCtx = document.getElementById('user_circularChart').getContext('2d');
    const finishedTotal = userData.data.finished_subtask_count + userData.data.finished_tasks_count;
    const totalAll = userData.data.total_subtask_count + userData.data.total_task_count;
    const completionPercent = ((finishedTotal / totalAll) * 100).toFixed(2);

    new Chart(circularCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                label: 'Completion %',
                data: [finishedTotal, totalAll - finishedTotal],
                backgroundColor: ['#198754', '#dee2e6'],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + ' (' + ((context.raw / totalAll * 100).toFixed(1)) + '%)';
                        }
                    }
                },
                legend: { display: true, position: 'bottom' },
                title: { display: true, text: `Total Task/Subtask Completion: ${completionPercent}%` }
            },
            cutout: '70%'
        }
    });
}


function makeBarChart(userData){
    const chartCtx = document.getElementById('usersChart').getContext('2d');
    const labels = userData.data.active_users.map(user => user.email);
    const data = userData.data.active_users.map(user => user.finished_subtasks_count);

    new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Finished Subtasks Count',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Finished Subtasks per User' }
            },
            scales: { y: { beginAtZero: true } }
        }
    });
}


















