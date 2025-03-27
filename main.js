"use strict";
// DOM elements with nullish coalescing to handle element availability
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const tagInput = document.getElementById('tagInput');
const filterSelect = document.getElementById('filterSelect');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Initialize tasks array from localStorage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// Create a new task
function addTask() {
    const text = taskInput.value.trim();
    if (!text)
        return;
    // Parse tags from input if the element exists
    const tags = tagInput?.value ? tagInput.value.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    const task = {
        id: crypto.randomUUID(), // Modern API for generating UUIDs
        text,
        completed: false,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || undefined,
        tags,
        createdAt: new Date().toISOString(),
        isImportant: false
    };
    // Add to beginning of array (newest first)
    tasks.unshift(task);
    saveTasks();
    // Reset form
    taskInput.value = '';
    dueDateInput.value = '';
    if (tagInput)
        tagInput.value = '';
    // Optional: Focus back on the input for adding more tasks
    taskInput.focus();
}

// Toggle task completion status
function toggleTask(id) {
    tasks = tasks.map(task => task.id === id ? Object.assign(Object.assign({}, task), { completed: !task.completed }) : task);
    saveTasks();
}

// Toggle task importance
function toggleImportance(id) {
    tasks = tasks.map(task => task.id === id ? Object.assign(Object.assign({}, task), { isImportant: !task.isImportant }) : task);
    saveTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}

// Clear all completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Render all tasks
function renderTasks() {
    // Apply filter if filter select exists
    let filteredTasks = [...tasks];
    if (filterSelect) {
        const filter = filterSelect.value;
        if (filter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }
        else if (filter === 'active') {
            filteredTasks = tasks.filter(t => !t.completed);
        }
        else if (filter === 'important') {
            filteredTasks = tasks.filter(t => t.isImportant);
        }
    }
    taskList.innerHTML = '';
    // No tasks message
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No tasks to display';
        taskList.appendChild(emptyMessage);
        updateStats();
        return;
    }
    // Render each task
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority} ${task.isImportant ? 'important' : ''}`;
        li.dataset.id = task.id;
        // Format date if exists
        const dateDisplay = task.dueDate
            ? `<span class="due-date">${new Date(task.dueDate).toLocaleDateString()}</span>`
            : '';
        // Display tags if they exist
        const tagsDisplay = task.tags && task.tags.length
            ? `<div class="tags">${task.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</div>`
            : '';
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                ${dateDisplay}
                ${tagsDisplay}
            </div>
            <div class="task-actions">
                <button class="star-btn ${task.isImportant ? 'starred' : ''}">
                    ${task.isImportant ? '★' : '☆'}
                </button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        // Add event listeners
        const checkbox = li.querySelector('input');
        checkbox.addEventListener('change', () => toggleTask(task.id));
        const starBtn = li.querySelector('.star-btn');
        starBtn.addEventListener('click', () => toggleImportance(task.id));
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        taskList.appendChild(li);
    });
    updateStats();
}

// Update task counters
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const important = tasks.filter(t => t.isImportant).length;
    document.getElementById('totalCount').textContent = total.toString();
    document.getElementById('completedCount').textContent = completed.toString();
    document.getElementById('pendingCount').textContent = (total - completed).toString();
    // Optional: update important count if element exists
    const importantCount = document.getElementById('importantCount');
    if (importantCount) {
        importantCount.textContent = important.toString();
    }
    // Enable/disable clear completed button based on if there are completed tasks
    if (clearCompletedBtn) {
        clearCompletedBtn.disabled = completed === 0;
    }
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter')
        addTask();
});

// Filter listener if filter exists
filterSelect?.addEventListener('change', renderTasks);

// Clear completed listener
clearCompletedBtn?.addEventListener('click', clearCompleted);

// Initialize
renderTasks();
