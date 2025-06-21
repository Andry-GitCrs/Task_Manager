document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

  function adjustEndDateForSave(end) {
    return end ? new Date(end.getTime() - 86400000).toISOString().split("T")[0] : null;
  }

  // Fetch tasks from your backend
  const fetchTasksAndInitCalendar = async () => {
    try {
      const tasks = await fetchTasks();
      const events = tasks.map(task => ({
        id: task.task_id,
        title: task.title,
        start: new Date(task.start_date),
        end: task.end_date
      ? new Date(new Date(task.end_date).getTime() + 86400000)
      : null,
        description: task.description,
        backgroundColor: task.bg_color,
        borderColor: task.bg_color,
        allDay: true
      }));

      // Initialize the calendar with events
      const calendar = new FullCalendar.Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'multiMonthYear,dayGridMonth,timeGridWeek'
      },
      themeSystem: 'bootstrap5',
      initialView: 'dayGridMonth',
      initialDate: Date.now(),
      displayEventEnd: true,
      editable: true,
      eventDurationEditable: true,
      selectable: true,
      dayMaxEvents: true,
      events: events,

      eventDrop: function(info) {
        const { event } = info;
        const task_id = event.id;

        if (!task_id) {
          showNotification('error', 'Task ID not found');
          return;
        }

        // Safely handle missing end (when it's a 1-day allDay event)
        const startDate = event.startStr;
        const endDate = event.end
          ? event.endStr
          : startDate; // fallback for 1-day tasks with no end

        console.log({ start: startDate, end: endDate, task_id });

        fetch(`/api/user/task/updateDate?task_id=${task_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate
          })
        })
        .then(res => res.json())
        .then(data => showNotification('success', data.message || data.error))
        .catch(err => console.error("Error updating:", err));
      },


      eventResize: function(info) {
        const { event } = info;
        const start_date = event.start.toISOString().split("T")[0];
        const end_date = event.end.toISOString().split("T")[0];
        const task_id = event.id

        if (!task_id){
          showNotification('error', 'Task id not found')
          return
        }

        fetch(`/api/user/task/updateDate?task_id=${task_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_date: start_date,
            end_date: end_date
          })
        })
        .then(res => res.json())
        .then(data => showNotification('success', data.message || data.error))
        .catch(err => console.error("Error updating:", err));
      }
    });


      calendar.render();
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  await fetchTasksAndInitCalendar();
  $(".loading-dash").css("display", 'none');
});
