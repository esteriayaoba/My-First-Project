document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const list = document.getElementById('todo-list');
    const stats = document.getElementById('task-stats');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
        updateStats();
        updateClearBtn();
    };

    const updateStats = () => {
        const activeCount = todos.filter(t => !t.completed).length;
        stats.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
    };

    const updateClearBtn = () => {
        const hasCompleted = todos.some(t => t.completed);
        clearCompletedBtn.style.display = hasCompleted ? 'block' : 'none';
    };

    const createTodoElement = (todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="checkbox-container">
                <i class="fas fa-check check-icon"></i>
            </div>
            <span class="todo-text">${escapeHTML(todo.text)}</span>
            <button class="btn-delete" aria-label="Delete todo">
                <i class="fas fa-trash"></i>
            </button>
        `;

        const checkbox = li.querySelector('.checkbox-container');
        checkbox.addEventListener('click', () => toggleTodo(todo.id, li));

        const deleteBtn = li.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id, li));

        return li;
    };

    const renderTodos = () => {
        list.innerHTML = '';
        
        let filteredTodos = todos;
        if (currentFilter === 'active') {
            filteredTodos = todos.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(t => t.completed);
        }

        filteredTodos.forEach(todo => {
            list.appendChild(createTodoElement(todo));
        });
        
        updateStats();
        updateClearBtn();
    };

    const addTodo = (text) => {
        const newTodo = {
            id: Date.now().toString(),
            text,
            completed: false
        };
        todos.push(newTodo);
        saveTodos();
        
        if (currentFilter !== 'completed') {
            const el = createTodoElement(newTodo);
            list.appendChild(el);
            // Scroll to bottom smoothly
            setTimeout(() => {
                list.scrollTop = list.scrollHeight;
            }, 50);
        }
    };

    const toggleTodo = (id, liElement) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            saveTodos();
            
            liElement.classList.toggle('completed');
            
            if (currentFilter !== 'all') {
                liElement.classList.add('fall');
                setTimeout(() => {
                    renderTodos();
                }, 400);
            }
        }
    };

    const deleteTodo = (id, liElement) => {
        liElement.classList.add('fall');
        setTimeout(() => {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            renderTodos();
        }, 400);
    };

    const clearCompleted = () => {
        const completedItems = list.querySelectorAll('.todo-item.completed');
        completedItems.forEach(item => item.classList.add('fall'));
        
        setTimeout(() => {
            todos = todos.filter(t => !t.completed);
            saveTodos();
            renderTodos();
        }, 400);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addTodo(text);
            input.value = '';
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Initial render
    renderTodos();

    // Helper to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
