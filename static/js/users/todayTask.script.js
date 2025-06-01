// Fetch today tasks
let taskcount = 0;
async function fetchTodayTasks() {
    $(".loading-dash").css("display", 'inline');
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
            showNotification("success", `You have ${todayTasks.length} task${taskcount > 1 ? "s" : ""} to do today`);

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
        } else {
            showNotification("error", "You don't have any task for today");
            $("#todayTaskContainer").append($(`
                <script
                    src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
                    type="module"
                ></script>
                <dotlottie-player
                    src="https://lottie.host/dc3962cd-5129-4c78-b3f5-172d5a86dec7/6sEHo0DGkz.lottie"
                    background="transparent"
                    speed="1"
                    style="width: 450px; height: 450px; margin: auto; display: block;"
                    loop
                    autoplay
                >
                </dotlottie-player>
                <h4 class='text-center'>You don't have any task for today</h4>
                <p class='text-center'>You can add a task by clicking the 
                    <button class="btn open-modal border" style="background-color: transparent!important">
                        <i class="fas fa-add text-success"></i>
                        Add new task
                    </button> button above
                </p>
            `));
        }
    } catch (error) {
        showNotification("error", error.message);
    }
    $(".loading-dash").css("display", 'none');
}
function addTodayTask(id, title, start_date, end_date, description, bg_color, subtasks) {
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id="${id}"></div>`);
    const newTaskCard = genTaskCard(bg_color, description, start_date, end_date, title, id, subtasks)
    taskContainer.html(newTaskCard);
    $("#todayTaskContainer").append(taskContainer);
}

fetchTodayTasks()