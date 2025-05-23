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

function createTaskRow(task) {
  const isDone = task.subtask_nbr != 0 && task.subtask_nbr === task.finished_subtask_nbr;
  const statusColor = isDone 
    ? 'bg-success text-light' 
    : 'bg-dark text-warning';

  const statusText = isDone ? 'Done' : 'In Progress';
  const activeColor = task.stat ? 'text-success' : 'text-danger';
  const activeText = task.stat ? 'Active' : 'Deleted';

  return `
    <div class="w-100 text-dark dark:bg-dark dark:text-light p-4 rounded-3 shadow-sm border mb-3" style="background-color: ${task.task_background_color}aa;">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="h5 mb-0 fw-bold">${task.task_title}</h2>
        <span class="small text-muted">Created: ${formatProfileDate(task.created_at)}</span>
      </div>

      <div class="row text-muted small mb-3">
        <div class="col-sm-6 col-md-3 mb-2">
          <div><strong>Task ID</strong></div>
          <div>#${task.task_id}</div>
        </div>
        <div class="col-sm-6 col-md-3 mb-2">
          <div><strong>Subtasks</strong></div>
          <div>${task.subtask_nbr} total</div>
        </div>
        <div class="col-sm-6 col-md-3 mb-2">
          <div><strong>Completed</strong></div>
          <div>${task.finished_subtask_nbr}/${task.subtask_nbr}</div>
        </div>
        <div class="col-sm-6 col-md-3 mb-2">
          <div><strong>Status</strong></div>
          <span class="badge rounded-pill ${statusColor} fw-bold">${statusText}</span>
        </div>
      </div>

      <div class="d-flex justify-content-between text-muted small">
        <span>Last update: ${formatProfileDate(task.updated_at)}</span>
        <span>Status flag: <strong class="${activeColor}">${activeText}</strong></span>
      </div>
    </div>
  `;
}


async function fetchUserTasks() {
  try {
    const response = await fetch('/api/user/fetchTask');
    const data = await response.json();

    if (response.ok) {
      if (data.length === 0) {
        document.getElementById('task-list').innerHTML = '<p class="text-gray-500 dark:text-gray-400">No tasks found.</p>';
        return;
      }
      const tasks = data.data;
      const taskList = document.getElementById('task-list');
      for (const task of tasks) {
        taskList.innerHTML += createTaskRow(task);
      }
    }
    showNotification("success", data.message);
    
  } catch (err) {
    showNotification("error", `Failed to fetch tasks: ${err}`);
  }
}

fetchUserTasks();
