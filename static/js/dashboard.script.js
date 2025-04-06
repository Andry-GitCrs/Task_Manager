let taskcount = 0
let taskList = []


$(document).ready(function() {
    let addTask = null
    let subTaskList = []
    let taskNbr = 1
    let subTaskNbr = 1
    /* Task number */

    // Open modal and store clicked element
    $(".open-modal").on("click", function() {
        addTask = $(this);
        $(".overlay, .modal").fadeIn()
    })

    // Close modal
    $("#closeModal, .overlay").on("click", function(e) {
        e.preventDefault()
        $(".overlay, .modal").fadeOut()
    })

    // Add task
    $(".add").on("click", (e) => {
        e.preventDefault()
        let content = $("#content").val()
        $("#content").val("")
        if( content.trim() !== ""){
            
            if( content !== subTaskList[subTaskList.length - 1]){
                if(subTaskNbr == 1){
                    $(".task-list-container").text("")
                }
                subTaskList.push(content)
                $(".task-list-container").append($(`<li class='text-dark justify-content-between align-items-center subTask' id='subtask${taskNbr}${subTaskNbr}'></li>`).html(`${content}  <div class="w-25 d-flex justify-content-center gap-3 bg-transparent" ><i class="fas fa-pen" onclick="editSubTask('subtask${taskNbr}${subTaskNbr}')"></i><i class="fas fa-trash text-danger" onclick="removeSubTask('subtask${taskNbr}${subTaskNbr}')"></i></div>`))
            }
        }
        subTaskNbr += 1
    })
    // Handle form submission
    $("#add_task_form").on("submit", async function(e) {
        e.preventDefault()
        let title = $("#title").val()
        let startDate = $("#startDate").val()
        let endDate = $("#endDate").val()
        let bgColor = $("#bg-color-piker").val()
        let description = $("#description").val()

        if (title.trim() !== "" && startDate !== "" && endDate !== "") {
            task = {
                "task_title": title,
                "task_start_date": startDate,
                "task_end_date": endDate,
                "task_background_color": bgColor,
                "description": description || "None",
                "subtasks": [...subTaskList]
            }

            
            try {
                const response = await fetch("/api/user/addTask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task)
                });
        
                const responseData = await response.json();
        
                if (response.ok) {  //Response with status code 200
                    const response_data = responseData.data
                    $("#info").text(responseData.message)
                    console.log(responseData.data)

                    const id = response_data.task_id
                    const title = response_data.title
                    const start_date = response_data.start_date
                    const end_date = response_data.end_date
                    const subtasks = response_data.subtasks
                    const description = response_data.description
                    const bg_color = response_data.bg_color

                    addNewTask(id, title, formatDate(start_date), formatDate(end_date), description, bg_color,  subtasks)

                    $("#title").val("")
                    $("#content").val("")
                    $("#startDate").val("")
                    $("#endDate").val("")
                    $(".overlay, .modal").fadeOut(); // Close modal
                } else {
                    $("#error").text(responseData.error)
                }

            } catch (error) {
                $("#error").text(error)
            }

        }else{
            alert("Please complete the blank fields or cancel")
        }
    })
})

let tempValue = []
$("#title").on("keyup", () => {
    tempValue.push($("#title").val())
    let value = tempValue[tempValue.length -1]
    if(value){
        $("#subTaskIndicator").text(`No subtask added to ${value}`)
    }else{
        $("#subTaskIndicator").html("No subtask added </br> all subtask will appear here")
    }
})

//Remove task
function removeTask(id){
    const confirmation = confirm('Do u want to really remove this task')
    if(confirmation){
        alert("Task deleted")
    }
}

function removeSubTask(id){
    alert(`remove ${id}`)
}

function editSubTask(id){
    alert(`edit ${id}`)
}

function addSubTask(id){
    alert(`add to ${id}`)
}

/* Show menu  */
let menuStat = false
$('.menu-btn').on('click', () => {
    if(!menuStat){
        $("aside").css("left", "0")
        menuStat = true
    }else{
        $("aside").css("left", "-500px")
        menuStat = false
    }
})

/* Welcome Modal */

$(document).ready(function() {
    
    $("#welcomeModal").fadeIn();

    // Close on click outside the modal box
    $(window).click(function(event) {
        if (event.target.id === "welcomeModal") {
            $("#welcomeModal").fadeOut();
        }
    });

    // // Close on "Close" button
    // $("#closeModal").click(function() {
    //     $("#welcomeModal").fadeOut();
    //     document.getElementById("welcomeModal").style.display = "none"
    // });
});

const fetchTasks = async () => {
    try {
        const response = await fetch("/api/user/getTask", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        let responseData = await response.json();

        if (response.ok) {
            responseData = responseData.data
            $("#taskNbr").text(taskcount + responseData.length)
            taskcount = responseData.length
            // Loop through the tasks and display them
            responseData.forEach(task => {
                const id = task.task_id
                const title = task.title
                const start_date = task.start_date
                const end_date = task.end_date
                const subtasks = task.subtasks
                const description = task.description
                const bg_color = task.bg_color

                addNewTask(id, title, formatDate(start_date), formatDate(end_date), description, bg_color,  subtasks)
            });
            return responseData.length
        } else {
            console.log("No task found")
        }
    } catch (error) {
        console.error(error.message);
    }
};

// Call the function to fetch tasks
fetchTasks()

const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, pad with 0 if single digit
    const day = d.getDate().toString().padStart(2, '0'); // Pad day with 0 if single digit

    return `${day}-${month}-${year}`;
}

// Create display card
function addNewTask(id, title, start_date, end_date, description, bg_color,  subtasks){
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id=""></div>`)
    taskContainer.html(`    
        <div class=" h-100 p-2 rounded-3" style='background-color: ${bg_color}' id='task${id}'>
            <h3 class="text-dark task-title">
                ${title}
                <span class="text-dark date">
                    ${start_date} to ${end_date}
                </span>
                <i class="fas fa-add text-success" onclick="addSubTask('task${id}')"></i> 
                <i class="fas fa-trash text-danger" onclick="removeTask('task${id}')"></i>
            </h3>
            <ul class="p-0">
                ${
                    subtasks.map( subtask => `
                        <li class='text-dark justify-content-between align-items-center subTask' id='subtask${subtask.subtask_id}'>
                            ${subtask.subtask_title}
                            <div class="w-25 d-flex justify-content-center gap-3 bg-transparent">
                                <i class="fas fa-pen" onclick="editSubTask('subtask${subtask.subtask_id}')"></i>
                                <i class="fas fa-trash text-danger" onclick="removeSubTask('subtask${subtask.subtask_id}')"></i>
                            </div>
                        </li>
                    `).join('')
                }
            </ul>
        </div>
    `)
    $(".task").before(taskContainer)
}