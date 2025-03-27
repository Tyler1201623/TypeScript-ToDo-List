import { deleteTask, toggleTaskCompletion, updateTask } from '@/lib/storage';
import { Task } from '@/types/task';
import { autoAnimate } from '@formkit/auto-animate';
import { formatDistanceToNow } from 'date-fns';

export class TaskCard extends HTMLElement {
  private task: Task;
  
  constructor() {
    super();
    this.task = {} as Task;
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data-task'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'data-task') {
      this.task = JSON.parse(newValue);
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    // Apply animations
    if (this.shadowRoot) {
      autoAnimate(this.shadowRoot);
    }
  }

  private async handleDelete() {
    const confirmDelete = confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      try {
        await deleteTask(this.task.id);
        this.dispatchEvent(new CustomEvent('task-deleted', {
          bubbles: true,
          composed: true,
          detail: { id: this.task.id }
        }));
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  }

  private async handleToggleComplete() {
    try {
      await toggleTaskCompletion(this.task.id);
      this.dispatchEvent(new CustomEvent('task-updated', {
        bubbles: true,
        composed: true,
        detail: { id: this.task.id }
      }));
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  }

  private async handleImportantToggle() {
    try {
      await updateTask({
        ...this.task,
        isImportant: !this.task.isImportant
      });
      this.dispatchEvent(new CustomEvent('task-updated', {
        bubbles: true,
        composed: true,
        detail: { id: this.task.id }
      }));
    } catch (err) {
      console.error('Failed to toggle important status:', err);
    }
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const priorityColorMap = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };

    const priorityClass = this.task.priority ? (priorityColorMap[this.task.priority as keyof typeof priorityColorMap] || '') : '';
    const completedClass = this.task.completed ? 'line-through opacity-70' : '';
    const importantClass = this.task.isImportant ? 'bg-yellow-50 border-yellow-200' : '';

    this.shadowRoot.innerHTML = `
      <style>
        /* Import TailwindCSS via CDN for shadow DOM */
        @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
        
        :host {
          display: block;
          margin-bottom: 1rem;
        }
        
        .card {
          border-radius: 0.5rem;
          padding: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          background-color: white;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .priority-badge {
          font-size: 0.75rem;
          border-radius: 9999px;
          padding: 0.125rem 0.5rem;
          border: 1px solid transparent;
          font-weight: 500;
        }
        
        .checkbox {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
        }
        
        button {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          border: none;
          background-color: #f1f5f9;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #e2e8f0;
        }
        
        .btn-delete {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .btn-delete:hover {
          background-color: #fecaca;
        }
        
        .btn-important {
          background-color: ${this.task.isImportant ? '#fef9c3' : '#f1f5f9'};
          color: ${this.task.isImportant ? '#854d0e' : 'inherit'};
        }
        
        .meta {
          font-size: 0.75rem;
          color: #64748b;
        }
      </style>
      
      <div class="card ${importantClass}">
        <div class="flex items-center mb-2">
          <input 
            type="checkbox" 
            class="checkbox mr-3" 
            id="task-checkbox" 
            ?checked="${this.task.completed}"
          >
          <div>
            <span class="text-lg font-medium ${completedClass}">${this.task.text}</span>
            ${this.task.priority ? `<span class="priority-badge ml-2 ${priorityClass}">${this.task.priority}</span>` : ''}
          </div>
        </div>
        
        ${this.task.dueDate ? `
          <div class="meta mb-2">
            <span class="mr-2">Due: ${this.formatDate(this.task.dueDate)}</span>
          </div>
        ` : ''}
        
        ${this.task.tags && this.task.tags.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-2">
            ${this.task.tags.map(tag => `
              <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">#${tag}</span>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="flex justify-between items-center mt-3">
          <span class="meta">Created ${this.formatDate(this.task.createdAt)}</span>
          
          <div class="flex gap-2">
            <button class="btn-important" id="btn-important">
              ${this.task.isImportant ? 'Unstar' : 'Star'}
            </button>
            <button class="btn-delete" id="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#task-checkbox')?.addEventListener('change', () => this.handleToggleComplete());
    this.shadowRoot.querySelector('#btn-delete')?.addEventListener('click', () => this.handleDelete());
    this.shadowRoot.querySelector('#btn-important')?.addEventListener('click', () => this.handleImportantToggle());
  }
}

customElements.define('task-card', TaskCard); 