document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

  // Fetch tasks from your backend
  const fetchTasksAndInitCalendar = async () => {
    try {
      const tasks = await fetchTasks(); 

      const events = tasks.map(task => ({
        title: task.title,
        start: new Date(task.start_date),
        end: new Date(task.end_date),
        description: task.description,
        backgroundColor: task.bg_color,
        borderColor: task.bg_color,
      }));

      // Initialize the calendar with events
      const calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'multiMonthYear,dayGridMonth,timeGridWeek'
        },
        initialView: 'dayGridMonth',
        initialDate: Date.now(),
        editable: true,
        selectable: true,
        dayMaxEvents: true,
        events: events 
      });

      calendar.render();
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  await fetchTasksAndInitCalendar();
  $(".loading-dash").css("display", 'none');
});
