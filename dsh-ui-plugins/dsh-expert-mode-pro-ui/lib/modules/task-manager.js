/**
 * 任务管理模块
 * 功能：任务创建/编辑/删除、状态管理、依赖关系、专家分配
 */

export function createTaskManager({ storage, toast, experts }) {
  const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'blocked'];
  const STATUS_LABELS = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    blocked: '已阻塞'
  };
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
      name: data.name || '新任务',
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
          <button class="emp-btn emp-btn-sm ${currentView === 'list' ? 'emp-btn-primary' : ''}" data-view="list">列表</button>
          <button class="emp-btn emp-btn-sm ${currentView === 'kanban' ? 'emp-btn-primary' : ''}" data-view="kanban">看板</button>
          <button class="emp-btn emp-btn-sm ${currentView === 'dag' ? 'emp-btn-primary' : ''}" data-view="dag">DAG</button>
        </div>
        <div class="emp-flex emp-gap-sm">
          <select class="emp-select" data-filter-status style="width:auto;">
            <option value="all">全部状态</option>
            ${TASK_STATUSES.map(s => `<option value="${s}" ${filterStatus === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`).join('')}
          </select>
          <button class="emp-btn emp-btn-primary emp-btn-sm" data-action="create-task">+ 新建任务</button>
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
          <div class="emp-empty-state-title">暂无任务</div>
          <div class="emp-empty-state-description">点击"新建任务"开始</div>
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
    const expertLabel = task.assignee ? getExpertLabel(task.assignee) : '未分配';

    return `
      <div class="emp-task-item" data-task-id="${task.id}">
        <div class="emp-task-item-header">
          <h4 class="emp-task-item-title">${escapeHtml(task.name)}</h4>
          <span class="emp-task-status emp-task-status-${task.status}">${STATUS_ICONS[task.status]} ${STATUS_LABELS[task.status]}</span>
        </div>
        ${task.description ? `<p class="emp-text-sm emp-text-muted emp-mb-sm">${escapeHtml(task.description)}</p>` : ''}
        <div class="emp-task-item-meta">
          <span class="emp-task-item-meta-item">👤 ${escapeHtml(expertLabel)}</span>
          <span class="emp-task-item-meta-item">📊 ${task.priority === 'high' ? '高' : task.priority === 'low' ? '低' : '中'}优先级</span>
          <span class="emp-task-item-meta-item">🕐 ${formatTime(task.updatedAt)}</span>
        </div>
        ${deps.length > 0 ? `
          <div class="emp-task-dependencies">
            <span class="emp-text-xs emp-text-muted">依赖：</span>
            ${deps.map(d => `<span class="emp-task-dependency-tag">${escapeHtml(d.name)}</span>`).join('')}
          </div>` : ''}
        <div class="emp-task-actions">
          ${task.status !== 'completed' ? `<button class="emp-btn emp-btn-sm" data-action="edit-task" data-task-id="${task.id}">编辑</button>` : ''}
          ${canStartTask(task.id) ? `<button class="emp-btn emp-btn-sm emp-btn-primary" data-action="start-task" data-task-id="${task.id}">开始</button>` : ''}
          ${task.status === 'in_progress' ? `<button class="emp-btn emp-btn-sm emp-btn-primary" data-action="complete-task" data-task-id="${task.id}">完成</button>` : ''}
          <button class="emp-btn emp-btn-sm emp-btn-danger" data-action="delete-task" data-task-id="${task.id}">删除</button>
        </div>
      </div>`;
  }

  function renderKanban(container, tasks) {
    const columns = [
      { status: 'pending', label: '待处理', tasks: tasks.filter(t => t.status === 'pending') },
      { status: 'in_progress', label: '进行中', tasks: tasks.filter(t => t.status === 'in_progress') },
      { status: 'completed', label: '已完成', tasks: tasks.filter(t => t.status === 'completed') }
    ];

    container.innerHTML = `<div class="emp-kanban">
      ${columns.map(col => `
        <div class="emp-kanban-column">
          <div class="emp-kanban-column-header">
            <span>${col.label}</span>
            <span class="emp-kanban-column-count">${col.tasks.length}</span>
          </div>
          ${col.tasks.map(task => `
            <div class="emp-kanban-card" data-task-id="${task.id}">
              <h4 class="emp-kanban-card-title">${escapeHtml(task.name)}</h4>
              <div class="emp-kanban-card-meta">
                <span>${task.assignee ? getExpertLabel(task.assignee) : '未分配'}</span>
                <span>${task.priority === 'high' ? '🔴' : task.priority === 'low' ? '🔵' : '🟡'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>`;

    container.querySelectorAll('.emp-kanban-card').forEach(card => {
      card.addEventListener('click', () => {
        const taskId = card.dataset.taskId;
        showTaskModal(getTaskById(taskId), container.closest('.emp-panel-content'));
      });
    });
  }

  function renderDAG(container, tasks) {
    const order = getDAGOrder();
    if (order.length === 0) {
      container.innerHTML = `<div class="emp-empty-state">
        <div class="emp-empty-state-icon">🔗</div>
        <div class="emp-empty-state-title">暂无任务</div>
      </div>`;
      return;
    }

    container.innerHTML = `<div class="emp-dag">
      ${order.map((task, i) => `
        <div class="emp-dag-node emp-dag-node-${task.status}">
          <span class="emp-status-dot emp-status-dot-${task.status === 'completed' ? 'idle' : task.status === 'in_progress' ? 'busy' : 'offline'}"></span>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px;">${escapeHtml(task.name)}</div>
            <div class="emp-text-xs emp-text-muted">${task.assignee ? getExpertLabel(task.assignee) : '未分配'} · ${STATUS_LABELS[task.status]}</div>
          </div>
          <span class="emp-task-status emp-task-status-${task.status}">${STATUS_LABELS[task.status]}</span>
        </div>
        ${i < order.length - 1 ? '<div class="emp-dag-arrow">↓</div>' : ''}
      `).join('')}
    </div>`;
  }

  function showTaskModal(task, panelContent) {
    editingTask = task;
    const isEdit = !!task;
    const expertOptions = experts ? experts.getAll().map(e =>
      `<option value="${e.id}" ${task?.assignee === e.id ? 'selected' : ''}>${e.name}</option>`
    ).join('') : '';
    const allTasks = getTasks().filter(t => t.id !== task?.id);

    const overlay = document.createElement('div');
    overlay.className = 'emp-modal-overlay';
    overlay.innerHTML = `
      <div class="emp-modal">
        <div class="emp-modal-header">
          <h3 class="emp-modal-title">${isEdit ? '编辑任务' : '新建任务'}</h3>
          <button class="emp-btn-icon" data-action="close-modal">✕</button>
        </div>
        <div class="emp-modal-body">
          <div class="emp-form-group">
            <label class="emp-form-label">任务名称</label>
            <input class="emp-input" name="task-name" value="${escapeHtml(task?.name || '')}" placeholder="输入任务名称">
          </div>
          <div class="emp-form-group">
            <label class="emp-form-label">描述</label>
            <textarea class="emp-textarea" name="task-desc" placeholder="任务描述">${escapeHtml(task?.description || '')}</textarea>
          </div>
          <div class="emp-form-group">
            <label class="emp-form-label">负责人</label>
            <select class="emp-select emp-w-full" name="task-assignee">
              <option value="">未分配</option>
              ${expertOptions}
            </select>
          </div>
          <div class="emp-form-group">
            <label class="emp-form-label">优先级</label>
            <select class="emp-select emp-w-full" name="task-priority">
              <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>低</option>
              <option value="medium" ${(!task || task?.priority === 'medium') ? 'selected' : ''}>中</option>
              <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>高</option>
            </select>
          </div>
          <div class="emp-form-group">
            <label class="emp-form-label">状态</label>
            <select class="emp-select emp-w-full" name="task-status">
              ${TASK_STATUSES.map(s => `<option value="${s}" ${task?.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`).join('')}
            </select>
          </div>
          <div class="emp-form-group">
            <label class="emp-form-label">依赖任务</label>
            <div style="max-height:120px;overflow-y:auto;border:1px solid var(--emp-border-primary);border-radius:var(--emp-radius-md);padding:var(--emp-space-sm);">
              ${allTasks.map(t => `
                <label class="emp-flex emp-items-center emp-gap-sm" style="padding:4px 0;font-size:13px;cursor:pointer;">
                  <input type="checkbox" name="task-dep" value="${t.id}" ${task?.dependencies?.includes(t.id) ? 'checked' : ''}>
                  ${escapeHtml(t.name)}
                </label>
              `).join('') || '<span class="emp-text-sm emp-text-muted">暂无其他任务</span>'}
            </div>
          </div>
        </div>
        <div class="emp-modal-footer">
          <button class="emp-btn" data-action="close-modal">取消</button>
          <button class="emp-btn emp-btn-primary" data-action="save-task">${isEdit ? '保存' : '创建'}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('emp-modal-overlay-active'));

    // 事件
    overlay.querySelector('[data-action="close-modal"]').addEventListener('click', () => closeModal(overlay));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });
    overlay.querySelector('[data-action="save-task"]').addEventListener('click', () => {
      const name = overlay.querySelector('[name="task-name"]').value.trim();
      if (!name) { toast.show('请输入任务名称', 'error'); return; }

      const data = {
        name,
        description: overlay.querySelector('[name="task-desc"]').value.trim(),
        assignee: overlay.querySelector('[name="task-assignee"]').value || null,
        priority: overlay.querySelector('[name="task-priority"]').value,
        status: overlay.querySelector('[name="task-status"]').value,
        dependencies: Array.from(overlay.querySelectorAll('[name="task-dep"]:checked')).map(cb => cb.value)
      };

      if (isEdit) {
        updateTask(task.id, data);
        toast.show('任务已更新', 'success');
      } else {
        createTask(data);
        toast.show('任务已创建', 'success');
      }
      closeModal(overlay);
      // 触发重新渲染
      if (panelContent) {
        const taskContainer = panelContent.querySelector('#emp-task-manager');
        if (taskContainer) renderTaskList(taskContainer);
      }
    });

    // 保存到全局以便外部调用
    window.__empTaskModal = { overlay, closeModal: () => closeModal(overlay) };
  }

  function closeModal(overlay) {
    overlay.classList.remove('emp-modal-overlay-active');
    setTimeout(() => overlay.remove(), 300);
    editingTask = null;
  }

  function bindTaskEvents(container) {
    container.querySelectorAll('[data-action="edit-task"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const task = getTaskById(btn.dataset.taskId);
        if (task) showTaskModal(task, container.closest('.emp-panel-content'));
      });
    });
    container.querySelectorAll('[data-action="start-task"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateTask(btn.dataset.taskId, { status: 'in_progress' });
        toast.show('任务已开始', 'success');
        renderTaskList(container);
      });
    });
    container.querySelectorAll('[data-action="complete-task"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateTask(btn.dataset.taskId, { status: 'completed' });
        toast.show('任务已完成', 'success');
        renderTaskList(container);
      });
    });
    container.querySelectorAll('[data-action="delete-task"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('确定删除此任务？')) {
          deleteTask(btn.dataset.taskId);
          toast.show('任务已删除', 'success');
          renderTaskList(container);
        }
      });
    });
  }

  function getExpertLabel(expertId) {
    if (!expertId) return '未分配';
    const exp = experts?.getAll().find(e => e.id === expertId);
    return exp ? exp.name : expertId;
  }

  return {
    getTasks, createTask, updateTask, deleteTask, getTaskById,
    getTasksByStatus, getTasksByAssignee, getTaskDependencies,
    getDependentTasks, canStartTask, getDAGOrder,
    render: renderTaskList,
    STATUS_LABELS, STATUS_ICONS
  };
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  return d.toLocaleDateString('zh-CN');
}
