let userStatisticsChart; // Declare a variable to hold the chart instance

const fetchStat = async () => {
    document.getElementById("loading").style.display = 'inline';
    try {
        const response = await fetch('/api/users_statistics');
        const data = await response.json();
        if (response.ok) {
            const labels = data.data.map(item => item.date);
            const counts = data.data.map(item => item.count);
            const year = new Date().getFullYear();

            const monthSelect = document.getElementById('monthSelect');
            const filteredLabels = labels.filter((label, index) => {
                const date = new Date(label);
                return monthSelect.value === 'all' || date.getMonth() + 1 === parseInt(monthSelect.value);
            });
            const filteredCounts = counts.filter((_, index) => {
                const date = new Date(labels[index]);
                return monthSelect.value === 'all' || date.getMonth() + 1 === parseInt(monthSelect.value);
            });

            const ctx = document.getElementById('userStatisticsChart').getContext('2d');

            // Destroy the existing chart instance if it exists
            if (userStatisticsChart) {
                userStatisticsChart.destroy();
            }

            // Create a new chart instance
            userStatisticsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: filteredLabels.map(label => {
                        const date = new Date(label);
                        const today = new Date();
                        if (date.toDateString() === today.toDateString()) {
                            return "Today"; // Display "Today" if the date matches today's date
                        }
                        return `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('default', { month: 'short' })}`; // Format as DD MMM
                    }),
                    datasets: [{
                        label: 'Users Created Per Day',
                        data: filteredCounts,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                title: function (tooltipItems) {
                                    const date = new Date(filteredLabels[tooltipItems[0].dataIndex]);
                                    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; // Full date in tooltip
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date (DD/MM)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: `${year} Users Created`
                            },
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return Number.isInteger(value) ? value : null; // Only display integers
                                }
                            }
                        }
                    }
                }
            });
        } else {
            showNotification("error", data.message);
        }
    } catch (error) {
        showNotification("error", error.message || "An error occurred");
    }
    document.getElementById("loading").style.display = 'none';
};

// Notification displayer function
const showNotification = (type, message) => {
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
    notification.classList.remove('d-none');

    setTimeout(() => {
        notification.classList.add('d-none');
    }, 5000);

    notification.addEventListener('click', () => {
        notification.classList.add('d-none');
    });
};

// Add event listener for month selection
const monthSelect = document.getElementById('monthSelect');
monthSelect.addEventListener('change', () => {
    fetchStat(); // Re-fetch and re-render the chart based on the selected month
});

// Initial fetch
fetchStat();