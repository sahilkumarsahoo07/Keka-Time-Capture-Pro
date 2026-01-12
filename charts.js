// charts.js - Interactive Charts Module

class ChartsManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#6c63ff',
            success: '#4cd964',
            warning: '#ffcc00',
            danger: '#ff3b30',
            info: '#5ac8fa',
            purple: '#bf77f6',
            orange: '#ff9500'
        };
    }

    // Weekly Bar Chart - Daily hours comparison
    createWeeklyBarChart(canvasId, weeklyData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart if any
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = weeklyData.map(day => day.date);
        const hours = weeklyData.map(day => {
            const totalMs = day.totalWorkMillis || 0;
            return (totalMs / (1000 * 60 * 60)).toFixed(2);
        });

        const backgroundColors = weeklyData.map(day => {
            if (day.isOff) return 'rgba(128, 128, 128, 0.5)';
            if (day.isLate) return 'rgba(255, 204, 0, 0.7)';
            return 'rgba(108, 99, 255, 0.7)';
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hours Worked',
                    data: hours,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                return `${context.parsed.y} hours`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: (value) => value + 'h'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    // Monthly Line Chart - Trend over month
    createMonthlyLineChart(canvasId, monthlyData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = monthlyData.map(day => day.date);
        const hours = monthlyData.map(day => {
            const totalMs = day.totalWorkMillis || 0;
            return (totalMs / (1000 * 60 * 60)).toFixed(2);
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Hours',
                    data: hours,
                    borderColor: this.colors.primary,
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        borderColor: this.colors.primary,
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: (value) => value + 'h'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // Break Usage Pie Chart
    createBreakPieChart(canvasId, breakData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const totalBreak = breakData.totalBreakMs || 0;
        const allowedBreak = breakData.allowedBreakMs || 0;
        const usedBreak = Math.min(totalBreak, allowedBreak);
        const remainingBreak = Math.max(0, allowedBreak - totalBreak);
        const overBreak = Math.max(0, totalBreak - allowedBreak);

        const data = [];
        const labels = [];
        const colors = [];

        if (usedBreak > 0) {
            data.push((usedBreak / (1000 * 60)).toFixed(0));
            labels.push('Used Break');
            colors.push(this.colors.success);
        }
        if (remainingBreak > 0) {
            data.push((remainingBreak / (1000 * 60)).toFixed(0));
            labels.push('Remaining');
            colors.push(this.colors.info);
        }
        if (overBreak > 0) {
            data.push((overBreak / (1000 * 60)).toFixed(0));
            labels.push('Over Break');
            colors.push(this.colors.danger);
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#1a1a2e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed} min`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Arrival Time Distribution Chart
    createArrivalTimeChart(canvasId, arrivalData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        // Group arrivals by time slots
        const timeSlots = {
            'Before 9:00': 0,
            '9:00 - 9:30': 0,
            '9:30 - 10:00': 0,
            '10:00 - 10:30': 0,
            'After 10:30': 0
        };

        arrivalData.forEach(arrival => {
            const time = arrival.arrivalTime; // Format: "HH:MM"
            if (!time) return;

            const [hours, minutes] = time.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes;

            if (totalMinutes < 540) timeSlots['Before 9:00']++;
            else if (totalMinutes < 570) timeSlots['9:00 - 9:30']++;
            else if (totalMinutes < 600) timeSlots['9:30 - 10:00']++;
            else if (totalMinutes < 630) timeSlots['10:00 - 10:30']++;
            else timeSlots['After 10:30']++;
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(timeSlots),
                datasets: [{
                    label: 'Days',
                    data: Object.values(timeSlots),
                    backgroundColor: [
                        this.colors.success,
                        this.colors.info,
                        this.colors.warning,
                        this.colors.orange,
                        this.colors.danger
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Overtime Tracker Chart
    createOvertimeChart(canvasId, overtimeData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = overtimeData.map(day => day.date);
        const overtime = overtimeData.map(day => {
            const overtimeMs = day.overtimeMs || 0;
            return (overtimeMs / (1000 * 60 * 60)).toFixed(2);
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Overtime Hours',
                    data: overtime,
                    backgroundColor: 'rgba(255, 204, 0, 0.7)',
                    borderColor: 'rgba(255, 204, 0, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `Overtime: ${context.parsed.y} hours`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: (value) => value + 'h'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    // Comparison Chart - Current vs Previous Week
    createComparisonChart(canvasId, currentWeek, previousWeek) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const currentHours = currentWeek.map(day => {
            const totalMs = day.totalWorkMillis || 0;
            return (totalMs / (1000 * 60 * 60)).toFixed(2);
        });

        const previousHours = previousWeek.map(day => {
            const totalMs = day.totalWorkMillis || 0;
            return (totalMs / (1000 * 60 * 60)).toFixed(2);
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Current Week',
                        data: currentHours,
                        borderColor: this.colors.primary,
                        backgroundColor: 'rgba(108, 99, 255, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Previous Week',
                        data: previousHours,
                        borderColor: this.colors.info,
                        backgroundColor: 'rgba(90, 200, 250, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y} hours`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: (value) => value + 'h'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    // Destroy all charts
    destroyAll() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        });
        this.charts = {};
    }
}

// Export for use in popup.js
window.ChartsManager = ChartsManager;
