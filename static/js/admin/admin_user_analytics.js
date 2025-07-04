let userStatisticsChart;

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

            // Clean up previous chart
            if (userStatisticsChart) {
                userStatisticsChart.destroy();
            }

            // Create gradient fill
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(13, 110, 253, 0.5)');
            gradient.addColorStop(1, 'rgba(13, 110, 253, 0)');

            userStatisticsChart = new Chart(document.getElementById('userStatisticsChart'), {
            type: 'line',
            data: {
                labels: filteredLabels,
                datasets: [{
                label: 'Registrations',
                data: filteredCounts,
                fill: true,
                tension: 0.4, // Smooth curve
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // soft fill
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: '#fff',
                pointBorderColor: 'rgba(54, 162, 235, 1)',
                pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointHoverBorderColor: '#fff',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                    color: '#444',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                    }
                },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#111',
                    bodyColor: '#333',
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10
                },
                },
                scales: {
                x: {
                    grid: {
                    display: false
                    },
                    ticks: {
                    color: '#666',
                    font: {
                        size: 12
                    }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                    borderDash: [5, 5]
                    },
                    ticks: {
                    color: '#666',
                    font: {
                        size: 12
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