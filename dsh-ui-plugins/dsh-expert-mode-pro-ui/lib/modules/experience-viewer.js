/**
 * 经验沉淀查看模块
 * 功能：经验显示、搜索、分类、导出
 */

export function createExperienceViewer({ storage, toast }) {
  const CATEGORIES = [
    { id: 'technical', label: '技术经验', icon: '🔧' },
    { id: 'process', label: '流程经验', icon: '📋' },
    { id: 'communication', label: '协作经验', icon: '🤝' },
    { id: 'lesson', label: '踩坑教训', icon: '⚠️' },
    { id: 'best_practice', label: '最佳实践', icon: '⭐' }
  ];

  let searchQuery = '';
  let filterCategory = 'all';
  let filterExpert = 'all';

  function getExperiences() {
    return storage.get('experiences') || [];
  }

  function saveExperiences(data) {
    storage.set('experiences', data);
  }

  function addExperience(data) {
    const experiences = getExperiences();
    const exp = {
      id: 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      expertId: data.expertId || null,
      expertName: data.expertName || '协调官',
      title: data.title || '',
      content: data.content || '',
      category: data.category || 'lesson',
      tags: data.tags || [],
      taskId: data.taskId || null,
      taskName: data.taskName || null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    experiences.unshift(exp);
    saveExperiences(experiences);
    return exp;
  }

  function updateExperience(id, updates) {
    const experiences = getExperiences();
    const idx = experiences.findIndex(e => e.id === id);
    if (idx === -1) return null;
    experiences[idx] = { ...experiences[idx], ...updates, updatedAt: Date.now() };
    saveExperiences(experiences);
    return experiences[idx];
  }

  function deleteExperience(id) {
    saveExperiences(getExperiences().filter(e => e.id !== id));
  }

  function searchExperiences(query) {
    if (!query) return getExperiences();
    const q = query.toLowerCase();
    return getExperiences().filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.expertName.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  function getExperiencesByCategory(category) {
    if (category === 'all') return getExperiences();
    return getExperiences().filter(e => e.category === category);
  }

  function getExperiencesByExpert(expertId) {
    if (expertId === 'all') return getExperiences();
    return getExperiences().filter(e => e.expertId === expertId);
  }

  function getFilteredExperiences() {
    let results = getExperiences();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.expertName.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filterCategory !== 'all') {
      results = results.filter(e => e.category === filterCategory);
    }

    if (filterExpert !== 'all') {
      results = results.filter(e => e.expertId === filterExpert);
    }

    return results;
  }

  function exportExperiences(format = 'json') {
    const experiences = getFilteredExperiences();
    if (format === 'json') {
      return JSON.stringify(experiences, null, 2);
    }
    // Markdown 导出
    let md = '# 专家经验沉淀\n\n';
    md += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    experiences.forEach(exp => {
      const cat = CATEGORIES.find(c => c.id === exp.category);
      md += `## ${exp.title}\n\n`;
      md += `- 专家: ${exp.expertName}\n`;
      md += `- 分类: ${cat ? cat.label : exp.category}\n`;
      md += `- 时间: ${new Date(exp.createdAt).toLocaleString('zh-CN')}\n`;
      if (exp.taskName) md += `- 关联任务: ${exp.taskName}\n`;
      if (exp.tags.length) md += `- 标签: ${exp.tags.join(', ')}\n`;
      md += `\n${exp.content}\n\n---\n\n`;
    });
    return md;
  }

  function downloadExport(format = 'json') {
    const content = exportExperiences(format);
    const ext = format === 'json' ? 'json' : 'md';
    const mime = format === 'json' ? 'application/json' : 'text/markdown';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expert-experiences.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show(`已导出 ${ext.toUpperCase()} 文件`, 'success');
  }

  // ── UI 渲染 ──────────────────────────────────────────────────────

  function render(container) {
    const experiences = getFilteredExperiences();
    const allExperiences = getExperiences();
    const experts = window.__empExpertMonitor?.EXPERTS || [];

    // 统计分类
    const catStats = {};
    CATEGORIES.forEach(c => { catStats[c.id] = allExperiences.filter(e => e.category === c.id).length; });

    container.innerHTML = `
      <div class="emp-experience-search">
        <input class="emp-input" name="exp-search" placeholder="搜索经验..." value="${escapeHtml(searchQuery)}">
        <button class="emp-btn emp-btn-sm" data-action="export-json">导出 JSON</button>
        <button class="emp-btn emp-btn-sm" data-action="export-md">导出 MD</button>
      </div>

      <div class="emp-experience-filters">
        <button class="emp-filter-chip ${filterCategory === 'all' ? 'emp-filter-chip-active' : ''}" data-filter-category="all">
          全部 (${allExperiences.length})
        </button>
        ${CATEGORIES.map(c => `
          <button class="emp-filter-chip ${filterCategory === c.id ? 'emp-filter-chip-active' : ''}" data-filter-category="${c.id}">
            ${c.icon} ${c.label} (${catStats[c.id] || 0})
          </button>
        `).join('')}
      </div>

      <div class="emp-mb-md">
        <select class="emp-select" name="exp-filter-expert" style="width:auto;">
          <option value="all">所有专家</option>
          ${experts.map(e => `<option value="${e.id}" ${filterExpert === e.id ? 'selected' : ''}>${e.icon} ${e.name}</option>`).join('')}
        </select>
      </div>

      <div class="emp-experience-list">
        ${experiences.length === 0 ? `
          <div class="emp-empty-state">
            <div class="emp-empty-state-icon">💡</div>
            <div class="emp-empty-state-title">暂无经验记录</div>
            <div class="emp-empty-state-description">专家完成任务后会自动沉淀经验</div>
          </div>` :
          experiences.map(exp => renderExperienceItem(exp)).join('')}
      </div>
    `;

    // 事件绑定
    container.querySelector('[name="exp-search"]')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render(container);
    });
    container.querySelector('[name="exp-filter-expert"]')?.addEventListener('change', (e) => {
      filterExpert = e.target.value;
      render(container);
    });
    container.querySelectorAll('[data-filter-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        filterCategory = btn.dataset.filterCategory;
        render(container);
      });
    });
    container.querySelector('[data-action="export-json"]')?.addEventListener('click', () => downloadExport('json'));
    container.querySelector('[data-action="export-md"]')?.addEventListener('click', () => downloadExport('md'));
    container.querySelectorAll('[data-action="delete-exp"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('确定删除此经验记录？')) {
          deleteExperience(btn.dataset.expId);
          toast.show('经验已删除', 'success');
          render(container);
        }
      });
    });
  }

  function renderExperienceItem(exp) {
    const cat = CATEGORIES.find(c => c.id === exp.category);
    const expertMonitor = window.__empExpertMonitor;
    let expertInfo = null;
    if (expertMonitor && exp.expertId) {
      expertInfo = expertMonitor.getExpertById(exp.expertId);
    }

    return `
      <div class="emp-experience-item">
        <div class="emp-experience-item-header">
          <h4 class="emp-experience-item-title">${escapeHtml(exp.title)}</h4>
          <span class="emp-experience-item-category">${cat ? cat.icon + ' ' + cat.label : exp.category}</span>
        </div>
        <div class="emp-experience-item-content">${escapeHtml(exp.content)}</div>
        <div class="emp-experience-item-meta">
          <span>${expertInfo ? expertInfo.icon + ' ' + expertInfo.name : exp.expertName}</span>
          ${exp.taskName ? `<span>📋 ${escapeHtml(exp.taskName)}</span>` : ''}
          <span>${formatTime(exp.createdAt)}</span>
        </div>
        ${exp.tags.length > 0 ? `
          <div class="emp-experience-item-tags">
            ${exp.tags.map(t => `<span class="emp-experience-tag">${escapeHtml(t)}</span>`).join('')}
          </div>` : ''}
        <div class="emp-mt-sm">
          <button class="emp-btn emp-btn-sm emp-btn-danger" data-action="delete-exp" data-exp-id="${exp.id}">删除</button>
        </div>
      </div>`;
  }

  return {
    getExperiences, addExperience, updateExperience, deleteExperience,
    searchExperiences, getExperiencesByCategory, getExperiencesByExpert,
    exportExperiences, downloadExport, CATEGORIES,
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
