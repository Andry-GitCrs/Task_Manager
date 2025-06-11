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
            $(`#${element_id}`).append($("<h3 class='m-0 my-1'></h3>").html(`<span class="event p-1 px-3 text-dark rounded-pill">${message}</span>`))
            upComingTasks.forEach(task => {
                const {
                    task_id: id,
                    title = task.subtask_title,
                    start_date,
                    end_date,
                    description,
                    bg_color,
                    subtasks,
                    list_id
                } = task;
                
                addUpcomingTask(element_id, list_id, id, title, formatDate(start_date), formatDate(end_date), description, bg_color, subtasks)
            });
        }
        else {
            showNotification("error", `You don't have any task ${condition} ${formatDate(responseData.date)}`);
            $(`#${element_id}`).append($("<h3 class='m-0 my-1'></h3>").html(`<span class="event p-1 px-3 text-dark rounded-pill">${message}</span>`))
            $(`#${element_id}`).append($(`
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
                <h4 class='text-center'>You don't have any task ${condition} ${formatDate(responseData.date)}</h4>
                <p class='text-center'>You can add a task by clicking the <button class="btn open-modal border" style="background-color: transparent!important">
                        <i class="fas fa-add text-success"></i>
                        Add new task
                    </button> button above</p>
            `));
        }
    } catch (error) {
        console.log(error);
    }
    $(".loading-dash").css("display", 'none');
}

function addUpcomingTask(element_id, list_id, id, title, start_date, end_date, description, bg_color, subtasks) {
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id="${id}"></div>`);
    let newTaskCard = genTaskCard(list_id, bg_color, description, start_date, end_date, title, id, subtasks)
    taskContainer.html(newTaskCard);
    $(`#${element_id}`).append(taskContainer);
}

let argument = $('#select_arg').val()
let year = null
let month = null
let day = null

$('#select_arg').on('change', (e) => {
    argument = e.target.value
    getTaskByDate(argument, year, month, day)
})

$('#date_select').on('change', (e) => {
    const date = new Date(e.target.value)
    const date_year = date.getFullYear()
    const date_month = (date.getMonth() + 1).toString().padStart(2, '0')
    const date_day = date.getDate().toString().padStart(2, '0')

    year = date_year
    month = date_month
    day = date_day
    
    getTaskByDate(argument, year, month, day)
})

async function getTaskByDate(arg, year, month, day){
    if(arg && year && month && day){
        $(".loading-dash").css("display", 'inline');
        try {
            const response = await fetch(`/api/user/getTaskByDate/${arg}/${year}/${month}/${day}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            let responseData = await response.json();

            if (response.ok) {
                const upComingTasks = responseData.data;
                
                showNotification("success", responseData.message + ' ' + formatDate(responseData.date));
                $(`#result`).html('')
                $('#message').text('')
                $('#message').text(`${responseData.message} ${formatDate(responseData.date)}`)
                $(`#result`).before($('#message'))
                upComingTasks.forEach(task => {
                    const {
                        task_id: id,
                        title,
                        start_date,
                        end_date,
                        description,
                        bg_color,
                        subtasks,
                        list_id
                    } = task;
        
                    
                    addUpcomingTask("result", list_id, id, title, formatDate(start_date), formatDate(end_date), description, bg_color, subtasks)
                });
            }else{
                showNotification("error", responseData.message);
            }
        } catch (error) {
            console.log(error);
        }
        $(".loading-dash").css("display", 'none');
    }
}

fetchUpcomingTasks('upComingTaskContainer', 'before', 7, "Before Next week");
fetchUpcomingTasks('upComingTaskContainer1', 'on', 1, "Tomorrow");
fetchUpcomingTasks('upComingTaskContainer2', 'after', 1, "After tomorrow");