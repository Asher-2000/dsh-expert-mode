/**
 * Expert Mode Pro UI - 主客户端插件
 * 集成任务管理、专家监控、交叉评审、经验沉淀四大模块
 *
 * 纯JavaScript实现，零依赖，响应式设计，暗色模式支持
 */

import { createTaskManager } from './modules/task-manager.js';
import { createExpertMonitor } from './modules/expert-monitor.js';
import { createReviewVisualization } from './modules/review-visualization.js';
import { createExperienceViewer } from './modules/experience-viewer.js';

// ── CSS 注入 ──────────────────────────────────────────────────────
const CSS_URL = new URL('./styles/main.css', import.meta.url).href;

function injectStyles() {
  if (document.querySelector('link[data-plugin-css="dsh-expert-mode-pro-ui"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  link.dataset.plugin = 'dsh-expert-mode-pro-ui';
  document.head.appendChild(link);
}

// ── 本地存储适配器 ────────────────────────────────────────────────
function createStorage() {
  const PREFIX = 'dsh_emp_';
  return {
    get(key) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch (e) {
        console.error('[ExpertModePro] Storage write failed:', e);
      }
    },
    remove(key) {
      localStorage.removeItem(PREFIX + key);
    }
  };
}

// ── Toast 通知系统 ────────────────────────────────────────────────
function createToast() {
  let container = null;

  function ensureContainer() {
    if (!container || !document.body.contains(container)) {
      container = document.createElement('div');
      container.className = 'emp-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  return {
    show(message, type = 'info', duration = 3000) {
      const c = ensureContainer();
      const toast = document.createElement('div');
      toast.className = `emp-toast emp-toast-${type}`;
      toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button class="emp-btn-icon" style="margin-left:auto;flex:none;">✕</button>`;
      toast.querySelector('.emp-btn-icon').addEventListener('click', () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      });
      c.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };
}

// ── 主面板 UI ─────────────────────────────────────────────────────
const TABS = [
  { id: 'tasks', label: '任务管理', icon: '📋' },
  { id: 'experts', label: '专家监控', icon: '👥' },
  { id: 'reviews', label: '交叉评审', icon: '🔍' },
  { id: 'experience', label: '经验沉淀', icon: '💡' }
];

let activeTab = 'tasks';
let panelVisible = false;
let panelElement = null;

function createMainPanel(storage, toast) {
  const taskManager = createTaskManager({ storage, toast, experts: null });
  const expertMonitor = createExpertMonitor({ storage, toast });
  const reviewViz = createReviewVisualization({ storage, toast });
  const experienceViewer = createExperienceViewer({ storage, toast });

  // 修复循环引用
  taskManager._experts = expertMonitor;
  window.__empExpertMonitor = expertMonitor;

  const modules = {
    tasks: taskManager,
    experts: expertMonitor,
    reviews: reviewViz,
    experience: experienceViewer
  };

  // 创建浮动按钮
  const fab = document.createElement('button');
  fab.className = 'emp-fab';
  fab.innerHTML = '🎯';
  fab.title = 'Expert Mode Pro';
  fab.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: var(--emp-color-primary, #3b82f6);
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    z-index: 9999;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.1)';
    fab.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
  });
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'scale(1)';
    fab.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
  });
  fab.addEventListener('click', togglePanel);
  document.body.appendChild(fab);

  // 创建面板容器
  panelElement = document.createElement('div');
  panelElement.className = 'emp-panel';
  panelElement.style.cssText = `
    position: fixed;
    bottom: 92px;
    right: 24px;
    width: min(720px, calc(100vw - 48px));
    max-height: calc(100vh - 120px);
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: bottom right;
  `;
  panelElement.style.display = 'flex';
  panelElement.style.flexDirection = 'column';
  panelElement.style.overflow = 'hidden';
  document.body.appendChild(panelElement);

  renderPanel();

  function togglePanel() {
    panelVisible = !panelVisible;
    if (panelVisible) {
      panelElement.style.opacity = '1';
      panelElement.style.visibility = 'visible';
      panelElement.style.transform = 'translateY(0) scale(1)';
      renderPanel();
    } else {
      panelElement.style.opacity = '0';
      panelElement.style.visibility = 'hidden';
      panelElement.style.transform = 'translateY(20px) scale(0.95)';
    }
  }

  function renderPanel() {
    panelElement.innerHTML = `
      <div class="emp-panel-header">
        <h2 class="emp-panel-title">🎯 Expert Mode Pro</h2>
        <div class="emp-panel-actions">
          <button class="emp-btn-icon" data-action="toggle-theme" title="切换主题">🌓</button>
          <button class="emp-btn-icon" data-action="refresh" title="刷新">🔄</button>
          <button class="emp-btn-icon" data-action="close-panel" title="关闭">✕</button>
        </div>
      </div>
      <div class="emp-tabs">
        ${TABS.map(tab => `
          <button class="emp-tab ${activeTab === tab.id ? 'emp-tab-active' : ''}" data-tab="${tab.id}">
            ${tab.icon} ${tab.label}
          </button>
        `).join('')}
      </div>
      <div class="emp-panel-content">
        <div id="emp-tab-content"></div>
      </div>
    `;

    // 事件绑定
    panelElement.querySelector('[data-action="close-panel"]')?.addEventListener('click', togglePanel);
    panelElement.querySelector('[data-action="refresh"]')?.addEventListener('click', () => renderPanel());
    panelElement.querySelector('[data-action="toggle-theme"]')?.addEventListener('click', () => {
      document.documentElement.classList.toggle('emp-dark-mode');
    });

    panelElement.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        renderPanel();
      });
    });

    // 渲染当前标签页内容
    const contentEl = panelElement.querySelector('#emp-tab-content');
    if (contentEl && modules[activeTab]) {
      modules[activeTab].render(contentEl);
    }
  }

  return { togglePanel, renderPanel, modules };
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── DSH ModuleLoader 集成 ────────────────────────────────────────
function initPlugin() {
  injectStyles();
  const storage = createStorage();
  const toast = createToast();
  createMainPanel(storage, toast);
  console.log('[ExpertModePro] Plugin initialized');
}

// 等待 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlugin);
} else {
  initPlugin();
}
