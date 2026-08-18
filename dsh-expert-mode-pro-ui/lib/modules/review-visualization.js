/**
 * 交叉评审可视化模块
 * 功能：评审任务显示、参与专家、意见对比、评审记录
 */

export function createReviewVisualization({ storage, toast }) {
  const VERDICT_LABELS = {
    agree: '同意',
    partial: '部分同意',
    disagree: '反对'
  };
  const VERDICT_ICONS = {
    agree: '✓',
    partial: '◐',
    disagree: '✗'
  };

  function getReviews() {
    return storage.get('reviews') || [];
  }

  function saveReviews(data) {
    storage.set('reviews', data);
  }

  function createReview(data) {
    const reviews = getReviews();
    const review = {
      id: 'review_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      title: data.title || '评审任务',
      description: data.description || '',
      participants: data.participants || [],
      opinions: data.opinions || [],
      conclusion: data.conclusion || '',
      status: data.status || 'in_progress', // in_progress | completed
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null
    };
    reviews.push(review);
    saveReviews(reviews);
    return review;
  }

  function updateReview(id, updates) {
    const reviews = getReviews();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return null;
    reviews[idx] = { ...reviews[idx], ...updates, updatedAt: Date.now() };
    if (updates.status === 'completed') {
      reviews[idx].completedAt = Date.now();
    }
    saveReviews(reviews);
    return reviews[idx];
  }

  function deleteReview(id) {
    saveReviews(getReviews().filter(r => r.id !== id));
  }

  function addOpinion(reviewId, opinion) {
    const reviews = getReviews();
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) return null;
    reviews[idx].opinions.push({
      id: 'op_' + Date.now().toString(36),
      author: opinion.author,
      verdict: opinion.verdict, // agree | partial | disagree
      content: opinion.content,
      createdAt: Date.now()
    });
    reviews[idx].updatedAt = Date.now();
    saveReviews(reviews);
    return reviews[idx];
  }

  function getReviewById(id) {
    return getReviews().find(r => r.id === id) || null;
  }

  function getReviewStats() {
    const reviews = getReviews();
    return {
      total: reviews.length,
      inProgress: reviews.filter(r => r.status === 'in_progress').length,
      completed: reviews.filter(r => r.status === 'completed').length,
      totalOpinions: reviews.reduce((sum, r) => sum + r.opinions.length, 0)
    };
  }

  // ── UI 渲染 ──────────────────────────────────────────────────────

  function render(container) {
    const reviews = getReviews();
    const stats = getReviewStats();

    container.innerHTML = `
      <div class="emp-flex emp-items-center emp-justify-between emp-mb-lg">
        <div class="emp-flex emp-gap-lg">
          <div class="emp-text-sm">评审总数: <strong>${stats.total}</strong></div>
          <div class="emp-text-sm">进行中: <strong>${stats.inProgress}</strong></div>
          <div class="emp-text-sm">已完成: <strong>${stats.completed}</strong></div>
          <div class="emp-text-sm">评审意见: <strong>${stats.totalOpinions}</strong></div>
        </div>
        <button class="emp-btn emp-btn-primary emp-btn-sm" data-action="create-review">+ 新建评审</button>
      </div>

      <div class="emp-experience-list">
        ${reviews.length === 0 ? `
          <div class="emp-empty-state">
            <div class="emp-empty-state-icon">🔍</div>
            <div class="emp-empty-state-title">暂无评审记录</div>
            <div class="emp-empty-state-description">点击"新建评审"开始交叉评审</div>
          </div>` :
          reviews.map(review => renderReviewCard(review)).join('')}
      </div>
    `;

    // 事件绑定
    container.querySelector('[data-action="create-review"]')?.addEventListener('click', () => showReviewModal(null, container));
    container.querySelectorAll('[data-action="view-review"]').forEach(btn => {
      btn.addEventListener('click', () => showReviewDetail(btn.dataset.reviewId, container));
    });
    container.querySelectorAll('[data-action="delete-review"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('确定删除此评审记录？')) {
          deleteReview(btn.dataset.reviewId);
          toast.show('评审已删除', 'success');
          render(container);
        }
      });
    });
    container.querySelectorAll('[data-action="complete-review"]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateReview(btn.dataset.reviewId, { status: 'completed' });
        toast.show('评审已标记完成', 'success');
        render(container);
      });
    });
  }

  function renderReviewCard(review) {
    const expertMonitor = window.__empExpertMonitor;
    const getExpertName = (id) => {
      if (!expertMonitor) return id;
      const e = expertMonitor.getExpertById(id);
      return e ? e.name : id;
    };

    // 统计意见
    const opinionStats = { agree: 0, partial: 0, disagree: 0 };
    review.opinions.forEach(op => { opinionStats[op.verdict] = (opinionStats[op.verdict] || 0) + 1; });

    return `
      <div class="emp-review-card">
        <div class="emp-review-header">
          <div>
            <h3 class="emp-review-title">${escapeHtml(review.title)}</h3>
            ${review.description ? `<p class="emp-text-sm emp-text-muted emp-mt-sm">${escapeHtml(review.description)}</p>` : ''}
            <div class="emp-review-participants emp-mt-sm">
              ${review.participants.map(p => `
                <span class="emp-review-participant">${getExpertName(p)}</span>
              `).join('')}
            </div>
          </div>
          <div class="emp-flex emp-gap-sm emp-items-center">
            <span class="emp-task-status emp-task-status-${review.status === 'completed' ? 'completed' : 'in_progress'}">
              ${review.status === 'completed' ? '已完成' : '进行中'}
            </span>
          </div>
        </div>

        <div class="emp-flex emp-gap-md emp-mb-lg">
          <span class="emp-status-badge emp-status-badge-idle">同意 ${opinionStats.agree}</span>
          <span class="emp-status-badge emp-status-badge-busy">部分同意 ${opinionStats.partial}</span>
          <span class="emp-status-badge emp-status-badge-offline">反对 ${opinionStats.disagree}</span>
        </div>

        <div class="emp-card-footer">
          <button class="emp-btn emp-btn-sm" data-action="view-review" data-review-id="${review.id}">查看详情</button>
          ${review.status === 'in_progress' ? `<button class="emp-btn emp-btn-sm emp-btn-primary" data-action="complete-review" data-review-id="${review.id}">标记完成</button>` : ''}
          <button class="emp-btn emp-btn-sm emp-btn-danger" data-action="delete-review" data-review-id="${review.id}">删除</button>
        </div>
      </div>`;
  }

  function showReviewModal(review, container) {
    const isEdit = !!review;
    const experts = window.__empExpertMonitor?.EXPERTS || [];

    const overlay = document.createElement('div');
    overlay.className = 'emp-modal-overlay';
    overlay.innerHTML = `
      <div class="emp-modal">
        <div class="emp-modal-header">
          <h3 class="emp-modal-title">${isEdit ? '编辑评审' : '新建评审'}</h3>
          <button class="emp-btn-icon" data-action="close-modal">✕</button>
        </div>
        <div class="emp-modal-body">
          <div class="emp-form-group">
            <label class="emp-form-label">评审标题</label>
            <input class="emp-input" name="review-title" value="${escapeHtml(review?.title || '')}" placeholder="输入评审标题">
          </div>
          <div class="emp-form-group">
            <label class="emp-form-label">评审说明</label>
            <textarea class="emp-textarea" name="review-desc" placeholder="评审背景和目的">${escapeHtml(review?.description || '')}</textarea>
          </div>
          <div class="emp-form-group">
            <label class="emp-form-label">参与专家</label>
            <div style="max-height:160px;overflow-y:auto;border:1px solid var(--emp-border-primary);border-radius:var(--emp-radius-md);padding:var(--emp-space-sm);">
              ${experts.map(e => `
                <label class="emp-flex emp-items-center emp-gap-sm" style="padding:4px 0;font-size:13px;cursor:pointer;">
                  <input type="checkbox" name="review-participant" value="${e.id}" ${review?.participants?.includes(e.id) ? 'checked' : ''}>
                  ${e.icon} ${escapeHtml(e.name)}
                </label>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="emp-modal-footer">
          <button class="emp-btn" data-action="close-modal">取消</button>
          <button class="emp-btn emp-btn-primary" data-action="save-review">${isEdit ? '保存' : '创建'}</button>
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
    overlay.querySelector('[data-action="save-review"]').addEventListener('click', () => {
      const title = overlay.querySelector('[name="review-title"]').value.trim();
      if (!title) { toast.show('请输入评审标题', 'error'); return; }
      const data = {
        title,
        description: overlay.querySelector('[name="review-desc"]').value.trim(),
        participants: Array.from(overlay.querySelectorAll('[name="review-participant"]:checked')).map(cb => cb.value)
      };
      if (isEdit) {
        updateReview(review.id, data);
        toast.show('评审已更新', 'success');
      } else {
        createReview(data);
        toast.show('评审已创建', 'success');
      }
      overlay.classList.remove('emp-modal-overlay-active');
      setTimeout(() => overlay.remove(), 300);
      render(container);
    });
  }

  function showReviewDetail(reviewId, container) {
    const review = getReviewById(reviewId);
    if (!review) return;

    const expertMonitor = window.__empExpertMonitor;
    const getExpertName = (id) => {
      if (!expertMonitor) return id;
      const e = expertMonitor.getExpertById(id);
      return e ? `${e.icon} ${e.name}` : id;
    };

    const overlay = document.createElement('div');
    overlay.className = 'emp-modal-overlay';
    overlay.innerHTML = `
      <div class="emp-modal" style="max-width:720px">
        <div class="emp-modal-header">
          <div>
            <h3 class="emp-modal-title">${escapeHtml(review.title)}</h3>
            <div class="emp-review-participants emp-mt-sm">
              ${review.participants.map(p => `<span class="emp-review-participant">${getExpertName(p)}</span>`).join('')}
            </div>
          </div>
          <button class="emp-btn-icon" data-action="close-modal">✕</button>
        </div>
        <div class="emp-modal-body">
          ${review.description ? `<div class="emp-mb-lg"><div class="emp-text-sm">${escapeHtml(review.description)}</div></div>` : ''}

          <div class="emp-mb-lg">
            <div class="emp-form-label">评审意见 (${review.opinions.length})</div>
            ${review.opinions.length === 0 ? '<div class="emp-text-sm emp-text-muted">暂无评审意见</div>' : `
              <div class="emp-review-opinions">
                ${review.opinions.map(op => `
                  <div class="emp-review-opinion emp-review-opinion-${op.verdict}">
                    <div class="emp-review-opinion-header">
                      <span class="emp-review-opinion-author">${getExpertName(op.author)}</span>
                      <span class="emp-review-opinion-verdict emp-review-opinion-verdict-${op.verdict}">
                        ${VERDICT_ICONS[op.verdict]} ${VERDICT_LABELS[op.verdict]}
                      </span>
                    </div>
                    <div class="emp-review-opinion-content">${escapeHtml(op.content)}</div>
                  </div>
                `).join('')}
              </div>`}
          </div>

          ${review.conclusion ? `
            <div class="emp-review-conclusion">
              <div class="emp-review-conclusion-title">最终结论</div>
              <div class="emp-review-conclusion-content">${escapeHtml(review.conclusion)}</div>
            </div>` : ''}

          <div class="emp-mt-lg">
            <div class="emp-form-label">添加评审意见</div>
            <div class="emp-form-group">
              <select class="emp-select emp-w-full" name="opinion-author">
                <option value="">选择专家</option>
                ${review.participants.map(p => `<option value="${p}">${getExpertName(p)}</option>`).join('')}
              </select>
            </div>
            <div class="emp-form-group">
              <select class="emp-select emp-w-full" name="opinion-verdict">
                <option value="agree">同意</option>
                <option value="partial">部分同意</option>
                <option value="disagree">反对</option>
              </select>
            </div>
            <div class="emp-form-group">
              <textarea class="emp-textarea" name="opinion-content" placeholder="输入评审意见..."></textarea>
            </div>
            <button class="emp-btn emp-btn-primary emp-btn-sm" data-action="add-opinion">提交意见</button>
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
    overlay.querySelector('[data-action="add-opinion"]').addEventListener('click', () => {
      const author = overlay.querySelector('[name="opinion-author"]').value;
      const verdict = overlay.querySelector('[name="opinion-verdict"]').value;
      const content = overlay.querySelector('[name="opinion-content"]').value.trim();
      if (!author || !content) { toast.show('请选择专家并输入意见', 'error'); return; }
      addOpinion(reviewId, { author, verdict, content });
      toast.show('意见已提交', 'success');
      overlay.classList.remove('emp-modal-overlay-active');
      setTimeout(() => overlay.remove(), 300);
      render(container);
    });
  }

  return {
    getReviews, createReview, updateReview, deleteReview, addOpinion,
    getReviewById, getReviewStats,
    VERDICT_LABELS, VERDICT_ICONS,
    render
  };
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
