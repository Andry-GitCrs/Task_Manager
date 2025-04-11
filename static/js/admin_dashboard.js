
const fetchUserData = async () => {
    try {
        const response = await fetch('/admin/api/fetchUsers');
        const data = await response.json();
        if(response.ok){
            userData = data
            showNotification("success", "Data Fetched successffully")
            document.getElementById('total_users').textContent = userData.data.total_users
            document.getElementById('users_tasks').textContent = userData.data.total_task_count
            document.getElementById('users_subtasks').textContent = userData.data.total_subtask_count
            document.getElementById('finished_subtasks').textContent = userData.data.finished_subtask_count
            const progress_bar_subtask = (userData.data.total_subtask_count * userData.data.finished_subtask_count ) / 100
            document.getElementById("users_subtasks_percent").style.width = progress_bar_subtask + '%'
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
    const lineLabels = userData.data.active_users.map(user => user.user_id);
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
    document.getElementById('percentage_nbr').textContent = completionPercent

    new Chart(circularCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                label: 'Completion %',
                data: [finishedTotal, totalAll - finishedTotal],
                backgroundColor: ['#eaec45', '#1c915a94' ],
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
    const labels = userData.data.active_users.map(user => user.user_id);
    const data = userData.data.active_users.map(user => user.finished_subtasks_count);

    new Chart(chartCtx, {
        type: 'line',
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

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    sidebar.classList.toggle('hidden');
    main.classList.toggle('full');
}


document.getElementById('updateForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim('');
    const oldconfirmPassword = document.getElementById('oldconfirmPassword').value.trim('')
    const newPassword = document.getElementById('newPassword').value.trim('');
    const confirmPassword = document.getElementById('confirmPassword').value.trim('');

    user = {
        "email": email,
        "old_password": oldconfirmPassword,
        "new_password": newPassword,
        "confirmation_password": confirmPassword
    }
    
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
});








