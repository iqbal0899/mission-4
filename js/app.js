let tasks = JSON.parse(localStorage.getItem('todo-tasks') || '[]');
  let filter = 'all';
  let priorityFilter = 'all';
  const priorityRank = { high: 0, medium: 1, low: 2 };
 
  function save() {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }
 
  function fmtDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
 
  function render() {
    const list = document.getElementById('task-list');
    let filtered = tasks.filter(t => {
      if (filter === 'active' && t.done) return false;
      if (filter === 'done' && !t.done) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    });
 
    filtered = filtered.slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return priorityRank[a.priority] - priorityRank[b.priority];
    });
 
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = done;
    document.getElementById('stat-left').textContent = total - done;
    document.getElementById('clear-row').style.display = done > 0 ? 'flex' : 'none';
 
    if (filtered.length === 0) {
      const msgs = {
        all: { icon: '📋', h: 'No tasks yet', p: 'Add your first task above.' },
        active: { icon: '✅', h: 'All caught up!', p: 'No active tasks remaining.' },
        done: { icon: '🎯', h: 'Nothing completed yet', p: 'Check off a task to see it here.' }
      };
      const m = msgs[filter];
      list.innerHTML = `<div class="empty"><div class="icon">${m.icon}</div><h3>${m.h}</h3><p>${m.p}</p></div>`;
      return;
    }
 
    list.innerHTML = filtered.map(t => `
      <div class="task-item ${t.done ? 'done' : ''}" id="task-${t.id}">
        <input type="checkbox" class="task-check" ${t.done ? 'checked' : ''} onchange="toggle('${t.id}')" aria-label="Mark done" />
        <div class="task-body">
          <div class="task-text-row">
            <div class="task-text">${escHtml(t.text)}</div>
            <span class="priority-badge ${t.priority}">${t.priority}</span>
          </div>
          <div class="task-meta">${fmtDate(t.created)}</div>
        </div>
        <div class="task-actions">
          <button class="btn-icon del" onclick="remove('${t.id}')" aria-label="Delete task" title="Delete">Delete</button>
        </div>
      </div>
    `).join('');
  }
 
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
 
  function addTask() {
    const input = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    tasks.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      text,
      done: false,
      created: Date.now(),
      priority: priorityInput.value
    });
    save();
    render();
    input.value = '';
    input.focus();
  }
 
  function toggle(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }
 
  function remove(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }
 
  function clearDone() {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
  }
 
  function setFilter(f, btn) {
    filter = f;
    document.querySelectorAll('.filters:not(.priority-filters) .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  }
 
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
 
  render();