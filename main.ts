type Priority = 'low' | 'medium' | 'high';

interface Task {
    id: number;
    text: string;
    completed: boolean;
    priority: Priority;
    dueDate?: string;
}

const taskInput = document.getElementById('taskInput') as HTMLInputElement;
const addTaskBtn = document.getElementById('addTaskBtn') as HTMLButtonElement;
const taskList = document.getElementById('taskList') as HTMLUListElement;
const prioritySelect = document.getElementById('prioritySelect') as HTMLSelectElement;
const dueDateInput = document.getElementById('dueDateInput') as HTMLInputElement;

let tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');

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

        const checkbox = li.querySelector('input') as HTMLInputElement;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const deleteBtn = li.querySelector('.delete-btn') as HTMLButtonElement;
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(li);
    });
    updateStats();
}

function addTask() {
    const text = taskInput.value.trim();
    if (text) {
        const task: Task = {
            id: Date.now(),
            text,
            completed: false,
            priority: prioritySelect.value as Priority,
            dueDate: dueDateInput.value
        };
        tasks.unshift(task);
        saveTasks();
        taskInput.value = '';
        dueDateInput.value = '';
    }
}

function toggleTask(id: number) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
}

function deleteTask(id: number) {
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
    
    document.getElementById('totalCount')!.textContent = total.toString();
    document.getElementById('completedCount')!.textContent = completed.toString();
    document.getElementById('pendingCount')!.textContent = (total - completed).toString();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

renderTasks();