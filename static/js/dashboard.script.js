let taskcount = 1
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
            
            if( subTaskList.map( subTask => subTask.tirm()  == content.trim() )){
                
                if(subTaskNbr == 1){
                    $(".task-list-container").text("")
                }
                subTaskList.push(content)
                $(".task-list-container").append($(`<li class='text-dark justify-content-between align-items-center subTask' id='subtask${taskNbr}${subTaskNbr}'></li>`).html(`${content}  <div class="w-25 d-flex justify-content-center gap-3 bg-transparent" ><i class="fas fa-pen" onclick="editSubTask('subtask${taskNbr}${subTaskNbr}')"></i><i class="fas fa-trash text-danger" onclick="removeSubTask('subtask${taskNbr}${subTaskNbr}')"></i></div>`))
            }else{
                alert("Subtask already exist")
            }
        }
        subTaskNbr += 1
    })
    // Handle form submission
    $("#submit").on("click", function(e) {
        e.preventDefault()
        let title = $("#title").val()
        let startDate = $("#startDate").val()
        let endDate = $("#endDate").val()
        let bgColor = $("#bg-color-piker").val()
        let description = $("#description").val()

        if (title.trim() !== "" && subTaskList.length !== 0 && startDate !== "" && endDate !== "") {
            let taskContainer = $(`<div class="col-4 p-1 taskBox" id="task${taskNbr}"></div>`)
            
            taskContainer.html(`    
                <div class=" h-100 p-2 rounded-3" style='background-color: ${(bgColor !== "#000000")?bgColor:"#95ce83"}'>
                    <h3 class="text-dark task-title">
                        ${title} 

                        <span class="text-dark date ">
                            ${startDate} to ${endDate}
                        </span>
                        <i class="fas fa-add text-success" onclick="addTask('task${taskNbr}')"></i> 
                        <i class="fas fa-trash text-danger" onclick="removeTask('task${taskNbr}')"></i>
                    </h3>
                    <ul class="p-0" id="subTaskContainer${taskNbr}">
                        ${$(".task-list-container").html()}
                    </ul>
                </div>
            `)

            task = {
                "task_title": title,
                "task_start_date": startDate,
                "task_end_date": endDate,
                "task_background_color": bgColor,
                "description": description || "None",
                "subtasks": [...subTaskList]
            }

            console.log(task)

            taskcount += 1
            taskNbr += 1
            subTaskNbr = 1
            taskList.push([...subTaskList])
            subTaskList.splice(0, subTaskList.length)
            $(".task-list-container").html("<span id='subTaskIndicator'>No subtask added </br> all subtask will appear here</span>")
            $("#taskNbr").text(taskcount)
            $(".task").before(taskContainer)
            $("#title").val("")
            $("#content").val("")
            $("#startDate").val("")
            $("#endDate").val("")
            $(".overlay, .modal").fadeOut(); // Close modal
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
    taskcount -= 1
    $("#taskNbr").text(taskcount)
    $(`#${id}`).css("display", "none")
}

function removeSubTask(id){
    $(`#${id}`).css("display", "none")
}

function editSubTask(id){
    let oldContent = $(`#${id}`).text()
    let newContent = prompt(`Old task : ${oldContent},\n Enter new task :`)
    if(newContent && newContent.trim() !== ""){
        $(`#${id}`).html(`${newContent} <div class="w-25 d-flex justify-content-center gap-3 bg-transparent" ><i class="fas fa-pen" onclick="editSubTask('${id}')"></i><i class="fas fa-trash text-danger" onclick="removeSubTask('${id}')"></i></div>`)
    }
}

function addTask(id){
    let idd = id
    id = id[4] - 1
    let newTask = prompt(`Enter new task to add`)
    if(newTask !== ""){
        $(`#subTaskContainer${idd[4]}`).append($(`<li class='text-dark justify-content-between align-items-center subTask' id='subtask${id[4]}${taskList[id].length}'></li>`).html(`${newTask}  <div class="w-25 d-flex justify-content-center gap-3 bg-transparent" ><i class="fas fa-pen" onclick="editSubTask('subtask${id[4]}${taskList[id].length}')"></i><i class="fas fa-trash text-danger" onclick="removeSubTask('subtask${id[4]}${taskList[id].length}')"></i></div>`))
        taskList[id].push(newTask)
    }
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
            document.getElementById("error").textContent = ""; 
            document.getElementById("info").textContent = `Found ${responseData.length} tasks.`;
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
            document.getElementById("info").textContent = "No task found";
        }
    } catch (error) {
        document.getElementById("error").textContent = error.message;
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

function addNewTask(id, title, start_date, end_date, description, bg_color,  subtasks){
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id=""></div>`)
    taskContainer.html(`    
        <div class=" h-100 p-2 rounded-3" style='background-color: ${bg_color}' id='task${id}'>
            <h3 class="text-dark task-title">
                ${title}
                <span class="text-dark date">
                    ${start_date} to ${end_date}
                </span>
                <i class="fas fa-add text-success" onclick="alert('Edit task${id} ?')"></i> 
                <i class="fas fa-trash text-danger" onclick="alert('Delete task${id} ?')"></i>
            </h3>
            <ul class="p-0">
                ${
                    subtasks.map( subtask => `
                        <li class='text-dark justify-content-between align-items-center subTask' id='subtask${subtask.subtask_id}'>
                            ${subtask.subtask_title}
                            <div class="w-25 d-flex justify-content-center gap-3 bg-transparent">
                                <i class="fas fa-pen" onclick="alert('Edit subtask${subtask.subtask_id}')"></i>
                                <i class="fas fa-trash text-danger"  onclick="alert('Delete subtask${subtask.subtask_id}')"></i>
                            </div>
                        </li>
                    `).join('')
                }
            </ul>
        </div>
    `)
    $(".task").before(taskContainer)
}