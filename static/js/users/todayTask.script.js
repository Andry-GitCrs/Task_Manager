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

            ALL_TODAYS_TASKS = todayTasks
            renderTasks()
        } else {
            showNotification("error", "You don't have any task for today");
        }
    } catch (error) {
        showNotification("error", error.message);
    }
    $(".loading-dash").css("display", 'none');
}
fetchTodayTasks()