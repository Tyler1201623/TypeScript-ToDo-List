type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: Priority;
    dueDate?: string;
    tags?: string[];
    createdAt: string;
    isImportant?: boolean;
}

const taskInput = document.getElementById('taskInput') as HTMLInputElement;
const addTaskBtn = document.getElementById('addTaskBtn') as HTMLButtonElement;
const taskList = document.getElementById('taskList') as HTMLUListElement;
const prioritySelect = document.getElementById('prioritySelect') as HTMLSelectElement;
const dueDateInput = document.getElementById('dueDateInput') as HTMLInputElement;
const tagInput = document.getElementById('tagInput') as HTMLInputElement || null;
const filterSelect = document.getElementById('filterSelect') as HTMLSelectElement || null;
const clearCompletedBtn = document.getElementById('clearCompletedBtn') as HTMLButtonElement || null;

let tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');

function renderTasks() {
    let filteredTasks = [...tasks];
    
    if (filterSelect) {
        const filter = filterSelect.value;
        if (filter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        } else if (filter === 'active') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (filter === 'important') {
            filteredTasks = tasks.filter(t => t.isImportant);
        }
    }
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No tasks to display';
        taskList.appendChild(emptyMessage);
        updateStats();
        return;
    }
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority} ${task.isImportant ? 'important' : ''}`;
        li.dataset.id = task.id;
        
        const dateDisplay = task.dueDate 
            ? `<span class="due-date">${new Date(task.dueDate).toLocaleDateString()}</span>` 
            : '';
            
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
        
        const checkbox = li.querySelector('input') as HTMLInputElement;
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        const starBtn = li.querySelector('.star-btn') as HTMLButtonElement;
        starBtn.addEventListener('click', () => toggleImportance(task.id));
        
        const deleteBtn = li.querySelector('.delete-btn') as HTMLButtonElement;
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(li);
    });
    
    updateStats();
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    
    const tags = tagInput?.value ? tagInput.value.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    const task: Task = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        priority: prioritySelect.value as Priority,
        dueDate: dueDateInput.value || undefined,
        tags,
        createdAt: new Date().toISOString(),
        isImportant: false
    };
    
    tasks.unshift(task);
    saveTasks();
    
    taskInput.value = '';
    dueDateInput.value = '';
    if (tagInput) tagInput.value = '';
    
    taskInput.focus();
}

function toggleTask(id: string) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
}

function toggleImportance(id: string) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, isImportant: !task.isImportant } : task
    );
    saveTasks();
}

function deleteTask(id: string) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const important = tasks.filter(t => t.isImportant).length;
    
    document.getElementById('totalCount')!.textContent = total.toString();
    document.getElementById('completedCount')!.textContent = completed.toString();
    document.getElementById('pendingCount')!.textContent = (total - completed).toString();
    
    const importantCount = document.getElementById('importantCount');
    if (importantCount) {
        importantCount.textContent = important.toString();
    }
    
    if (clearCompletedBtn) {
        clearCompletedBtn.disabled = completed === 0;
    }
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterSelect?.addEventListener('change', renderTasks);
clearCompletedBtn?.addEventListener('click', clearCompleted);

renderTasks();