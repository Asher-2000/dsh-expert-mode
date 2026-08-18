/**
 * 专家状态监控模块
 * 功能：11位专家状态显示、当前任务、历史统计、唤醒续聊
 */

export function createExpertMonitor({ storage, toast }) {
  // 11位专家定义
  const EXPERTS = [
    { id: 'expert_data_analyst', name: '数据分析师', role: '先问业务→拆指标→找异常→给结论', icon: '📊', color: '#3b82f6' },
    { id: 'expert_copywriter', name: '文案撰写', role: '先定画像→产多版本→差异化', icon: '✍️', color: '#8b5cf6' },
    { id: 'expert_legal_review', name: '合同/法务', role: '先列要件→标风险→给修改建议', icon: '⚖️', color: '#ef4444' },
    { id: 'expert_product_manager', name: '产品经理', role: '需求澄清→用户故事→PRD→优先级', icon: '📋', color: '#f59e0b' },
    { id: 'expert_frontend_dev', name: '前端开发', role: '技术选型→组件设计→性能优化', icon: '💻', color: '#10b981' },
    { id: 'expert_uiux_design', name: 'UI/UX设计', role: '用户流程→信息架构→视觉规范', icon: '🎨', color: '#ec4899' },
    { id: 'expert_architect', name: '架构师', role: '需求→架构选型→模块拆分→决策', icon: '🏗️', color: '#6366f1' },
    { id: 'expert_social_media', name: '社交运营', role: '平台组合→内容差异化→私域闭环', icon: '📱', color: '#06b6d4' },
    { id: 'expert_growth', name: '增长黑客', role: '漏斗拆解→增长杠杆→实验验证', icon: '📈', color: '#84cc16' },
    { id: 'expert_quant_finance', name: '金融量化', role: '数据→指标→模型→回测', icon: '💹', color: '#f97316' },
    { id: 'expert_finance', name: '财务', role: '数据→报表拆解→预算归因→建议', icon: '💰', color: '#14b8a6' }
  ];

  function getExperts() {
    return storage.get('experts') || EXPERTS.map(e => ({
      ...e,
      status: 'offline',
      currentTask: null,
      stats: { completed: 0, inProgress: 0, total: 0 },
      lastActive: null,
      sessionId: null
    }));
  }

  function saveExperts(data) {
    storage.set('experts', data);
  }

  function updateExpertStatus(id, status, taskId = null) {
    const experts = getExperts();
    const idx = experts.findIndex(e => e.id === id);
    if (idx === -1) return null;
    experts[idx].status = status;
    experts[idx].currentTask = taskId;
    experts[idx].lastActive = Date.now();
    if (status === 'idle' && taskId) {
      experts[idx].stats.completed++;
    }
    saveExperts(experts);
    return experts[idx];
  }

  function wakeExpert(id) {
    const experts = getExperts();
    const idx = experts.findIndex(e => e.id === id);
    if (idx === -1) return null;
    experts[idx].status = 'idle';
    experts[idx].lastActive = Date.now();
    saveExperts(experts);
    return experts[idx];
  }

  function getExpertById(id) {
    return getExperts().find(e => e.id === id) || null;
  }

  function getExpertStats() {
    const experts = getExperts();
    return {
      total: experts.length,
      idle: experts.filter(e => e.status === 'idle').length,
      busy: experts.filter(e => e.status === 'busy').length,
      offline: experts.filter(e => e.status === 'offline').length,
      totalCompleted: experts.reduce((sum, e) => sum + (e.stats?.completed || 0), 0)
    };
  }

  // ── UI 渲染 ──────────────────────────────────────────────────────

  function render(container) {
    const experts = getExperts();
    const stats = getExpertStats();

    container.innerHTML = `
      <div class="emp-flex emp-items-center emp-justify-between emp-mb-lg">
        <div class="emp-flex emp-gap-lg">
          <div class="emp-text-sm">
            <span class="emp-status-dot emp-status-dot-idle"></span>
            空闲: <strong>${stats.idle}</strong>
          </div>
          <div class="emp-text-sm">
            <span class="emp-status-dot emp-status-dot-busy"></span>
            忙碌: <strong>${stats.busy}</strong>
          </div>
          <div class="emp-text-sm">
            <span class="emp-status-dot emp-status-dot-offline"></span>
            离线: <strong>${stats.offline}</strong>
          </div>
        </div>
        <div class="emp-flex emp-gap-sm">
          <button class="emp-btn emp-btn-sm" data-action="wake-all">全部唤醒</button>
          <button class="emp-btn emp-btn-sm" data-action="offline-all">全部离线</button>
        </div>
      </div>
      <div class="emp-expert-grid">
        ${experts.map(expert => renderExpertCard(expert)).join('')}
      </div>
    `;

    // 事件绑定
    container.querySelector('[data-action="wake-all"]')?.addEventListener('click', () => {
      experts.forEach(e => wakeExpert(e.id));
      toast.show('已唤醒所有专家', 'success');
      render(container);
    });
    container.querySelector('[data-action="offline-all"]')?.addEventListener('click', () => {
      experts.forEach(e => updateExpertStatus(e.id, 'offline'));
      toast.show('已将所有专家设为离线', 'success');
      render(container);
    });

    container.querySelectorAll('[data-action="wake-expert"]').forEach(btn => {
      btn.addEventListener('click', () => {
        wakeExpert(btn.dataset.expertId);
        toast.show('专家已唤醒', 'success');
        render(container);
      });
    });

    container.querySelectorAll('[data-action="offline-expert"]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateExpertStatus(btn.dataset.expertId, 'offline');
        toast.show('专家已离线', 'success');
        render(container);
      });
    });

    container.querySelectorAll('[data-action="view-expert"]').forEach(btn => {
      btn.addEventListener('click', () => {
        showExpertDetail(btn.dataset.expertId, container);
      });
    });
  }

  function renderExpertCard(expert) {
    const statusLabel = { idle: '空闲', busy: '忙碌', offline: '离线' }[expert.status] || '离线';
    const tasks = storage.get('tasks') || [];
    const currentTask = expert.currentTask ? tasks.find(t => t.id === expert.currentTask) : null;

    return `
      <div class="emp-expert-card">
        <div class="emp-expert-card-header">
          <div class="emp-expert-avatar" style="background:${expert.color}20;color:${expert.color}">
            ${expert.icon}
          </div>
          <div class="emp-expert-info">
            <h4 class="emp-expert-name">${escapeHtml(expert.name)}</h4>
            <p class="emp-expert-role">${escapeHtml(expert.role)}</p>
          </div>
          <span class="emp-status-badge emp-status-badge-${expert.status}">
            <span class="emp-status-dot emp-status-dot-${expert.status}"></span>
            ${statusLabel}
          </span>
        </div>

        ${currentTask ? `
          <div class="emp-expert-current-task">
            <div class="emp-expert-current-task-label">当前任务</div>
            ${escapeHtml(currentTask.name)}
          </div>` : `
          <div class="emp-expert-current-task emp-text-muted">
            <div class="emp-expert-current-task-label">当前任务</div>
            暂无
          </div>`}

        <div class="emp-expert-stats">
          <div class="emp-expert-stat">
            <div class="emp-expert-stat-value">${expert.stats?.completed || 0}</div>
            <div class="emp-expert-stat-label">已完成</div>
          </div>
          <div class="emp-expert-stat">
            <div class="emp-expert-stat-value">${expert.stats?.inProgress || 0}</div>
            <div class="emp-expert-stat-label">进行中</div>
          </div>
          <div class="emp-expert-stat">
            <div class="emp-expert-stat-value">${expert.stats?.total || 0}</div>
            <div class="emp-expert-stat-label">总计</div>
          </div>
        </div>

        <div class="emp-expert-actions">
          ${expert.status === 'offline' ?
            `<button class="emp-btn emp-btn-sm emp-btn-primary" data-action="wake-expert" data-expert-id="${expert.id}">唤醒</button>` :
            `<button class="emp-btn emp-btn-sm" data-action="offline-expert" data-expert-id="${expert.id}">离线</button>`}
          <button class="emp-btn emp-btn-sm" data-action="view-expert" data-expert-id="${expert.id}">详情</button>
        </div>
      </div>`;
  }

  function showExpertDetail(expertId, container) {
    const expert = getExpertById(expertId);
    if (!expert) return;

    const tasks = (storage.get('tasks') || []).filter(t => t.assignee === expertId);
    const experiences = (storage.get('experiences') || []).filter(e => e.expertId === expertId);

    const overlay = document.createElement('div');
    overlay.className = 'emp-modal-overlay';
    overlay.innerHTML = `
      <div class="emp-modal" style="max-width:640px">
        <div class="emp-modal-header">
          <div class="emp-flex emp-items-center emp-gap-md">
            <div class="emp-expert-avatar" style="background:${expert.color}20;color:${expert.color};width:32px;height:32px;font-size:16px">
              ${expert.icon}
            </div>
            <h3 class="emp-modal-title">${escapeHtml(expert.name)}</h3>
          </div>
          <button class="emp-btn-icon" data-action="close-modal">✕</button>
        </div>
        <div class="emp-modal-body">
          <div class="emp-mb-lg">
            <div class="emp-form-label">角色描述</div>
            <div class="emp-text-sm">${escapeHtml(expert.role)}</div>
          </div>

          <div class="emp-mb-lg">
            <div class="emp-form-label">任务统计</div>
            <div class="emp-chart-bar">
              ${renderExpertTaskChart(tasks)}
            </div>
          </div>

          <div class="emp-mb-lg">
            <div class="emp-form-label">历史任务 (${tasks.length})</div>
            <div style="max-height:200px;overflow-y:auto;">
              ${tasks.length === 0 ? '<div class="emp-text-sm emp-text-muted">暂无任务</div>' :
                tasks.slice(0, 10).map(t => `
                  <div class="emp-flex emp-items-center emp-gap-sm" style="padding:6px 0;border-bottom:1px solid var(--emp-border-primary);">
                    <span class="emp-task-status emp-task-status-${t.status}" style="font-size:11px;">${t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '◉' : '○'}</span>
                    <span class="emp-text-sm" style="flex:1">${escapeHtml(t.name)}</span>
                    <span class="emp-text-xs emp-text-muted">${formatTime(t.updatedAt)}</span>
                  </div>
                `).join('')}
            </div>
          </div>

          <div>
            <div class="emp-form-label">经验教训 (${experiences.length})</div>
            <div style="max-height:150px;overflow-y:auto;">
              ${experiences.length === 0 ? '<div class="emp-text-sm emp-text-muted">暂无经验</div>' :
                experiences.slice(0, 5).map(e => `
                  <div style="padding:6px 0;border-bottom:1px solid var(--emp-border-primary);">
                    <div class="emp-text-sm">${escapeHtml(e.title)}</div>
                    <div class="emp-text-xs emp-text-muted">${formatTime(e.createdAt)}</div>
                  </div>
                `).join('')}
            </div>
          </div>
        </div>
        <div class="emp-modal-footer">
          <button class="emp-btn" data-action="close-modal">关闭</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('emp-modal-overlay-active'));

    overlay.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
      overlay.classList.remove('emp-modal-overlay-active');
      setTimeout(() => overlay.remove(), 300);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('emp-modal-overlay-active');
        setTimeout(() => overlay.remove(), 300);
      }
    });
  }

  function renderExpertTaskChart(tasks) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const max = Math.max(completed, inProgress, pending, 1);

    return `
      <div class="emp-chart-bar-item">
        <div class="emp-chart-bar-value">${completed}</div>
        <div class="emp-chart-bar-fill" style="height:${(completed / max) * 80}px;background:var(--emp-color-success)"></div>
        <div class="emp-chart-bar-label">已完成</div>
      </div>
      <div class="emp-chart-bar-item">
        <div class="emp-chart-bar-value">${inProgress}</div>
        <div class="emp-chart-bar-fill" style="height:${(inProgress / max) * 80}px;background:var(--emp-color-warning)"></div>
        <div class="emp-chart-bar-label">进行中</div>
      </div>
      <div class="emp-chart-bar-item">
        <div class="emp-chart-bar-value">${pending}</div>
        <div class="emp-chart-bar-fill" style="height:${(pending / max) * 80}px;background:var(--emp-color-info)"></div>
        <div class="emp-chart-bar-label">待处理</div>
      </div>`;
  }

  return {
    EXPERTS,
    getExperts, saveExperts, updateExpertStatus, wakeExpert,
    getExpertById, getExpertStats,
    getAll: getExperts,
    render
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
  const diff = Date.now() - ts;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  return new Date(ts).toLocaleDateString('zh-CN');
}
