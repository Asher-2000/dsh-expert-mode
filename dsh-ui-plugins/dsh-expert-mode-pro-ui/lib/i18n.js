/**
 * Expert Mode Pro UI - 国际化配置
 * 支持中文(zh)和英文(en)
 */

const translations = {
  zh: {
    // 通用
    appTitle: '专家模式 Pro',
    appSubtitle: '首席协调官 + 11位领域专家',
    
    // 标签页
    tabs: {
      tasks: '任务管理',
      experts: '专家监控',
      reviews: '交叉评审',
      experience: '经验沉淀'
    },
    
    // 按钮
    buttons: {
      new: '新建',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      close: '关闭',
      wakeUp: '唤醒',
      offline: '离线',
      wakeAll: '全部唤醒',
      details: '详情',
      start: '开始',
      complete: '完成',
      exportJson: '导出 JSON',
      exportMd: '导出 MD',
      markComplete: '标记完成',
      viewDetails: '查看详情'
    },
    
    // 任务管理
    tasks: {
      title: '任务管理',
      newTask: '新建任务',
      editTask: '编辑任务',
      taskName: '任务名称',
      taskDescription: '任务描述',
      priority: '优先级',
      assignee: '负责人',
      status: '状态',
      dependencies: '依赖任务',
      priorities: {
        high: '高',
        medium: '中',
        low: '低'
      },
      statuses: {
        pending: '待处理',
        inProgress: '进行中',
        completed: '已完成'
      },
      views: {
        list: '列表',
        kanban: '看板',
        dag: 'DAG'
      },
      noTasks: '暂无任务',
      addFirstTask: '点击「新建任务」创建第一个任务'
    },
    
    // 专家监控
    experts: {
      title: '专家监控',
      expertList: '专家列表',
      status: '状态',
      currentTask: '当前任务',
      historyCount: '历史任务数',
      statuses: {
        idle: '空闲',
        busy: '忙碌',
        offline: '离线'
      },
      noCurrentTask: '无'
    },
    
    // 交叉评审
    reviews: {
      title: '交叉评审',
      newReview: '新建评审',
      reviewTitle: '评审标题',
      reviewDescription: '评审描述',
      participatingExperts: '参与专家',
      opinions: '评审意见',
      addOpinion: '添加意见',
      opinionTypes: {
        agree: '同意',
        partial: '部分同意',
        disagree: '反对'
      },
      noReviews: '暂无评审',
      addFirstReview: '点击「新建评审」创建第一个评审'
    },
    
    // 经验沉淀
    experience: {
      title: '经验沉淀',
      searchPlaceholder: '搜索经验...',
      categories: {
        all: '全部',
        technical: '技术经验',
        process: '流程经验',
        collaboration: '协作经验',
        lessons: '踩坑教训',
        bestPractice: '最佳实践'
      },
      export: '导出',
      noExperience: '暂无经验',
      addFirstExperience: '完成任务后，专家会自动沉淀经验'
    },
    
    // 状态指示器
    statusIndicator: {
      idle: '空闲',
      busy: '忙碌',
      offline: '离线'
    },
    
    // 语言切换
    language: {
      zh: '中文',
      en: 'English'
    },
    
    // 确认对话框
    confirm: {
      deleteTask: '确定要删除这个任务吗？',
      deleteReview: '确定要删除这个评审吗？',
      wakeUpExpert: '确定要唤醒这个专家吗？',
      offlineExpert: '确定要将这个专家设为离线吗？'
    },
    
    // 成功/错误消息
    messages: {
      taskCreated: '任务创建成功',
      taskUpdated: '任务更新成功',
      taskDeleted: '任务删除成功',
      taskStarted: '任务已开始',
      taskCompleted: '任务已完成',
      expertWokenUp: '专家已唤醒',
      expertOffline: '专家已离线',
      allExpertsWokenUp: '所有专家已唤醒',
      reviewCreated: '评审创建成功',
      reviewCompleted: '评审已完成',
      opinionAdded: '意见添加成功',
      exportSuccess: '导出成功',
      languageChanged: '语言已切换'
    }
  },
  
  en: {
    // Common
    appTitle: 'Expert Mode Pro',
    appSubtitle: 'Chief Coordinator + 11 Domain Experts',
    
    // Tabs
    tabs: {
      tasks: 'Tasks',
      experts: 'Experts',
      reviews: 'Reviews',
      experience: 'Experience'
    },
    
    // Buttons
    buttons: {
      new: 'New',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      wakeUp: 'Wake Up',
      offline: 'Offline',
      wakeAll: 'Wake All',
      details: 'Details',
      start: 'Start',
      complete: 'Complete',
      exportJson: 'Export JSON',
      exportMd: 'Export MD',
      markComplete: 'Mark Complete',
      viewDetails: 'View Details'
    },
    
    // Task Management
    tasks: {
      title: 'Task Management',
      newTask: 'New Task',
      editTask: 'Edit Task',
      taskName: 'Task Name',
      taskDescription: 'Task Description',
      priority: 'Priority',
      assignee: 'Assignee',
      status: 'Status',
      dependencies: 'Dependencies',
      priorities: {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      },
      statuses: {
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed'
      },
      views: {
        list: 'List',
        kanban: 'Kanban',
        dag: 'DAG'
      },
      noTasks: 'No tasks yet',
      addFirstTask: 'Click "New Task" to create your first task'
    },
    
    // Expert Monitoring
    experts: {
      title: 'Expert Monitoring',
      expertList: 'Expert List',
      status: 'Status',
      currentTask: 'Current Task',
      historyCount: 'History Count',
      statuses: {
        idle: 'Idle',
        busy: 'Busy',
        offline: 'Offline'
      },
      noCurrentTask: 'None'
    },
    
    // Cross Review
    reviews: {
      title: 'Cross Review',
      newReview: 'New Review',
      reviewTitle: 'Review Title',
      reviewDescription: 'Review Description',
      participatingExperts: 'Participating Experts',
      opinions: 'Review Opinions',
      addOpinion: 'Add Opinion',
      opinionTypes: {
        agree: 'Agree',
        partial: 'Partially Agree',
        disagree: 'Disagree'
      },
      noReviews: 'No reviews yet',
      addFirstReview: 'Click "New Review" to create your first review'
    },
    
    // Experience Pool
    experience: {
      title: 'Experience Pool',
      searchPlaceholder: 'Search experience...',
      categories: {
        all: 'All',
        technical: 'Technical',
        process: 'Process',
        collaboration: 'Collaboration',
        lessons: 'Lessons Learned',
        bestPractice: 'Best Practice'
      },
      export: 'Export',
      noExperience: 'No experience yet',
      addFirstExperience: 'Experts will automatically积累 experience after completing tasks'
    },
    
    // Status Indicator
    statusIndicator: {
      idle: 'Idle',
      busy: 'Busy',
      offline: 'Offline'
    },
    
    // Language Switch
    language: {
      zh: '中文',
      en: 'English'
    },
    
    // Confirm Dialogs
    confirm: {
      deleteTask: 'Are you sure you want to delete this task?',
      deleteReview: 'Are you sure you want to delete this review?',
      wakeUpExpert: 'Are you sure you want to wake up this expert?',
      offlineExpert: 'Are you sure you want to set this expert offline?'
    },
    
    // Success/Error Messages
    messages: {
      taskCreated: 'Task created successfully',
      taskUpdated: 'Task updated successfully',
      taskDeleted: 'Task deleted successfully',
      taskStarted: 'Task started',
      taskCompleted: 'Task completed',
      expertWokenUp: 'Expert woken up',
      expertOffline: 'Expert set to offline',
      allExpertsWokenUp: 'All experts woken up',
      reviewCreated: 'Review created successfully',
      reviewCompleted: 'Review completed',
      opinionAdded: 'Opinion added successfully',
      exportSuccess: 'Export successful',
      languageChanged: 'Language changed'
    }
  }
};

// 语言管理器
let currentLang = localStorage.getItem('dsh_emp_lang') || 'zh';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('dsh_emp_lang', lang);
    return true;
  }
  return false;
}

export function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return value || key;
}

export function getTranslations() {
  return translations[currentLang];
}

export default { getLang, setLang, t, getTranslations };