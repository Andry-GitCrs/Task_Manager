// Fetch upcoming tasks
async function fetchUpcomingTasks(element_id, condition, day, message) {
    $(".loading-dash").css("display", 'inline');
    try {
        const response = await fetch(`/api/user/getUpcomingTask/${condition}/${day}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        let responseData = await response.json();

        if (response.ok && responseData.data.length > 0) {
            const upComingTasks = responseData.data;
            const date = formatDate(responseData.date);
            //$("#upcomingTaskNbr").text(upComingTasks.length);
            showNotification("success", `You have ${upComingTasks.length} task${upComingTasks.length > 1 ? "s" : ""} to do ${condition} ${date}`);
            $(`#${element_id}`).append($("<h3 class='m-0 my-1'></h3>").html(`<span class="event p-1 px-3 text-dark rounded-pill">${message}</span> ${upComingTasks.length} task${upComingTasks.length > 1 ? "s" : ""} to do ${condition} ${date}`))
            upComingTasks.forEach(task => {
                const {
                    task_id: id,
                    title,
                    start_date,
                    end_date,
                    description,
                    bg_color,
                    subtasks
                } = task;
                
                addUpcomingTask(element_id, id, title, formatDate(start_date), formatDate(end_date), description, bg_color, subtasks)
            });
        } else {
            $(`#${element_id}`).append($("<h3></h3>").text(`No task to do ${condition} ${day} ${day > 1 ? "days" : "day"}, ${message}`))
        }
    } catch (error) {
        console.log(error);
    }
    $(".loading-dash").css("display", 'none');
}

function addUpcomingTask(element_id, id, title, start_date, end_date, description, bg_color, subtasks) {
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id="${id}"></div>`);
    let newTaskCard = genTaskCard(bg_color, description, start_date, end_date, title, id, subtasks)
    taskContainer.html(newTaskCard);
    $(`#${element_id}`).append(taskContainer);
}

fetchUpcomingTasks('upComingTaskContainer', 'before', 7, "Next week");
fetchUpcomingTasks('upComingTaskContainer1', 'on', 1, "Tomorrow");
fetchUpcomingTasks('upComingTaskContainer2', 'after', 2, "After tomorrow");