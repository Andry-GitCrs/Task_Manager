const fetchUserData = async () => {
    document.getElementById("loading").style.display = 'inline'
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
            makeLineChart(userData)
            makeCircularChart(userData)
            makeBarChart(userData)
        }else{
            showNotification("success", data.message)
        }
    } catch (error) {
        showNotification("error", error)
    }
    document.getElementById("loading").style.display = 'none';
}


fetchUserData()


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

function makeLineChart(userData) {
    const canvas = document.getElementById('user_activity_lineChart');
    const ctx = canvas.getContext('2d');

    const labels = userData.data.active_users.map(user => user.user_id);
    const taskData = userData.data.active_users.map(user => user.tasks_count);
    const finishedSubtaskData = userData.data.active_users.map(user => user.finished_subtasks_count);

    const gradientBlue = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientBlue.addColorStop(0, 'rgba(13,110,253,0.7)');   // Top
    gradientBlue.addColorStop(1, 'rgba(13,110,253,0.1)');   // Bottom

    const gradientGreen = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientGreen.addColorStop(0, 'rgba(25,135,84,0.7)');
    gradientGreen.addColorStop(1, 'rgba(25,135,84,0.1)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tasks',
                    data: taskData,
                    borderColor: '#0d6efd',
                    backgroundColor: gradientBlue,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: 'Finished Subtasks',
                    data: finishedSubtaskData,
                    borderColor: '#198754',
                    backgroundColor: gradientGreen,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'User Activities Over Time',
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${context.parsed.y}`
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'User ID'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
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
                backgroundColor: ['#8bfc40d0', '#74757431'],
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


function makeBarChart(userData) {
    const chartCtx = document.getElementById('usersChart').getContext('2d');

    const labels = userData.data.active_users.map(user => user.user_id);
    const data = userData.data.active_users.map(user => user.finished_subtasks_count);

    // Create gradient fill
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(25, 135, 84, 0.9)');  // top - green
    gradient.addColorStop(0.5, 'rgba(255, 193, 7, 0.8)'); // middle - yellow
    gradient.addColorStop(1, 'rgba(220, 53, 69, 0.8)');  // bottom - red

    new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Finished Subtasks Count',
                data: data,
                backgroundColor: gradient,
                borderColor: '#0d6efd',
                borderWidth: 2,
                borderRadius: 6,        // Rounded corners
                hoverBackgroundColor: '#198754',
                hoverBorderColor: '#145c32'
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1000,
                easing: 'easeOutBounce'
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: '📊 Finished Subtasks per User',
                    color: '#343a40',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                tooltip: {
                    backgroundColor: '#212529',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 5,
                    borderColor: '#0d6efd',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#495057'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}
