// Fetch today tasks
async function fetchTodayTasks() {
    try {
        const response = await fetch("/api/user/getTodayTask", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            showNotification('error', "Failed to fetch today's task")
        }

        let responseData = await response.json();

        if (response.ok && responseData.data.length > 0) {
            const todayTasks = responseData.data;
            $("#todayTaskNbr").text(responseData.data.length);
            showNotification("success", `You have ${taskcount} task${taskcount > 1 ? "s" : ""} to do today`);

            todayTasks.forEach(task => {
                const {
                    task_id: id,
                    title,
                    start_date,
                    end_date,
                    description,
                    bg_color,
                    subtasks
                } = task;
                const taskElement = addTodayTask(
                    id,
                    title,
                    formatDate(start_date),
                    formatDate(end_date),
                    description,
                    bg_color,
                    subtasks
                );
                
                $("#todayTaskContainer").append(taskElement);
            });

            return todayTasks.length;
        } else {
            showNotification("error", "You don't have any task for today");
        }
    } catch (error) {
        showNotification("error", error.message);
    }
}
function addTodayTask(id, title, start_date, end_date, description, bg_color, subtasks) {
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id="${id}"></div>`);
    const newTaskCard = genTaskCard(bg_color, description, start_date, end_date, title, id, subtasks)
    taskContainer.html(newTaskCard);
    $("#todayTaskContainer").append(taskContainer);
}

$('.menu-btn').on('click', () => {
    if(!menuStat){
        $("aside").css("left", "0")
        menuStat = true
    }else{
        $("aside").css("left", "-600px")
        menuStat = false
    }
})

fetchTodayTasks()
