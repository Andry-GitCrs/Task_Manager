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

// Chart
let chartInstance = null;

  function createGradient(ctx, chartArea, data) {
    const max = Math.max(...data);
    const min = Math.min(...data);

    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

    // Helper to calculate position in gradient
    const getStop = value => (value - min) / (max - min);

    // Red → Yellow → Green
    gradient.addColorStop(0, 'red'); // lowest
    gradient.addColorStop(0.5, 'yellow'); // middle
    gradient.addColorStop(1, 'green'); // highest

    return gradient;
  }

  function loadChartData() {
    $('#chartStatus').text('Loading chart...');

    $.getJSON('/api/user/daily_finished_subtasks', function (response) {
      const data = response.data || [];

      if (data.length === 0) {
        $('#chartStatus').text('No finished subtasks found.');
        if (chartInstance) {
          chartInstance.destroy();
          chartInstance = null;
        }
        return;
      }

      const labels = data.map(item => {
        const date = new Date(item.date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        return `${day} ${month}`;
      });
      const counts = data.map(item => item.count);

      const ctx = $('#subtaskLineChart')[0].getContext('2d');

      if (chartInstance) {
        chartInstance.destroy();
      }

      // Initial dummy config to access `chartArea` later
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Finished Subtasks',
            data: counts,
            borderColor: 'rgba(0, 0, 0, 0.5)', // temporary
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          animation: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: context => `${context.parsed.y} subtasks`
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Subtasks Finished'
              },
              ticks: {
                stepSize: 1
              }
            }
          }
        },
        plugins: [{
          id: 'customGradientLine',
          beforeDatasetsDraw(chart) {
            const dataset = chart.data.datasets[0];
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const gradient = createGradient(ctx, chartArea, dataset.data);

            dataset.borderColor = gradient;
            dataset.backgroundColor = gradient;
          }
        }]
      });

      $('#chartStatus').text('');
    }).fail(function () {
      $('#chartStatus').text('Failed to load chart data.');
    });
  }

  $(document).ready(function () {
    loadChartData();
    $('#refreshChart').on('click', loadChartData);
  });

  // Fetch and display user data
  function formatProfileDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

function renderTaskLists(lists) {
  return lists.map(createListCard).join('');
}

function createListCard(list) {
  return `
    <div class="list-card w-100 mb-4 p-3 border rounded-4 shadow-sm" style="background-color: #f8f9fa;">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h5 fw-bold text-dark"><i class="fas fa-bookmark me-2 text-secondary"></i> ${list.list_name}</h2>
        <small class="text-muted">Created: ${formatProfileDate(list.created_at)}</small>
        <small class="text-muted">${list.tasks.length} Tasks</small>
      </div>
      <p class="text-muted">${list.list_description || "No description"}</p>

      <div class="task-list">
        ${list.tasks.length > 0 ? list.tasks.map(createTaskRow).join('') : '<p class="text-muted">No tasks in this list</p>'}
      </div>
    </div>
  `;
}

function createTaskRow(task) {
  const isDone = task.subtasks.length !== 0 && task.finished_subtask_nbr === task.subtasks.length;
  const statusColor = isDone ? 'bg-success text-light' : 'bg-dark text-warning';
  const statusText = isDone ? '<i class="fas fa-check-circle me-1"></i> Done' : '<i class="fas fa-hourglass-half me-1"></i> In Progress';
  const activeColor = task.stat ? 'text-success' : 'text-danger';
  const activeText = task.stat ? 'Active' : 'Deleted';

  const progressPercent = task.subtasks.length
    ? Math.round((task.finished_subtask_nbr / task.subtasks.length) * 100)
    : 0;

  const subtaskRows = task.subtasks.length > 0
    ? task.subtasks.map((subtask, index) => {
        const status = subtask.stat
          ? '<span class="badge bg-success p-2 rounded-pill"><i class="fas fa-check-circle me-1"></i>Active</span>'
          : '<span class="badge bg-danger p-2 rounded-pill"><i class="fas fa-times me-1"></i>Deleted</span>'
        const finishedBadge = subtask.finished
          ? '<span class="badge bg-success p-2 rounded-pill"><i class="fas fa-check-circle me-1"></i>Done</span>'
          : '<span class="badge bg-warning p-2 rounded-pill text-dark"><i class="fas fa-hourglass-half me-1"></i>Pending</span>';

        return `
          <li class="list-group-item d-flex justify-content-between align-items-center px-4 py-3 mb-2 subtask-item border-0 shadow-sm rounded-3 bg-white hover-shadow">
            <span class="d-flex align-items-center">
              <i class="fas fa-angle-right me-3 text-primary fs-5"></i>
              <span class="fw-semibold text-secondary">${index + 1}. ${subtask.subtask_title}</span>
            </span>
            <span class="d-flex align-items-center gap-2">
              ${finishedBadge}
              ${status}
            </span>
          </li>
        `;
      }).join('')
    : '<li class="list-group-item d-flex justify-content-between align-items-center px-4 py-3 mb-2 subtask-item border-0 shadow-sm rounded-3 bg-white hover-shadow"><span class="d-flex align-items-center">No subtasks</span></li>';
  const cardId = `collapseSubtasks${task.task_id}`;

  return `
    <div class="task-card p-4 rounded-4 border shadow-sm mb-4" style="background: linear-gradient(135deg, ${task.task_background_color}44, #ffffff);" id='task${task.task_id}'>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h3 class="h5 fw-bold text-dark mb-0">${task.task_title}</h3>
        <span class="small text-muted"><i class="fas fa-clock me-1"></i>Updated: ${formatProfileDate(task.updated_at)}</span>
      </div>

      <div class="mb-3 px-2">
        <p class="mb-1 text-muted"><i class="fas fa-align-left me-2 text-primary"></i><strong>Description:</strong> ${task.task_description || "No description"}</p>
        <p class="mb-1 text-muted"><i class="fas fa-play-circle me-2 text-success"></i><strong>Start:</strong> ${formatProfileDate(task.start_date)}</p>
        <p class="mb-1 text-muted"><i class="fas fa-flag-checkered me-2 text-danger"></i><strong>End:</strong> ${formatProfileDate(task.end_date)}</p>
      </div>

      <div class="row text-muted small mb-3 px-2">
        <div class="col-6 col-md-3"><i class="fas fa-hashtag me-1"></i><strong>Task ID:</strong> #${task.task_id}</div>
        <div class="col-6 col-md-3"><i class="fas fa-stream me-1"></i><strong>Subtasks:</strong> ${task.subtasks.length}</div>
        <div class="col-6 col-md-3"><i class="fas fa-check-double me-1"></i><strong>Completed:</strong> ${task.finished_subtask_nbr}/${task.subtasks.length}</div>
        <div class="col-6 col-md-3"><i class="fas fa-info-circle me-1"></i><strong>Status:</strong> <span class="badge rounded-pill ${statusColor} p-2">${statusText}</span></div>
      </div>

      <div class="px-2 mb-3">
        <div class="progress" style="height: 6px;">
          <div class="progress-bar ${statusColor}" role="progressbar" style="width: ${progressPercent}%" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="text-end small text-muted mt-1">${progressPercent}% complete</div>
      </div>

      <div class="d-flex justify-content-between text-muted small px-2 mb-3">
        <span><i class="fas fa-calendar-plus me-1"></i>Created: ${formatProfileDate(task.created_at)}</span>
        <span id='statFlag${task.task_id}'>Status flag: <strong class="${activeColor}">${activeText}</strong></span>
      </div>

      <div class="d-flex justify-content-between text-muted small px-2 mb-3" id='taskBtn${task.task_id}'>
        ${ task.stat ? '' : `
          <button class="rounded-pill btn btn-success btn-sm px-3 py-1" onclick='restoreTask(${task.task_id})' >
            <i class="fas fa-trash-restore me-1"></i>
            Restore
          </button>
          <button class="rounded-pill btn btn-danger btn-sm px-3 py-1" onclick='deleteTask(${task.task_id})' >
            <i class="fas fa-trash-alt me-1"></i>
            Delete Permanently
          </button>
        `}
      </div>

      <div class="accordion" id="accordionTask${task.task_id}">
        <div class="accordion-item border-0">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed px-2 py-1 small fw-bold text-muted" type="button" data-bs-toggle="collapse" data-bs-target="#${cardId}">
              <i class="fas fa-tasks me-2 text-warning"></i>View Subtasks
            </button>
          </h2>
          <div id="${cardId}" class="accordion-collapse collapse" data-bs-parent="#accordionTask${task.task_id}">
            <div class="accordion-body px-0 pt-2 pb-0">
              <ul class="list-group list-group-flush">
                ${subtaskRows}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function fetchUserTasks() {
  try {
    const response = await fetch('/api/user/fetchTask');
    const data = await response.json();

    if (response.ok) {
      const tasksContainer = document.getElementById('task-list');

      if (!data.data || data.data.length === 0) {
        tasksContainer.innerHTML = '<p class="text-muted">No task lists found.</p>';
        return;
      }

      tasksContainer.innerHTML = renderTaskLists(data.data);
      showNotification("success", data.message);
    } else {
      showNotification("error", data.message);
    }
  } catch (err) {
    showNotification("error", `Failed to fetch tasks: ${err}`);
  }
}

fetchUserTasks();

// Delete a task permantely
async function deleteTask(task_id) {
  if (confirm(`Are you sure you want this task ${task_id}?`)) {
    $(".loading-dash").css("display", 'inline');
      try{
          const response = await fetch(`/api/user/deleteTaskPermanentely/${task_id}`,{
              method: "DELETE",
          });
          const data = await response.json();
          if(response.ok){
              showNotification("success", data.message)
              document.getElementById(`task${task_id}`).remove()
          }else{
              showNotification("error", data.message)
          }
      } catch (error) {
          showNotification("error", error)
      }
      $(".loading-dash").css("display", 'none');
  }
}

// Restore task
async function restoreTask(task_id) {
  if (confirm(`Are you sure you want restore this task ?`)) {
    $(".loading-dash").css("display", 'inline');
      try{
          const response = await fetch(`/api/user/restoreTask/${task_id}`,{
              method: "PUT",
          });
          const data = await response.json();
          if(response.ok){
              showNotification("success", data.message)
              document.getElementById(`taskBtn${task_id}`).remove()
              $(`#statFlag${task_id}`).html(`
                Status flag: <strong class="text-success">Active</strong>
              `)
          }else{
              showNotification("error", data.message)
          }
      } catch (error) {
          showNotification("error", error)
      }
      $(".loading-dash").css("display", 'none');
  }
}