let taskcount = 0
let taskList = []

$(document).ready(function() {
    let addTask = null
    let subTaskList = []
    let taskNbr = 0
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
        let content = $("#content").val().trim()
        $("#content").val("")
        if( content !== ""){
            
            if( !subTaskList.includes(content) ){
                if(subTaskNbr == 1){
                    $(".task-list-container").text("")
                }
                subTaskList.push(content)
                $(".task-list-container").append($(`<li class='text-dark justify-content-between align-items-center subTask' id='subtask${taskNbr}${subTaskNbr}' ondblclick="editSubTask_on_adding('subtask${taskNbr}${subTaskNbr}')"></li>`).html(`${content}  <div class="w-25 d-flex justify-content-center gap-3 bg-transparent" ><i class="fas fa-pen" onclick="editSubTask_on_adding('subtask${taskNbr}${subTaskNbr}')"></i><i class="fas fa-trash text-danger" onclick="removeSubTask_on_adding('subtask${taskNbr}${subTaskNbr}')"></i></div>`))
            }else{
                showNotification("error", `This taks already have "${content}" subtask`)
            }
        }
        subTaskNbr += 1
    })
    // Handle form submission
    $("#add_task_form").on("submit", async function(e) {
        e.preventDefault()
        let title = $("#title").val().trim()
        let startDate = $("#startDate").val()
        let endDate = $("#endDate").val()
        let bgColor = $("#bg-color-piker").val()
        let description = $("#description").val().trim()

        if (title.trim() !== "" && startDate !== "" && endDate !== "") {
            task = {
                "task_title": title,
                "task_start_date": startDate,
                "task_end_date": endDate,
                "task_background_color": bgColor,
                "description": description || "None",
                "subtasks": [...subTaskList]
            }

            
            $(".loading-dash").css("display", 'inline');
            try {
                const response = await fetch("/api/user/addTask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task)
                });
        
                const responseData = await response.json();
        
                if (response.ok) {  //Response with status code 200
                    const response_data = responseData.data

                    const id = response_data.task_id
                    const title = response_data.title
                    const start_date = response_data.start_date
                    const end_date = response_data.end_date
                    const subtasks = response_data.subtasks
                    const description = response_data.description
                    const bg_color = response_data.bg_color

                    addNewTask(id, title, formatDate(start_date), formatDate(end_date), description, bg_color,  subtasks)

                    $(".task-list-container").html("<span id='subTaskIndicator'>No subtask added </br> all subtask will appear here</span>")
                    
                    subTaskList.splice(0, subTaskList.length)
                    $("#title").val("")
                    $("#content").val("")
                    $("#startDate").val("")
                    $("#endDate").val("")
                    $("#description").val("")
                    $("#bg-color-piker").val("#95ce83")
                    $(".overlay, .modal").fadeOut(); // Close modal
                    taskNbr += 1
                    $("#taskNbr").text(taskNbr)
                    showNotification("success", responseData.message)
                } else {
                    showNotification("error", responseData.error)
                    $(".loading-dash").css("display", 'none');
                }

            } catch (error) {
                showNotification("error", responseData.error)
                $(".loading-dash").css("display", 'none');
            }

        }else{
            showNotification("error", "Empty required fields")
            $(".loading-dash").css("display", 'none');
        }
        $(".loading-dash").css("display", 'none');
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
async function  removeTask(id){
    const confirmation = confirm('Do u want to really remove this task')
    task_id = id
    if(confirmation){
        task = {
            "task_id": task_id
        }
        
        $(".loading-dash").css("display", 'inline');
        try {
            const response = await fetch("/api/user/deleteTask", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task)
            });
    
            const responseData = await response.json();
    
            if (response.ok) {  //Response with status code 200
                showNotification("success", responseData.message)
                taskcount -= 1
                $("#taskNbr").text(taskcount)
                $(`#task${id}`).remove()
            } else {
                showNotification("error", responseData.error)
                $(".loading-dash").css("display", 'none');
            }
        } catch (error) {
            showNotification("error", error)
            $(".loading-dash").css("display", 'none');
        }
        $(".loading-dash").css("display", 'none');
    }
}

// Remove subtask
async function removeSubTask(id){
    const confirmation = confirm('Do u want to realy remove this subtask')
    subtask_id = id
    if(confirmation){
        subtask = {
            "subtask_id": subtask_id
        }
        
        $(".loading-dash").css("display", 'inline');
        try {
            const response = await fetch("/api/user/deleteSubTask", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subtask)
            });
    
            const responseData = await response.json();
    
            if (response.ok) {  //Response with status code 200   
                showNotification("success", responseData.message)
                document.getElementById(`subtask${id}`).remove()
                $('#taskNbr').text($('#taskNbr').text() - 1)
            } else {
                showNotification("error", responseData.error)
                $(".loading-dash").css("display", 'none');
            }
        } catch (error) {
            showNotification("error", responseData.error)
            $(".loading-dash").css("display", 'none');
        }
        $(".loading-dash").css("display", 'none');
    }
}

// Add subtask
async function addSubTask(id){
    const newValue = prompt(`Add task to ${id}`).trim()
    task_id = id
    if(newValue.trim()){
        newSubtask = {
            "task_id": task_id,
            "subtask_title": newValue
        }
        
        $(".loading-dash").css("display", 'inline');
        try {
            const response = await fetch("/api/user/addSubTask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSubtask)
            });
    
            const responseData = await response.json();
    
            if (response.ok) {  //Response with status code 200
                showNotification("success", responseData.message)
                const subtask = responseData.data
                let subtaskElement = $(`
                    <li 
                        class='justify-content-between align-items-center subTask subtask${subtask.subtask_id}' 
                        id='subtask${subtask.subtask_id}'
                        style="background-color: '#f8f9fa'"
                    >
                    <span 

                    > 
                        ${subtask.subtask_title}
                    </span>
                    <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                        <i class="fas fa-trash text-danger" onclick="removeSubTask('${subtask.subtask_id}')"></i>
                        <input
                            class="from-control mx-2 my-0"
                            type="checkbox" name="subtask_status" 
                            id="input${subtask.subtask_id}" 
                            onchange="check(${subtask.subtask_id})"
                        />
                        <i 
                            class="fas fa-check-circle text-warning"
                            style="display: none" 
                            id='check_icon${subtask.subtask_id}'
                        >
                        </i>
                    </div>
                </li>
                `)
                $(`#subtaskContainer${task_id}`).append(subtaskElement)
            } else {
                showNotification("error", responseData.error)
                $(".loading-dash").css("display", 'none');
            }
        } catch (error) {
            showNotification("error", responseData.error)
            $(".loading-dash").css("display", 'none');
        }
    }else{
        showNotification("error", "Invalid value")
        $(".loading-dash").css("display", 'none');
    }
    $(".loading-dash").css("display", 'none');
}

function editSubTask_on_adding(id){
    showNotification("success", `Edit subtask ${id}?`)
    let old_value = $(`#${id}`).text()
    $(`#${id}`).html(`
        <input
            value='${old_value}'
            class="form-control mx-2 my-0 d-block"
            type="text" name="subtask_status"
        />
    `)
}

// Write change
function removeSubTask_on_adding(id){
    showNotification("success", `Remove subtask ${id}?`)
}

function editSubTask(id, subtask_id){
    showNotification("success", `Edit subtask ${id}?`)
    let old_value = $(`#${id}`).text().trim()
    $(`#${id}`).html(`
        <input
            value='${old_value}'
            class="form-control mx-2 my-0 d-block py-0"
            type="text" name="subtask_status"
            id="inputEdit${id}"
        />
    `)

    $(`#inputEdit${id}`).on('mouseleave', () => {
        let newValue = $(`#inputEdit${id}`).val()
        if(!newValue.trim()){
            newValue = old_value
        }
        $(`#${id}`).html($(`
            <span class="text-light"> 
            ${newValue}
            </span>
            <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                <i class="fas fa-trash text-danger" onclick="removeSubTask('${subtask_id}')"></i>
                <input
                    class="from-control mx-2 my-0"
                    type="checkbox" name="subtask_status" 
                    id="input${subtask_id}" 
                    onchange="check(${subtask_id})"
                />
                <i 
                    class="fas fa-check-circle text-warning"
                    style="display: none" 
                    id='check_icon${subtask_id}'
                >
                </i>
            </div>
        `))
    })
}

const fetchTasks = async () => {
    $(".loading-dash").css("display", 'inline');
    try {
        const response = await fetch("/api/user/getTask", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        let responseData = await response.json();

        if (response.ok) {
            responseData = responseData.data
            taskcount = responseData.length
            $("#taskNbr").text(taskcount)
            showNotification("success", `You have ${taskcount} task${taskcount > 1 ? "s" : ""} to do`)
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
            showNotification("error", responseData.message)
        }
    } catch (error) {
        showNotification("error", error.message)
    }
    $(".loading-dash").css("display", 'none');
};

// Call the function to fetch tasks
fetchTasks()

const formatDate = (date) => {
    const d = new Date(date);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayName = days[d.getDay()];
    const day = d.getDate().toString().padStart(2, '0');
    const monthName = months[d.getMonth()];
    const year = d.getFullYear().toString();

    return `${dayName} ${day} ${monthName} ${year}`;
};

// Create display card
function addNewTask(id, title, start_date, end_date, description, bg_color,  subtasks){
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id="task${id}"></div>`)
    taskContainer.html(`    
        <div class=" h-100 p-2 rounded-3 d-flex flex-column justify-content-start" style='background-color: ${bg_color}' title="${(description !== 'None')?description:'No description'}">
            <span class="text-dark date date-range w-auto ">
                <i class="fa-solid fa-calendar-days text-success"></i>
                ${start_date}
                <i class="fa-solid fa-arrow-right text-warning"></i>
                ${end_date}
            </span>
            <h3 class="text-dark task-title">
                ${title}
                <div class='d-flex justify-content-center gap-3 bg-transparent'>
                    <i class="fas fa-add text-success" onclick="addSubTask('${id}')"></i> 
                    <i class="fas fa-trash text-danger" onclick="removeTask('${id}')"></i>
                </div>
            </h3>
            <ul class="p-0" id='subtaskContainer${id}'>
            ${
                subtasks.map( subtask => `
                    <li 
                        class='justify-content-between align-items-center subTask subtask${subtask.subtask_id}' 
                        id='subtask${subtask.subtask_id}'
                        style="background-color: ${(subtask.finished)?'#198754' : '#f8f9fa'}"
                        ondblclick="editSubTask('subtask${subtask.subtask_id}', ${subtask.subtask_id})"
                    >
                        <span 
                            style="color: ${(subtask.finished)?'#f8f9fa' : ''}"
                        > 
                        ${subtask.subtask_title.trim()}
                        </span>
                        <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                            <i class="fas fa-trash text-danger" onclick="removeSubTask('${subtask.subtask_id}')"></i>
                            <input
                                ${subtask.finished ? "checked" : ""}
                                value=${subtask.finished ? "off" : "on"}
                                class="from-control mx-2 my-0"
                                type="checkbox" name="subtask_status" 
                                id="input${subtask.subtask_id}" 
                                onchange="check(${subtask.subtask_id})"
                            />
                            <i 
                                class="fas fa-check-circle text-warning"
                                style="display: ${(subtask.finished)?'inline' : 'none'}" 
                                id='check_icon${subtask.subtask_id}'
                            >
                            </i>
                        </div>
                    </li>
                `).join('')
            }
            </ul>
        </div>
    `)
    $(".task").after(taskContainer)
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

// Check Subtask
async function check(id){
    if( $(`#input${id}`).val() == "on" ){ //Check
        
        $(".loading-dash").css("display", 'inline');
        try {
            const response = await fetch(`/api/user/checkSubTask/${id}`, {
                method: "POST",
            });
    
            if (!response.ok) {
                throw new Error('Failed to check subtask');
            }
    
            let responseData = await response.json();
    
            if (response.ok) {
                showNotification("success", responseData.message)
                $(`.subtask${id}`).css("background-color", '#198754')
                $(`.subtask${id} span`).css("color", '#f8f9fa')
                $(`#check_icon${id}`).css("display", 'inline')
                $(`#input${id}`).val("off")
            } else {
                showNotification("error", responseData.error)
            }
        } catch (error) {
            showNotification("error", error.message)
        }
        
        $(".loading-dash").css("display", 'none');
    }else{ //Uncheck
        
        $(".loading-dash").css("display", 'inline');
        try {
            const response = await fetch(`/api/user/checkSubTask/${id}`, {
                method: "POST",
            });
    
            if (!response.ok) {
                throw new Error('Failed to check subtask');
            }
    
            let responseData = await response.json();
    
            if (response.ok) {
                showNotification("success", responseData.message)
                $(`.subtask${id}`).css("background-color", '#f8f9fa')
                $(`.subtask${id} span`).css("color", '#000')
                $(`#check_icon${id}`).css("display", 'none')
                $(`#input${id}`).val("on")

            } else {
                showNotification("error", responseData.error)
            }
        } catch (error) {
            showNotification("error", error.message)
        }
        $(".loading-dash").css("display", 'none');
    }
}

// Check task
function checkTask(id){
    if( $(`#inputTask${id}`).val() == "on" ){
        showNotification('success', `Checked task`)
        $(`#inputTask${id}`).val("off")
    }else{
        showNotification('success', `Unchecked task`)
        $(`#inputTask${id}`).val("on")
    }
}

// Verify user role
var verify = async () => {
    
    $(".loading-dash").css("display", 'inline');
    try {
        const response = await fetch(`/api/verify_user`, {
            method: "GET",
        });
    
        let responseData = await response.json();
    
        if (response.ok) {
            $('._user_action').append(`
                <li class="my-0 pb-0">
                    <i class="text-success fas fa-key"></i>
                    <a class="text-dark text-decoration-none" href="/auth/admin/login">Login as admin</a>
                </li>
            `)
        }
    } catch (error) {
       console.error(error.message)
    }
    $(".loading-dash").css("display", 'none');
}

verify()


// Find task
async function findTaskk(){
    let title = $('#findTask').val().trim()
    let searchResult = $('#searchResultsContainer')
    searchResult.css('display', 'block')
    searchResult.html("")
    if(title){
        
        $(".loading-dash").css("display", 'inline');
        let response = await fetch(`/api/user/findTask/${title}`)
        let responseData = await response.json()
        if(response.ok){  //Response with status code 200
            responseData.data.forEach(task => {
                const {
                    task_id: id,
                    title,
                    start_date,
                    end_date,
                    description,
                    bg_color,
                    subtasks
                } = task;
                searchResult.append(`
                    <li class='my-2 p-2 rounded justify-content-between align-items-center subTask task${id}' id='${id}' style='background-color: ${bg_color}'>
                        ${title}
                        <span style='font-size: 12px'>${formatDate(start_date)} to ${formatDate(end_date)}</span>
                        <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                            <i class="fas fa-trash text-danger" onclick="removeTask('${id}')"></i>
                            <i class="fas fa-check-circle text-warning " style='display: none'  id='check_task_icon${id}'></i>
                        </div>
                    </li> 
                `)
            })
            
            $(".loading-dash").css("display", 'none');
            
        }else{
            showNotification('error', "Task not found")
            $(".loading-dash").css("display", 'none');
        }
    }else{
        searchResult.html("")
        searchResult.css('display', 'none')  
        $(".loading-dash").css("display", 'none');
    }
}

$(document).on('click', function(event) {
    // Check if the click is outside the search input and the search results container
    if (!$(event.target).closest('#findTask, #searchResultsContainer').length) {
        $('#searchResultsContainer').hide();
    }
});

// Show the results container when the input is focused
$('#findTask').on('focus', function() {
    $('#searchResultsContainer').show();
});

// Task card generator
function genTaskCard(bg_color, description, start_date, end_date, title, id, subtasks){
    const card = `   
        <div class="h-100 p-2 rounded-3 d-flex flex-column justify-content-start" style='background-color: ${bg_color}' title="${(description !== 'None')?description:'No description'}">
            <span class="text-dark date date-range w-auto ">
                <i class="fa-solid fa-calendar-days text-success"></i>
                ${start_date}
                <i class="fa-solid fa-arrow-right text-warning"></i>
                ${end_date}
            </span>
            <h3 class="text-dark task-title">
                ${title}
                <div class='d-flex justify-content-center gap-3 bg-transparent'>
                    <i class="fas fa-add text-success" onclick="addSubTask('${id}')"></i> 
                    <i class="fas fa-trash text-danger" onclick="removeTask('${id}')"></i>
                </div>
            </h3>
            <ul class="p-0" id='subtaskContainer${id}'>
            ${
                subtasks.map(subtask => `
                    <li 
                        class='justify-content-between align-items-center subTask subtask${subtask.subtask_id}' 
                        id='subtask${subtask.subtask_id}'
                        style="background-color: ${(subtask.finished)?'#198754' : '#f8f9fa'}"
                    >
                        <span 
                            style="color: ${(subtask.finished)?'#f8f9fa' : ''}"
                        > 
                        ${subtask.title}
                        </span>
                        <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                            <i class="fas fa-trash text-danger" onclick="removeSubTask('${subtask.subtask_id}')"></i>
                            <input
                                ${subtask.finished ? "checked" : ""}
                                value=${subtask.finished ? "off" : "on"}
                                class="from-control mx-2 my-0"
                                type="checkbox" name="subtask_status" 
                                id="input${subtask.subtask_id}" 
                                onchange="check(${subtask.subtask_id})"
                            />
                            <i 
                                class="fas fa-check-circle text-warning"
                                style="display: ${(subtask.finished)?'inline' : 'none'}" 
                                id='check_icon${subtask.subtask_id}'
                            >
                            </i>
                        </div>
                    </li>
                `).join('')
            }
            </ul>
        </div>
    ` 
    return card
}

$('.updateForm').on('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim('');
    const oldconfirmPassword = document.getElementById('oldconfirmPassword').value.trim('')
    const newPassword = document.getElementById('newPassword').value.trim('');
    const confirmPassword = document.getElementById('confirmPassword').value.trim('');

    user = {
        "email": email,
        "old_password": oldconfirmPassword,
        "new_password": newPassword,
        "confirmation_password": confirmPassword
    }
    $(".loading-dash").css("display", 'inline');
    try {
        const response = await fetch("/api/user/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        const responseData = await response.json();

        if (response.ok) {  //Response with status code 200
            showNotification("success", responseData.message)

        } else {
            showNotification("error", responseData.error)

        }

    } catch (error) {
        showNotification("error", error)
        
    }
    $(".loading-dash").css("display", 'none');
});

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
