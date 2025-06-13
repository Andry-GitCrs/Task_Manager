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

    // Blue gradient
    const gradientBlue = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientBlue.addColorStop(0, 'rgba(13,110,253,0.5)');
    gradientBlue.addColorStop(1, 'rgba(13,110,253,0.05)');

    // Green gradient
    const gradientGreen = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientGreen.addColorStop(0, 'rgba(25,135,84,0.5)');
    gradientGreen.addColorStop(1, 'rgba(25,135,84,0.05)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Tasks',
                    data: taskData,
                    borderColor: '#0d6efd',
                    backgroundColor: gradientBlue,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#0d6efd',
                },
                {
                    label: 'Finished Subtasks',
                    data: finishedSubtaskData,
                    borderColor: '#198754',
                    backgroundColor: gradientGreen,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#198754',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 20
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'User Activities Over Time',
                    font: {
                        size: 20,
                        family: 'Segoe UI, sans-serif',
                        weight: 'bold'
                    },
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#333',
                    bodyColor: '#000',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    callbacks: {
                        label: context => `${context.dataset.label}: ${context.parsed.y}`
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: '#555',
                        font: {
                            size: 13
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'User ID',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        color: '#555'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        color: '#555'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
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
    animatePercentage(completionPercent)

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
    const canvas = document.getElementById('usersChart');
    const ctx = canvas.getContext('2d');

    const labels = userData.data.active_users.map(user => user.user_id);
    const data = userData.data.active_users.map(user => user.finished_subtasks_count);

    // Modern gradient (top -> bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(25, 135, 84, 0.85)');    // Green
    gradient.addColorStop(0.5, 'rgba(255, 193, 7, 0.75)');  // Yellow
    gradient.addColorStop(1, 'rgba(220, 53, 69, 0.75)');    // Red

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Finished Subtasks',
                data,
                backgroundColor: gradient,
                borderColor: '#6c757d',
                borderWidth: 1.5,
                borderRadius: 8,
                hoverBackgroundColor: '#198754',
                hoverBorderColor: '#145c32',
                barPercentage: 0.6,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 10,
                    right: 10
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Finished Subtasks per User',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#000',
                    bodyColor: '#333',
                    borderColor: '#dee2e6',
                    borderWidth: 1,
                    callbacks: {
                        label: context => ` ${context.dataset.label}: ${context.parsed.y}`
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'User ID',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Finished Subtasks',
                        font: {
                            size: 14
                        }
                    },
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

async function populateActiveUsersList() {
  try {
    const response = await fetch('/api/user/mostActiveUser');
    if (!response.ok) throw new Error('Failed to fetch active users');

    const result = await response.json();
    const users = result.data;

    const listContainer = document.getElementById('activeUsersList');
    listContainer.innerHTML = ''; // Clear existing list items

    users.forEach((user, index) => {
      // Use placeholder avatars or index-based fallback
      const avatarPath = `/static/images/profile.png`;
      const li = document.createElement('li');
      li.className = 'd-flex justify-content-between align-items-center p-3 mb-2 rounded shadow-sm bg-light custom-hover';

      li.innerHTML = `
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
            <img src="${avatarPath}" class="avatar-sm rounded-circle" alt="avatar" />
            <span class="fw-medium text-truncate" style="max-width: 150px;">${user.email.split('@')[0]}</span>
        </div>
        <span class="badge bg-success-subtle text-success flex-shrink-0">${user.finished_subtasks_count} actions</span>
    `;

      listContainer.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading active users list:', error);
  }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', populateActiveUsersList);