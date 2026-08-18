# Expert Mode Pro UI

> DSH Expert Mode Pro Web UI Management Panel — Task Management, Expert Monitoring, Cross Review Visualization, Experience Pool

[中文版](README.zh.md) | **English**

## 🚀 Quick Start

### Installation

Copy the plugin directory to DSH plugin path:

```bash
# Copy plugin to DSH plugin directory
cp -r dsh-expert-mode-pro-ui /path/to/dsh-plugins/
```

### Configuration

Add plugin reference in DSH's `cordis.patch.yml`:

```yaml
- insert:
    - id: expert-mode-pro-ui
      name: "@local/dsh-expert-mode-pro-ui"
```

### Launch

After starting DSH Web service, a 🎯 floating button will appear in the bottom right corner. Click to open the management panel.

---

## 📋 Feature Modules

### 1. Task Management

Manage expert team task assignments and execution status.

**Features:**

- **Three Views**: List view, Kanban view, DAG view
- **Task Creation**: Fill in task name, description, priority
- **Task Assignment**: Assign tasks to specific experts
- **Dependency Management**: Set task dependencies, system auto-checks prerequisites
- **Status Flow**: Pending → In Progress → Completed

**Operations:**

1. Click "+ New Task" to create a new task
2. Click "Edit" on task card to modify task
3. Click "Start" to change pending task to in progress
4. Click "Complete" to mark task as completed
5. Switch to "Kanban" view to see task status distribution
6. Switch to "DAG" view to see task dependency relationships

### 2. Expert Monitoring

Real-time monitoring of 11 experts' work status.

**Expert List:**

| Expert | Role | Icon |
|--------|------|------|
| Data Analyst | Ask business → Break down metrics → Find anomalies → Give conclusions | 📊 |
| Copywriter | Define persona → Selling points → Multi-version copy | ✍️ |
| Legal Review | List elements → Mark risks → Give modification suggestions | ⚖️ |
| Product Manager | Requirements clarification → User stories → PRD → Prioritization | 📋 |
| Frontend Dev | Tech selection → Component design → Performance optimization | 💻 |
| UI/UX Design | User flow → Information architecture → Visual specs | 🎨 |
| Architect | Requirements → Architecture selection → Module breakdown → Decisions | 🏗️ |
| Social Media | Platform mix → Content differentiation → Private domain | 📱 |
| Growth Hacker | Funnel breakdown → Growth levers → Experiment design | 📈 |
| Quant Finance | Data → Metrics → Models → Backtesting | 💹 |
| Finance | Data → Report breakdown → Budget attribution → Suggestions | 💰 |

**Status Description:**

- 🟢 **Idle**: Expert available, can accept new tasks
- 🟡 **Busy**: Expert is executing a task
- ⚪ **Offline**: Expert is offline

**Operations:**

1. Click "Wake Up" to set offline expert to idle
2. Click "Offline" to set expert to offline
3. Click "Details" to view expert history and experience
4. Click "Wake All" to batch wake up all experts

### 3. Cross Review

Organize multi-expert cross review to verify high-risk decisions.

**Review Flow:**

1. Create review task, select participating experts
2. Each expert independently outputs review opinions
3. Each expert marks "Agree/Partially Agree/Disagree + Reason"
4. Coordinator synthesizes review opinions for final conclusion

**Review Opinion Types:**

- ✅ **Agree**: Fully认可被评审内容
- ◐ **Partially Agree**: 认可部分内容，有改进建议
- ❌ **Disagree**: 不认可，提出替代方案

**Operations:**

1. Click "+ New Review" to create review task
2. Select experts to participate in review
3. Click "View Details" to see review opinions
4. Add new review opinions in details
5. Click "Mark Complete" to end review

### 4. Experience Pool

View and manage expert team experience lessons.

**Experience Categories:**

- 🔧 **Technical Experience**: Tech selection, implementation solutions, etc.
- 📋 **Process Experience**: Collaboration flow, work methods, etc.
- 🤝 **Collaboration Experience**: Communication, teamwork, etc.
- ⚠️ **Lessons Learned**: Problems encountered and solutions
- ⭐ **Best Practices**: Experience worth promoting

**Operations:**

1. Use search box to search experience (supports title, content, expert name, tags)
2. Click category tags to filter experience types
3. Select expert to filter specific expert experience
4. Click "Export JSON" to export structured data
5. Click "Export MD" to export Markdown document

---

## 🎨 Interface Features

### Dark Mode

- Auto-detect system dark mode preference
- Click 🌓 button to manually toggle
- All components fully support dark mode

### Responsive Design

- **Desktop** (> 1024px): Three-column Kanban layout
- **Tablet** (641px - 1024px): Single column layout
- **Mobile** (≤ 640px): Full-screen panel

### Animation Effects

- Panel open/close: Scale + fade in/out
- Card hover: Lift + shadow enhancement
- Status indicator: Pulse animation (busy state)
- Toast notifications: Slide in/out

---

## 📁 Data Storage

All data stored in browser `localStorage` with key prefix `dsh_emp_`.

**Storage Structure:**

```
dsh_emp_tasks      → Task list
dsh_emp_experts    → Expert status
dsh_emp_reviews    → Review records
dsh_emp_experiences → Experience pool
```

**Data Export:**

Experience pool supports JSON and Markdown export formats.

---

## 🔧 Technical Specifications

- **Implementation**: Pure JavaScript (ES Modules)
- **External Dependencies**: Zero
- **CSS Solution**: Pure CSS + Custom Properties
- **Browser Compatibility**: Chrome 80+, Firefox 78+, Safari 14+, Edge 80+
- **Bundle Size**: < 50KB (including CSS)

---

## 🛠️ Development

### Project Structure

```
dsh-expert-mode-pro-ui/
├── package.json              # Plugin metadata
├── cordis.patch.yml          # DSH integration config
├── DESIGN.md                 # Design document
├── README.md                 # Usage document (English)
├── README.zh.md              # Usage document (Chinese)
└── lib/
    ├── index.js              # Entry file
    ├── client.js             # Client main plugin
    ├── modules/
    │   ├── task-manager.js   # Task management module
    │   ├── expert-monitor.js # Expert monitoring module
    │   ├── review-visualization.js  # Cross review module
    │   └── experience-viewer.js     # Experience pool module
    └── styles/
        └── main.css          # Main stylesheet
```

### Adding New Module

1. Create new module file in `lib/modules/`
2. Implement `create*()` factory function, returning `{ render, ...methods }` object
3. Import and register in `modules` object in `client.js`
4. Add new tab configuration in `TABS` array

### Custom Expert

Modify `EXPERTS` array in `lib/modules/expert-monitor.js`:

```javascript
const EXPERTS = [
  { id: 'your_expert', name: 'Custom Expert', role: 'Role description', icon: '🔧', color: '#3b82f6' },
  // ...
];
```

---

## 📝 License

MIT License