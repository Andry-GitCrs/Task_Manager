(() => {
  window.CURRENT_USER_ID = window.CURRENT_USER_ID ?? null;
  window.ALL_TASKS = window.ALL_TASKS ?? [];
  window.ALL_TODAYS_TASKS = window.ALL_TODAYS_TASKS ?? [];
  window.ALL_LIST = window.ALL_LIST ?? [];
})();


$(document).ready(function() {
    let subTaskList = [];
    let taskNbr = 0;
    let subTaskNbr = 1;
    /* Task number */

    // Open modal and store clicked element
    $(".open-modal").on("click", function() {
        addTask = $(this);
        $(".overlay, .modal").fadeIn();
    });

    // Close modal
    $("#closeModal, .overlay").on("click", function(e) {
        e.preventDefault();
        $(".overlay, .modal").fadeOut();
        $("#update_task_form").off("submit");
        //$('.task-form').trigger("reset");
        $('.task-form').attr('id', 'add_task_form');
        $("#add_task_form").on("submit");
    });

    // Add task
    $(".add").on("click", (e) => {
        e.preventDefault();
        let content = $("#content").val().trim();
        $("#content").val("");
        if (content !== "") {
            if (!subTaskList.includes(content)) {
                if (subTaskNbr == 1) {
                    $(".task-list-container").text("");
                }
                subTaskList.push(content);
                $(".task-list-container").append($(`<li class='text-dark justify-content-between align-items-center subTask rounded-pill border px-3 py-2' id='subtask${taskNbr}${subTaskNbr}' ondblclick="editSubTask_on_adding('subtask${taskNbr}${subTaskNbr}')"></li>`).html(`${content}  <div class="w-auto d-flex justify-content-center gap-3 bg-transparent" ><i class="fas fa-pen" onclick="editSubTask_on_adding('subtask${taskNbr}${subTaskNbr}')"></i><i class="fas fa-trash-alt text-danger" onclick="removeSubTask_on_adding('subtask${taskNbr}${subTaskNbr}')"></i></div>`));
            } else {
                showNotification("error", `This task already has "${content}" subtask`);
            }
        }
        subTaskNbr += 1;
    });

    // Handle form submission
    $("#add_task_form").on("submit", async function(e) {
        e.preventDefault();
        let title = $("#title").val().trim();
        let startDate = $("#startDate").val();
        let endDate = $("#endDate").val();
        let bgColor = $("#bg-color-picker").val();
        let description = $("#description").val().trim();
        let list_id = $("#list_id").val();

        if (title.trim() !== "" && startDate !== "" && endDate !== "") {
            const task = {
                "task_title": title,
                "task_start_date": startDate,
                "task_end_date": endDate,
                "task_background_color": bgColor,
                "description": description || "None",
                "subtasks": [...subTaskList],
                "list_id": list_id
            };

            $(".loading").css("display", 'inline');
            try {
                const response = await fetch("/api/user/addTask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task)
                });

                const responseData = await response.json();

                if (response.ok) {  // Response with status code 200
                    const response_data = responseData.data;

                    const list_id = response_data.list_id;
                    const id = response_data.task_id;
                    const title = response_data.title;
                    const start_date = response_data.start_date;
                    const end_date = response_data.end_date;
                    const subtasks = response_data.subtasks;
                    const description = response_data.description;
                    const bg_color = response_data.bg_color;

                    ALL_TASKS.push({
                        "list_id": list_id,
                        "task_id": id,
                        "title": title,
                        "start_date": start_date,
                        "end_date": end_date,
                        "subtasks": subtasks,
                        "description": description,
                        "bg_color": bg_color
                    })

                    addNewTask(list_id, id, title, formatDate(start_date), formatDate(end_date), description, bg_color, subtasks);

                    $(".task-list-container").html("<span id='subTaskIndicator'>No subtask added </br> all subtask will appear here</span>");

                    subTaskList.splice(0, subTaskList.length);
                    $("#title").val("");
                    $("#content").val("");
                    $("#startDate").val("");
                    $("#endDate").val("");
                    $("#description").val("");
                    $("#bg-color-piker").val("#95ce83");
                    $(".overlay, .modal").fadeOut(); // Close modal
                    taskNbr += 1;
                    $("#taskNbr").text(taskNbr);
                    showNotification("success", responseData.message);
                } else {
                    showNotification("error", responseData.error);
                    $(".loading").css("display", 'none');
                }

            } catch (error) {
                showNotification("error", error.message);
                $(".loading").css("display", 'none');
            }

        } else {
            showNotification("error", "Empty required fields");
            $(".loading").css("display", 'none');
        }
        $(".loading").css("display", 'none');
    });

    let tempValue = [];
    $("#title").on("keyup", () => {
        tempValue.push($("#title").val());
        let value = tempValue[tempValue.length - 1];
        if (value) {
            $("#subTaskIndicator").text(`No subtask added to ${value}`);
        } else {
            $("#subTaskIndicator").html("No subtask added </br> all subtask will appear here");
        }
    });
});

//Remove task
async function  removeTask(id){
    const confirmation = confirm('Do u want to really remove this task')
    task_id = id
    if(confirmation){
        task = {
            "task_id": task_id
        }
        
        $(".loading").css("display", 'inline');
        try {
            const response = await fetch("/api/user/deleteTask", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task)
            });
    
            const responseData = await response.json();
    
            if (response.ok) {  //Response with status code 200
                showNotification("success", responseData.message)
                $("#taskNbr").text(parseInt($("#taskNbr").text()) - 1); // Update task count in UI
                $(`#task${id}`).remove()

                ALL_TASKS = ALL_TASKS.filter(task => task.task_id !== Number(id));

                if (ALL_TASKS.length == 0 && ALL_TODAYS_TASKS == 0) {
                    $("#addNewTask").fadeOut()
                    $("#no_task").fadeIn()
                }

            } else {
                showNotification("error", responseData.error)
                $(".loading").css("display", 'none');
            }
        } catch (error) {
            showNotification("error", error)
            $(".loading").css("display", 'none');
        }
        $(".loading").css("display", 'none');
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
        
        $(".loading").css("display", 'inline');
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
                $(".loading").css("display", 'none');
            }
        } catch (error) {
            showNotification("error", responseData.error)
            $(".loading").css("display", 'none');
        }
        $(".loading").css("display", 'none');
    }
}

// Add subtask
async function addSubTask(id, title){
    const newValue = prompt(`Add subtask to ${title}`).trim()
    task_id = id
    if(newValue.trim()){
        newSubtask = {
            "task_id": task_id,
            "subtask_title": newValue
        }
        
        $(".loading").css("display", 'inline');
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
                        class='justify-content-between align-items-center subTask subtask${subtask.subtask_id} rounded-pill px-3 py-2'
                        id='subtask${subtask.subtask_id}'
                        style="background-color: ${(subtask.finished)?'#198754' : '#f8f9fa'}"
                        ondblclick="editSubTask('subtask${subtask.subtask_id}', ${subtask.subtask_id})"
                    >
                    <span 

                    > 
                        ${subtask.subtask_title}
                    </span>
                    <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                        <i class="fas fa-trash-alt text-danger" onclick="removeSubTask('${subtask.subtask_id}')"></i>
                        <input
                            class="form-check-input mx-2 my-0"
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
                $(".loading").css("display", 'none');
            }
        } catch (error) {
            showNotification("error", responseData.error)
            $(".loading").css("display", 'none')
        }
    }else{
        showNotification("error", "Invalid value")
        $(".loading").css("display", 'none')
    }
    $(".loading").css("display", 'none')
}

function editSubTask_on_adding(id){
    showNotification("success", `Edit subtask ${id}?`)
}

// Write change
async function removeSubTask_on_adding(id){
    showNotification("success", `Remove subtask ${id}?`)
}

async function editSubTask(id, subtask_id) {
    let subtask_title = document.getElementById(id).textContent.trim();
    let temp_subtask_title = subtask_title;

    subtask_title = prompt('Edit subtask:', temp_subtask_title)?.trim() || "";

    if (subtask_title === "") {
        showNotification("error", `No modification applied`);

    } else if (subtask_title !== temp_subtask_title) {
        
        $(".loading").css("display", 'inline');
        try{
            const response = await fetch(`/api/subtask/update/${subtask_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({subtask_title})
            });

            let responseData = await response.json();

            if (response.ok) {
                subtask = responseData.data
                showNotification("success", responseData.message);
                document.getElementById(id).innerHTML = `
                    <span 
                        style="color: ${(subtask.finished)?'#f8f9fa' : ''}"
                    > 
                    ${subtask.subtask_title}
                    </span>
                    <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                        <i class="fas fa-trash-alt text-danger" onclick="removeSubTask('${subtask.subtask_id}')"></i>
                        <input
                            ${subtask.finished ? "checked" : ""}
                            value=${subtask.finished ? "off" : "on"}
                            class="form-check-input mx-2 my-0"
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
                `;

            }else{
                showNotification("error", responseData.error)
                
            }            
        }catch(error){
            showNotification("error", error)

        }
        $(".loading").css("display", 'none');

    } else {
        showNotification("error", `No modification applied`);

    }
}

const fetchTasks = async () => {
    $(".loading").css("display", 'inline')
    try {
        const response = await fetch(`/api/user/getTask`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        let responseData = await response.json();

        if (response.ok) {
            CURRENT_USER_ID = responseData.user_id;
            responseData = responseData.data;
            ALL_TASKS = responseData; 
            renderTasks();
            showNotification("success", `You have ${responseData.length} task${responseData.length > 1 ? "s" : ""} to do`);
            $(".loading").css("display", 'none')
            return responseData;
        } else {
            showNotification("error", responseData.error);
            CURRENT_USER_ID = responseData.user_id;
        }
    } catch (error) {
        console.error(error.message)
        showNotification("error", error.message);
    }
    $(".loading").css("display", 'none')
};

const fetchList = async () => {
    $(".loading").css("display", 'inline');
    try {
        const response = await fetch("/api/user/lists", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        let responseData = await response.json();

        if (response.ok) {
            responseData = responseData.data;
            const selectListContainer = document.getElementById('list_id');
            selectListContainer.innerHTML = '';
            const listContainer = document.getElementById('list-container');
            ALL_LIST = responseData

            // Append lists and checkboxes
            responseData.forEach(list => {
                const listEl = document.createElement('li');
                const opt = document.createElement('option');
                opt.value = list.list_id;
                opt.textContent = list.list_name;
                selectListContainer.append(opt);

                listEl.classList = 'my-2 p-1 px-3';
                listEl.innerHTML = `
                    <div class="form-check d-flex align-items-center justify-content-between gap-2">
                        <div class="d-flex align-items-center gap-2">
                            <input 
                                type="checkbox" 
                                class="form-check-input mt-0 list-checkbox" 
                                id="listCheck${list.list_id}" 
                                ${list.task_nbr > 0 ? 'checked' : ''}
                            >
                            <label class="form-check-label mb-0" for="listCheck${list.list_id}">
                                <a class="text-dark text-decoration-none">${list.list_name}</a>
                            </label>
                        </div>
                        <span>${list.task_nbr}</span>
                    </div>
                `;
                listContainer.appendChild(listEl);
            });
            attachCheckboxListeners();

            renderTasks(getCheckedLists());
            document.getElementById('listCheckAll').addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('.list-checkbox');
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                checkboxes.forEach(cb => cb.checked = !allChecked);
            });

        } else {
            showNotification("error", responseData.message);
        }
    } catch (error) {
        showNotification("error", error.message);
    }
    $(".loading").css("display", 'none');
};

function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.list-checkbox');

    const checkAllStatus = () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            checkAllStatus();
            renderTasks();
        });
    });
}

function getCheckedLists() {
    const checkboxes = document.querySelectorAll('.list-checkbox');
    const checked = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.id.replace('listCheck', ''));
    return checked;
}

// Call the function to fetch tasks
fetchList()
fetchTasks()

function renderTasks(selectedLists = null) {
    if (!selectedLists) {
        selectedLists = getCheckedLists();
    }

    const container = document.getElementById('allTaskContainer'); // User dashboard
    const todayContainer = document.getElementById('todayTaskContainer'); // Today dashboard

    if (container) {

        const filteredTasks = ALL_TASKS.filter(task => selectedLists.includes(String(task.list_id)));
        if (ALL_TASKS.length > 0) {
            container.innerHTML = `
                <!--Create task-->
                <div class="col-4 p-1 rounded-3 task taskBox" title="Add new task" id="addNewTask">
                    <div class="rounded-4  h-100  p-2 rounded-3 d-flex align-items-center justify-content-center open-modal">
                        <i class="text-dark fas fa-add addSing"></i>
                    </div>
                </div>
            `;
            $("#no_task").fadeOut()
        }

        $("#taskNbr").text(filteredTasks.length);

        filteredTasks.forEach(task => {
            const {list_id, task_id, title, start_date, end_date, subtasks, description, bg_color } = task;
            addNewTask(list_id, task_id, title, formatDate(start_date), formatDate(end_date), description, bg_color, subtasks);
        });

        // Reattach modal event after rendering
        $('.open-modal').on('click', () => {
            $('.overlay, .modal').fadeIn();
        });
    } else if (todayContainer) {

        const filteredTasks = ALL_TODAYS_TASKS.filter(task => selectedLists.includes(String(task.list_id)));

        if (ALL_TODAYS_TASKS.length > 0) {
            todayContainer.innerHTML = `
                <div class="col-4 p-1 rounded-3 task taskBox" title="Add new task" id="addNewTask">
                    <div class="rounded-4 h-100  p-2 rounded-3 d-flex align-items-center justify-content-center open-modal">
                        <i class="text-dark fas fa-add addSing"></i>
                    </div>
                </div>
            `;
            $("#no_task").fadeOut()
        }

        $("#todayTaskNbr").text(filteredTasks.length);

        filteredTasks.forEach(task => {
            const {list_id, task_id, title, start_date, end_date, subtasks, description, bg_color } = task;
            addNewTask(list_id, task_id, title, formatDate(start_date), formatDate(end_date), description, bg_color, subtasks);
        });

        // Reattach modal event after rendering
        $('.open-modal').on('click', () => {
            $('.overlay, .modal').fadeIn();
        });
    }
}

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
function addNewTask(list_id, id, title, start_date, end_date, description, bg_color,  subtasks){
    let list_name  = null

    if (ALL_TASKS.length > 0 || ALL_TODAYS_TASKS > 0) {
        $("#no_task").fadeOut()
    }

    if(!document.getElementById('addNewTask')){
        const container = document.getElementById('allTaskContainer');
        container.innerHTML = `
            <div class="col-4 p-1 rounded-3 task taskBox" title="Add new task" id="addNewTask">
                <div class="rounded-4  h-100  p-2 rounded-3 d-flex align-items-center justify-content-center open-modal">
                    <i class="text-dark fas fa-add addSing"></i>
                </div>
            </div>`
        
            // Open modal and store clicked element
            $(".open-modal").on("click", function() {
                addTask = $(this);
                $(".overlay, .modal").fadeIn();
            });
    }else {
        $("#addNewTask").fadeIn()
    }
    
    ALL_LIST.forEach(list => {
        if( list.list_id == list_id){
            list_name = list.list_name
        }   
    })
    let taskContainer = $(`<div class="col-4 p-1 taskBox" id="task${id}"></div>`)
    taskContainer.html(`    
        <div 
            class=" h-100 p-2 rounded-4 d-flex flex-column justify-content-start position-relative"
            style="background: linear-gradient(135deg, ${bg_color}99,rgb(211, 213, 215));"
            title="${(description !== 'None')?description:'No description'}"
        >
            <div class="position-relative mb-2 bg-transparent w-100">
                <span class="text-dark date date-range text-center w-100 d-flex justify-content-center">
                    <i class="fa-solid fa-calendar-days text-success"></i>
                    ${start_date}
                    <i class="fa-solid fa-arrow-right text-warning"></i>
                    ${end_date}
                </span>
            </div>
            <span style='border: 2px solid ${bg_color}' class="position-absolute list-name small rounded-pill py-1 px-3 bg-light text-dark me-1 mt-1 shadow">
                <i class="fa-solid fa-bookmark text-secondary"  style='color: ${bg_color}!important'></i>
                ${list_name}
            </span>
            <h3 class="text-dark task-title">
                ${title}
                <div class='d-flex justify-content-center align-items-center gap-3 bg-transparent'>
                    <i class="fas fa-pen text-success task-icon" onclick="update_task('${list_id}','${id}', '${title}', '${start_date}', '${end_date}', '${bg_color}', '${description}')"></i> 
                    <i class="fas fa-add text-success task-icon" onclick="addSubTask('${id}', '${title}')"></i> 
                    <i class="fas fa-trash-alt text-danger task-icon" onclick="removeTask('${id}')"></i>
                </div>
            </h3>
            <ul class="p-0" id='subtaskContainer${id}'>
            ${
                subtasks.map( subtask => `
                    <li 
                        class='justify-content-between align-items-center subTask subtask${subtask.subtask_id} rounded-pill px-3 py-2' 
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
                            <i class="fas fa-trash-alt text-danger" onclick="removeSubTask('${subtask.subtask_id}')"></i>
                            <input
                                ${subtask.finished ? "checked" : ""}
                                value=${subtask.finished ? "off" : "on"}
                                class="form-check-input mx-2 my-0"
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
    if ($(".task")) {
        $(".task").after(taskContainer)
    }else {
        showNotification('error', "No task container found")
    }
}

//Notification displayer
function showNotification(type, message) {
    const notification = document.getElementById('notification');
    const messageBox = document.getElementById('notification-message');
    const icon = document.getElementById('notification-icon');

    // Reset classes
    notification.className = 'position-fixed bottom-0 end-0 mb-3 me-3 px-4 py-3 shadow rounded text-white d-flex align-items-center gap-2';
    icon.className = '';

    if (type === 'error') {
        notification.classList.add('bg-danger');
        icon.classList.add('fas', 'fa-circle-exclamation');
    } else if (type === 'success') {
        notification.classList.add('bg-success');
        icon.classList.add('fas', 'fa-check-circle');
    }

    messageBox.textContent = message;

    // Show with animation
    notification.style.opacity = 0;
    notification.style.transform = 'translateY(20px)';
    notification.classList.remove('d-none');

    setTimeout(() => {
        notification.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        notification.style.opacity = 1;
        notification.style.transform = 'translateY(0)';
    }, 10); // Small delay to trigger transition

    // Hide after 5 seconds
    setTimeout(() => {
        notification.style.opacity = 0;
        notification.style.transform = 'translateY(20px)';
        
        // After animation ends, hide the element
        setTimeout(() => {
            notification.classList.add('d-none');
        }, 500); // Match transition duration
    }, 5000);
}

// Check Subtask
async function check(id){
    if( $(`#input${id}`).val() == "on" ){ //Check
        
        $(".loading").css("display", 'inline');
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
        
        $(".loading").css("display", 'none');
    }else{ //Uncheck
        
        $(".loading").css("display", 'inline');
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
        $(".loading").css("display", 'none');
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
    
    $(".loading").css("display", 'inline');
    try {
        const response = await fetch(`/api/verify_user`, {
            method: "GET",
        });
    
        if (response.ok) {
            $('._user_action').append(`
                <li class="my-2 py-1">
                    <div class="w-100 d-flex align-items-center">
                        <a  class="text-dark text-decoration-none w-100" href="/auth/admin/login">
                            <i class="text-success fas fa-key"></i>
                            Login as admin
                        </a>
                    </div>
                </li>
            `)
        }
    } catch (error) {
       console.error(error.message)
    }
}

verify()

// Find task
async function findTaskk(){
    let title = $('#findTask').val().trim()
    let searchResult = $('#searchResultsContainer')
    searchResult.css('display', 'block')
    searchResult.html("")
    if(title){
        
        $(".loading").css("display", 'inline');
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
                            <i class="fas fa-trash-alt text-danger" onclick="removeTask('${id}')"></i>
                            <i class="fas fa-check-circle text-warning " style='display: none'  id='check_task_icon${id}'></i>
                        </div>
                    </li> 
                `)
            })
            
            $(".loading").css("display", 'none');
            
        }else{
            showNotification('error', "Task not found")
            $(".loading").css("display", 'none');
        }
    }else{
        searchResult.html("")
        searchResult.css('display', 'none')  
        $(".loading").css("display", 'none');
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
function genTaskCard(list_id, bg_color, description, start_date, end_date, title, id, subtasks){
    let list_name = null
    ALL_LIST.forEach(list => {
        if( list.list_id == list_id){
            list_name = list.list_name
        }   
    })
    const card = `   
        <div 
            class=" h-100 p-2 rounded-4 d-flex flex-column justify-content-start position-relative"
            style="background: linear-gradient(135deg, ${bg_color}99,#d3d5d7);"
            title="${(description !== 'None')?description:'No description'}"
        >
            <div class="position-relative mb-2 bg-transparent w-100">
                <span class="text-dark date date-range text-center w-100 d-flex justify-content-center">
                    <i class="fa-solid fa-calendar-days text-success"></i>
                    ${start_date}
                    <i class="fa-solid fa-arrow-right text-warning"></i>
                    ${end_date}
                </span>
            </div>
            <span style='border: 2px solid ${bg_color}' class="position-absolute list-name small rounded-pill py-1 px-3 bg-light text-dark me-1 mt-1 shadow">
                <i class="fa-solid fa-bookmark text-secondary"  style='color: ${bg_color}!important'></i>
                ${list_name}
            </span>
            <h3 class="text-dark task-title">
                ${title}
                <div class='d-flex justify-content-center gap-3 bg-transparent'>         
                    <i class="fas fa-pen text-success task-icon" onclick="update_task(${list_id}, '${id}', '${title}', '${start_date}', '${end_date}', '${bg_color}', '${description}')"></i> 
                    <i class="fas fa-add text-success" onclick="addSubTask('${id}', '${title}')"></i> 
                    <i class="fas fa-trash-alt text-danger" onclick="removeTask('${id}')"></i>
                </div>
            </h3>
            <ul class="p-0" id='subtaskContainer${id}'>
            ${
                subtasks.map(subtask => `
                    <li 
                        class='justify-content-between align-items-center subTask subtask${subtask.subtask_id} rounded-pill px-3 py-2'
                        id='subtask${subtask.subtask_id}'
                        style="background-color: ${(subtask.finished)?'#198754' : '#f8f9fa'}"
                        ondblclick="editSubTask('subtask${subtask.subtask_id}', ${subtask.subtask_id})"
                    >
                        <span 
                            style="color: ${(subtask.finished)?'#f8f9fa' : ''}"
                        > 
                        ${subtask.subtask_title}
                        </span>
                        <div class="w-auto d-flex justify-content-center gap-3 bg-transparent">
                            <i class="fas fa-trash-alt text-danger" onclick="removeSubTask('${subtask.subtask_id}')"></i>
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

function convertToISO(dateStr) {
    // Split into parts: "Wed", "23", "April", "2025"
    const [ , day, monthName, year ] = dateStr.split(' ');
  
    // Map full month name to month number
    const months = {
      January: "01", February: "02", March: "03",
      April: "04", May: "05", June: "06",
      July: "07", August: "08", September: "09",
      October: "10", November: "11", December: "12"
    };
  
    const month = months[monthName];
  
    // Ensure day has leading zero
    const paddedDay = day.padStart(2, '0');
  
    return `${year}-${month}-${paddedDay}`;
  }

function update_task(list_id, task_id, title, startDate, endDate, bg_color, description){
    $('.overlay, .modal').fadeIn()
    $('.task-form').attr('id', 'update_task_form')
    $('#list_id').val(list_id)
    $("#title").val(title)
    $("#startDate").val(convertToISO(startDate))
    $("#endDate").val(convertToISO(endDate))
    $("#bg-color-picker").val(bg_color)
    $("#description").val(description)

    $("#update_task_form").off("submit");

    $("#update_task_form").on("submit", async function(e) {
        e.preventDefault()
        let list_id = $("#list_id").val()
        let title = $("#title").val().trim()
        let startDate = $("#startDate").val()
        let endDate = $("#endDate").val()
        let bgColor = $("#bg-color-picker").val()
        let description = $("#description").val().trim()
    
        if (title.trim() !== "" && startDate !== "" && endDate !== "") {
            task = {
                "task_title": title,
                "task_start_date": startDate,
                "task_end_date": endDate,
                "task_background_color": bgColor,
                "description": description || "None",
                "list_id": list_id
            }
    
            $(".loading").css("display", 'inline');
            try {
                const response = await fetch(`/api/task/update/${task_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task)
                });
        
                const responseData = await response.json();
        
                if (response.ok) {  //Response with status code 200
                    showNotification("success", responseData.message)
                    window.location.reload()
                } else {
                    showNotification("error", responseData.error)
                    $(".loading").css("display", 'none');
                }
    
            } catch (error) {
                showNotification("error", responseData.error)
                $(".loading").css("display", 'none');
            }
    
        }else{
            showNotification("error", "Empty required fields")
            $(".loading").css("display", 'none');
        }

        $(".loading").css("display", 'none');
    })
}

// Initialize Socket.IO
const socket = io({
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: true // Ensures a fresh connection
  });

socket.on('connect', () => {
    // Now tell server to join
    socket.emit('join', { user_id: CURRENT_USER_ID });
});

// Listen for new notifications
socket.on('new_notification', (data) => {
    if (data.user_id === CURRENT_USER_ID) {
        // Update the notification badge count
        const badge = document.querySelector('.dropdown .badge.bg-success');
        let count = parseInt(badge?.textContent) || 0;
        badge.textContent = count + 1;

        // Add the new notification to the dropdown menu
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu.innerHTML == '<span class="">No notification yet</span>') {
            dropdownMenu.innerHTML = '';
        }
        const newNotification = `
            <li id="notification${data.notification_id}" class="list-group-item border-0 px-3 py-2 rounded-3 mb-2 shadow-sm">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex flex-column">
                    <span class="text-body">${data.message}</span>
                    <small class="text-muted mt-1">${data.created_at}</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-light text-danger ms-3 border-0" onclick="deleteNotification(${data.notification_id})" aria-label="Delete">
                    <i class="fas fa-times"></i>
                    </button>
                </div>
            </li>
        `;
        dropdownMenu?.insertAdjacentHTML('afterbegin', newNotification);

        showNotification('success', "You received a new notification: ");
    } else {
        console.warn('Notification received for a different user:', data.user_id); // Debug: Warn if the notification is for another user
    }
});

// Fetch initial notifications on page load
const fetchNotifications = async () => {
    try {
        const response = await fetch('/api/user/notifications', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            // Populate the dropdown menu with notifications
            const dropdownMenu = document.querySelector('.dropdown-menu');
            const responseData = await response.json();
            const notifications = responseData.data;

            if (notifications.length == 0) {
                dropdownMenu.style.textAlign = 'center'
                dropdownMenu.innerHTML = '<span class="">No notification yet</span>'
                return
            } 

            dropdownMenu.innerHTML = ''; // Clear existing notifications
            notifications.forEach(notification => {
                const notificationItem = `
                    <li id="notification${notification.id}" class="list-group-item border-0 px-3 py-2 rounded-3 mb-2 shadow-sm">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex flex-column">
                            <span class="text-body">${notification.message}</span>
                            <small class="text-muted mt-1">${notification.created_at}</small>
                            </div>
                            <button type="button" class="btn btn-sm btn-light text-danger ms-3 border-0" onclick="deleteNotification(${notification.id})" aria-label="Delete">
                            <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </li>      
                `;
                dropdownMenu.insertAdjacentHTML('beforeend', notificationItem);
            });

            // Update the badge count
            const badge = document.querySelector('.dropdown .badge.bg-success');
            badge.textContent = notifications.length;
        } else {
            console.error('Failed to fetch notifications:', response.statusText); // Debug: Log fetch failure
        }
    } catch (error) {
        console.error('Error fetching notifications:', error); // Debug: Log fetch error
    }
};

// Delete notification
async function deleteNotification(notificationId) {
    try {
        const response = await fetch(`/api/user/notifications/mark_read/${notificationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const responseData = await response.json();
            showNotification('success', responseData.message);
            // Remove the deleted notification from the dropdown menu
            const notificationItem = document.getElementById(`notification${notificationId}`);
            if (notificationItem) {
                notificationItem.remove();
                const badge = document.querySelector('.dropdown .badge.bg-success');
                const dropdownMenu = document.querySelector('.dropdown-menu');
                let count = parseInt(badge.textContent);
                badge.textContent = count - 1;
                if (count - 1 == 0) {
                    dropdownMenu.style.textAlign = 'center'
                    dropdownMenu.innerHTML = '<span class="">No notification yet</span>'
                    return
                }
            }

        } else {
            console.error('Failed to delete notification:', response.statusText); // Debug: Log delete failure
        }
    } catch (error) {
        console.error('Error deleting notification:', error); // Debug: Log delete error
    }
}

// Call fetchNotifications on page load
fetchNotifications();

// Add new list
async function addNewList(event) {
    event.preventDefault();

    const listName = document.getElementById('listName').value.trim();
    const listDescription = document.getElementById('listDescription').value.trim();
    
    $(".loading").css("display", 'inline')
    try{
        const response = await fetch(`/api/user/lists/add`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "list_name": listName,
                "list_description": listDescription,
            })
        });
        const data = await response.json();
        if(response.ok){
            list = data.list
            ALL_LIST.push(list)
            showNotification("success", data.message)
            const listContainer = document.getElementById('list-container');
            const listEl = document.createElement('li');
            listEl.classList = 'my-2 p-1 px-3';
            listEl.innerHTML = `
                <div class="form-check d-flex align-items-center justify-content-between gap-2">
                    <div class="d-flex align-items-center gap-2">
                        <input 
                            type="checkbox" 
                            class="form-check-input mt-0 list-checkbox" 
                            id="listCheck${list.list_id}" 
                            ${list.list_name == 'Personal' ? 'checked' : ''}
                        >
                        <label class="form-check-label mb-0" for="listCheck${list.list_id}">
                            <a class="text-dark text-decoration-none">${list.list_name}</a>
                        </label>
                    </div>
                    <span>${list.task_nbr}</span>
                </div>
            `;
            listContainer.appendChild(listEl);
            const opt = document.createElement('option');
            opt.value = list.list_id;
            opt.textContent = list.list_name;
            const selectListContainer = document.getElementById('list_id');
            selectListContainer.append(opt);

            attachCheckboxListeners();

            event.target.reset();
        }else{
            showNotification("error", data.error)
        }
    } catch (error) {
        showNotification("error", error)
    }    
    $(".loading").css("display", 'none')

    return false;
}