const fetchTasks = async () => {
  document.getElementById("loading").style.display = 'inline';
  try {
      const response = await fetch('/admin/api/fetchTask');
      const data = await response.json();
      if(response.ok){
          taskData = data.data
          showNotification("success", data.message)
          const tableBody = document.getElementById('taskTableBody');
          taskData.forEach(task => {
              const percent = task.subtask_nbr > 0 ? Math.round((task.finished_subtask_nbr / task.subtask_nbr) * 100) : 0;
              const activityColor = percent >= 80 ? 'success' : percent >= 50 ? 'warning' : 'danger';
              const activityText = `${percent}%`;

              const row = document.createElement('tr');
              row.id = `row${task.task_id}`
              row.innerHTML = `
                <td class='fw-bold'>${task.task_id}</td>
                <td class='text-start'>${task.task_title}</td>
                <td class='text-start'>${task.owner}</td>
                <td class=''>
                  ${formatDate(task.created_at).date}
                  <span class="btn text-success time rounded-pill border border-success">${formatDate(task.created_at).time}</span>
                </td>
                <td class=''>
                  ${formatDate(task.updated_at).date}
                  <span class="btn text-success time rounded-pill border border-success">${formatDate(task.updated_at).time}</span>
                </td>
                <td class="${percent == 100 ? 'text-success' : 'text-danger'}">${percent == 100 ? "Yes" : "No"}</td>
                <td class=''>${task.subtask_nbr}</td>
                <td class=''>${task.finished_subtask_nbr}</td>
                <td class=''><span class="badge bg-${activityColor}">${activityText}</span></td>
                <td class=''>
                  <div class="form-check form-switch d-flex justify-content-center">
                    <input class="form-check-input" type="checkbox" ${task.stat ? 'checked' : ''} onchange="">
                  </div>
                </td>
                <td class=''>
                  <div class="dropdown">
                    <button class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-pen text-success"></i>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a class="dropdown-item" href="#" onclick="editTask(${task.task_id})">
                          <i class="fas fa-edit me-2"></i>Edit Task
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="#" onclick="assignSubtasks(${task.task_id})">
                          <i class="fas fa-tasks me-2"></i>Assign Subtasks
                        </a>
                      </li>
                    </ul>
                  </div>
                  <button class="btn btn-sm" onclick="deleteTask(${task.task_id})">
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
  document.getElementById("loading").style.display = 'none';
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

showNotification("success", "Task manager")

fetchTasks()

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  sidebar.classList.toggle('hidden');
  main.classList.toggle('full');
}

function editTask(taskId) {
  showNotification("success", `Editing task ${taskId}`)	
}

function assignSubtasks(taskId) {
  showNotification("success", `assignSubtasks on task ${taskId}`)	
}

async function deleteTask(task_id) {
  if (confirm(`Are you sure you want this task ${task_id}?`)) {
    document.getElementById("loading").style.display = 'inline';
      try{
          const response = await fetch(`/api/user/deleteTaskPermanentely/${task_id}`,{
              method: "DELETE",
          });
          const data = await response.json();
          if(response.ok){
              showNotification("success", data.message)
              document.getElementById(`row${task_id}`).remove()
          }else{
              showNotification("error", data.message)
          }
      } catch (error) {
          showNotification("error", error)
      }
      document.getElementById("loading").style.display = 'none';
  }
}