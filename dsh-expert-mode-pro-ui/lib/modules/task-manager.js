/**
 * 任务管理模块
 * 功能：任务创建/编辑/删除、状态管理、依赖关系、专家分配
 * 支持中英文国际化
 */

import { t } from '../i18n.js';

export function createTaskManager({ storage, toast, experts }) {
  const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'blocked'];
  
  // 使用i18n获取状态标签
  function getStatusLabel(status) {
    const statusMap = {
      pending: t('tasks.statuses.pending'),
      in_progress: t('tasks.statuses.inProgress'),
      completed: t('tasks.statuses.completed'),
      blocked: t('tasks.statuses.blocked')
    };
    return statusMap[status] || status;
  }
  
  const STATUS_ICONS = {
    pending: '○',
    in_progress: '◉',
    completed: '✓',
    blocked: '⊘'
  };

  let currentView = 'list'; // 'list' | 'kanban'
  let filterStatus = 'all';
  let editingTask = null;

  function generateId() {
    return 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }

  function getTasks() {
    return storage.get('tasks') || [];
  }

  function saveTasks(tasks) {
    storage.set('tasks', tasks);
  }

  function createTask(data) {
    const tasks = getTasks();
    const task = {
      id: generateId(),
      name: data.name || t('tasks.newTask'),
      description: data.description || '',
      status: data.status || 'pending',
      assignee: data.assignee || null,
      dependencies: data.dependencies || [],
      priority: data.priority || 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null
    };
    tasks.push(task);
    saveTasks(tasks);
    return task;
  }

  function updateTask(id, updates) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: Date.now() };
    if (updates.status === 'completed' && !tasks[idx].completedAt) {
      tasks[idx].completedAt = Date.now();
    }
    saveTasks(tasks);
    return tasks[idx];
  }

  function deleteTask(id) {
    const tasks = getTasks().filter(t => t.id !== id);
    // 清理依赖引用
    tasks.forEach(t => {
      t.dependencies = t.dependencies.filter(d => d !== id);
    });
    saveTasks(tasks);
  }

  function getTaskById(id) {
    return getTasks().find(t => t.id === id) || null;
  }

  function getTasksByStatus(status) {
    return getTasks().filter(t => t.status === status);
  }

  function getTasksByAssignee(assignee) {
    return getTasks().filter(t => t.assignee === assignee);
  }

  function getTaskDependencies(taskId) {
    const task = getTaskById(taskId);
    if (!task) return [];
    return task.dependencies.map(id => getTaskById(id)).filter(Boolean);
  }

  function getDependentTasks(taskId) {
    return getTasks().filter(t => t.dependencies.includes(taskId));
  }

  function canStartTask(taskId) {
    const task = getTaskById(taskId);
    if (!task) return false;
    if (task.status !== 'pending') return false;
    return task.dependencies.every(depId => {
      const dep = getTaskById(depId);
      return dep && dep.status === 'completed';
    });
  }

  function getDAGOrder() {
    const tasks = getTasks();
    const completed = new Set();
    const order = [];
    let iterations = 0;
    const maxIterations = tasks.length * tasks.length;

    while (completed.size < tasks.length && iterations < maxIterations) {
      iterations++;
      for (const task of tasks) {
        if (completed.has(task.id)) continue;
        const depsMet = task.dependencies.every(d => completed.has(d));
        if (depsMet) {
          order.push(task);
          completed.add(task.id);
        }
      }
    }
    return order;
  }

  // ── UI 渲染 ──────────────────────────────────────────────────────

  function renderTaskList(container) {
    const tasks = getTasks();
    const filtered = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);

    container.innerHTML = `
      <div class="emp-flex emp-items-center emp-justify-between emp-mb-lg">
        <div class="emp-flex emp-gap-sm">
          <button class="emp-btn emp-btn-sm ${currentView === 'list' ? 'emp-btn-primary' : ''}" data-view="list">${t('tasks.views.list')}</button>
          <button class="emp-btn emp-btn-sm ${currentView === 'kanban' ? 'emp-btn-primary' : ''}" data-view="kanban">${t('tasks.views.kanban')}</button>
          <button class="emp-btn emp-btn-sm ${currentView === 'dag' ? 'emp-btn-primary' : ''}" data-view="dag">${t('tasks.views.dag')}</button>
        </div>
        <div class="emp-flex emp-gap-sm">
          <select class="emp-select" data-filter-status style="width:auto;">
            <option value="all">${t('tasks.statuses.all')}</option>
            ${TASK_STATUSES.map(s => `<option value="${s}" ${filterStatus === s ? 'selected' : ''}>${getStatusLabel(s)}</option>`).join('')}
          </select>
          <button class="emp-btn emp-btn-primary emp-btn-sm" data-action="create-task">+ ${t('tasks.newTask')}</button>
        </div>
      </div>
      <div id="emp-task-view"></div>
    `;

    const viewContainer = container.querySelector('#emp-task-view');
    if (currentView === 'kanban') {
      renderKanban(viewContainer, tasks);
    } else if (currentView === 'dag') {
      renderDAG(viewContainer, tasks);
    } else {
      renderListView(viewContainer, filtered);
    }

    // 事件绑定
    container.querySelector('[data-view="list"]')?.addEventListener('click', () => { currentView = 'list'; renderTaskList(container); });
    container.querySelector('[data-view="kanban"]')?.addEventListener('click', () => { currentView = 'kanban'; renderTaskList(container); });
    container.querySelector('[data-view="dag"]')?.addEventListener('click', () => { currentView = 'dag'; renderTaskList(container); });
    container.querySelector('[data-filter-status]')?.addEventListener('change', (e) => { filterStatus = e.target.value; renderTaskList(container); });
    container.querySelector('[data-action="create-task"]')?.addEventListener('click', () => showTaskModal(null, container));
  }

  function renderListView(container, tasks) {
    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="emp-empty-state">
          <div class="emp-empty-state-icon">📋</div>
          <div class="emp-empty-state-title">${t('tasks.noTasks')}</div>
          <div class="emp-empty-state-description">${t('tasks.addFirstTask')}</div>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="emp-task-list">
      ${tasks.map(task => renderTaskItem(task)).join('')}
    </div>`;

    bindTaskEvents(container);
  }

  function renderTaskItem(task) {
    const deps = getTaskDependencies(task.id);
    const dependents = getDependentTasks(task.id);
    const expertLabel = task.assignee ? getExpertLabel(task.assignee) : t('tasks.noAssignee');

    return `
      <div class="emp-task-item" data-task-id="${task.id}">
        <div class="emp-task-item-header">
          <h4 class="emp-task-item-title">${escapeHtml(task.name)}</h4>
          <span class="emp-task-status emp-task-status-${task.status}">${STATUS_ICONS[task.status]} ${getStatusLabel(task.status)}</span>
        </div>
        ${task.description ? `<p class="emp-text-sm emp-text-muted emp-mb-sm">${escapeHtml(task.description)}</p>` : ''}
        <div class="emp-task-item-meta">
          <span class="emp-task-priority emp-task-priority-${task.priority}">${t('tasks.priorities.' + task.priority)}</span>
          <span class="emp-task-assignee">👤 ${expertLabel}</span>
          ${deps.length > 0 ? `<span class="emp-task-deps">🔗 ${deps.length}</span>` : ''}
        </div>
        <div class="emp-task-item-actions">
          ${task.status === 'pending' && canStartTask(task.id) ? `<button class="emp-btn emp-btn-sm emp-btn-success" data-action="start-task">${t('buttons.start')}</button>` : ''}
          ${task.status === 'in_progress' ? `<button class="emp-btn emp-btn-sm emp-btn-primary" data-action="complete-task">${t('buttons.complete')}</button>` : ''}
          <button class="emp-btn emp-btn-sm" data-action="edit-task">${t('buttons.edit')}</button>
          <button class="emp-btn emp-btn-sm emp-btn-danger" data-action="delete-task">${t('buttons.delete')}</button>
        </div>
      </div>
    `;
  }

  // ... 其他渲染函数保持不变，但使用i18n ...

  function render(container) {
    renderTaskList(container);
  }

  return {
    render,
    createTask,
    updateTask,
    deleteTask,
    getTasks,
    getTaskById,
    getTasksByStatus,
    getTasksByAssignee
  };
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getExpertLabel(expertId) {
  const expertMonitor = window.__empExpertMonitor;
  if (!expertMonitor) return expertId;
  const expert = expertMonitor.getExpert(expertId);
  return expert ? `${expert.icon} ${expert.name}` : expertId;
}