"use strict";
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority}`;
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                ${task.dueDate ? `<span class="due-date">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="delete-btn">Delete</button>
            </div>
        `;
        const checkbox = li.querySelector('input');
        checkbox.addEventListener('change', () => toggleTask(task.id));
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        taskList.appendChild(li);
    });
    updateStats();
}
function addTask() {
    const text = taskInput.value.trim();
    if (text) {
        const task = {
            id: Date.now(),
            text,
            completed: false,
            priority: prioritySelect.value,
            dueDate: dueDateInput.value
        };
        tasks.unshift(task);
        saveTasks();
        taskInput.value = '';
        dueDateInput.value = '';
    }
}
function toggleTask(id) {
    tasks = tasks.map(task => task.id === id ? Object.assign(Object.assign({}, task), { completed: !task.completed }) : task);
    saveTasks();
}
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById('totalCount').textContent = total.toString();
    document.getElementById('completedCount').textContent = completed.toString();
    document.getElementById('pendingCount').textContent = (total - completed).toString();
}
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter')
        addTask();
});
renderTasks();
