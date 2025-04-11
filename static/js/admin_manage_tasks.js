const fetchTasks = async () => {
  try {
      const response = await fetch('/admin/api/fetchTask');
      const data = await response.json();
      if(response.ok){
          taskData = data.data
          showNotification("success", data.message)
          const tableBody = document.getElementById('taskTableBody');
          console.log(taskData)
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
                  <td class=''>${formatDate(task.created_at)}</td>
                  <td class=''>${formatDate(task.updated_at)}</td>
                  <td class="${percent == 100 ? 'text-success':'text-danger'}">${percent == 100 ? "Yes" : "No"}</td>
                  <td class=''>${task.subtask_nbr}</td>
                  <td class=''>${task.finished_subtask_nbr}</td>
                  <td class=''><span class="badge bg-${activityColor}">${activityText}</span></td>
                  <td class=''>
                      <div class="form-check form-switch d-flex justify-content-center">
                          <input class="form-check-input" type="checkbox" ${task.stat ? 'checked' : ''} onchange="">
                      </div>
                  </td>
                  <td class=''>
                      <button class="btn" onclick="editTask(${task.task_id})"><i class="fas fa-pen text-success"></i></button>
                      <button class="btn" onclick="deleteTask(${task.task_id})"><i class="fas fa-trash text-danger"></i></button>
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

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
}

showNotification("success", "Task manager")

fetchTasks()

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  sidebar.classList.toggle('hidden');
  main.classList.toggle('full');
}