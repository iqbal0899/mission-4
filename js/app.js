function updateClock() {
  const now = new Date();

  // Time: 12-hour with leading zero, AM/PM
  let hours = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, "0");
  const secs = String(now.getSeconds()).padStart(2, "0");
  const hrs = hours >= 24;
  hours = hours % 24 || 12;
  const hStr = String(hours).padStart(2, "0");

  document.getElementById("clock-time").innerHTML =
    `${hStr}:${mins}:<span style="opacity:.65">${secs}</span>`;

  // Date: 01 July 2026
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleDateString("id-ID", { month: "long" });
  const year = now.getFullYear();
  document.getElementById("clock-date").textContent = `${day} ${month} ${year}`;

  // Weekday
  const weekday = now.toLocaleDateString("id-ID", { weekday: "long" });
  document.getElementById("clock-weekday").textContent = weekday;
}

updateClock();
setInterval(updateClock, 1000);

let tasks = JSON.parse(localStorage.getItem("todo-tasks") || "[]");
let filter = "all";
let priorityFilter = "all";
const priorityRank = { high: 0, medium: 1, low: 2 };

function save() {
  localStorage.setItem("todo-tasks", JSON.stringify(tasks));
}

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function render() {
  const list = document.getElementById("task-list");

  let filtered = tasks.filter((t) => {
    if (filter === "active" && t.done) return false;
    if (filter === "done" && !t.done) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  filtered = filtered.slice().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return priorityRank[a.priority] - priorityRank[b.priority];
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-left").textContent = total - done;
  document.getElementById("clear-row").style.display =
    done > 0 ? "flex" : "none";

  if (filtered.length === 0) {
    const msgs = {
      all: { icon: "📋", h: "No tasks yet", p: "Add your first task above." },
      active: {
        icon: "✅",
        h: "All caught up!",
        p: "No active tasks remaining.",
      },
      done: {
        icon: "🎯",
        h: "Nothing completed yet",
        p: "Check off a task to see it here.",
      },
    };
    const m = msgs[filter];
    list.innerHTML = `<div class="empty"><div class="icon">${m.icon}</div><h3>${m.h}</h3><p>${m.p}</p></div>`;
    return;
  }

  list.innerHTML = 
 filtered.map(t => {
  const overdue = isOverdue(t);

  return `
    <div class="task-item ${t.done ? 'done' : ''} ${overdue ? 'overdue-task' : ''}"
         id="task-${t.id}">

      <input type="checkbox"
             class="task-check"
             ${t.done ? 'checked' : ''}
             onchange="toggle('${t.id}')"
             aria-label="Mark done" />

      <div class="task-body">

        <div class="task-text-row">
          <div class="task-text">${escHtml(t.text)}</div>

          <span class="priority-badge ${t.priority}">
            ${t.priority}
          </span>
        </div>

        <div class="task-meta">
          Dibuat: ${fmtDate(t.created)}
        </div>

        <div class="task-due">
          Due: ${t.dueDate}

          ${overdue
            ? '<span class="overdue-badge">OVERDUE</span>'
            : ''
          }
        </div>

      </div>

      <div class="task-actions">
        <button class="btn-icon del"
                onclick="remove('${t.id}')"
                aria-label="Delete task"
                title="Delete">
          Delete
        </button>
      </div>

    </div>
  `;
}).join('');
}

function escHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isOverdue(task) {
  if (!task.done || !task.dueDate) {
    return false;
  }

  const today = new Date();
  const due = new Date(task.dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

function addTask() {
  const input = document.getElementById('task-input');
  const priInput = document.getElementById('priority-input');
  const dueDateInput = document.getElementById('dueDate');

  const text = input.value.trim();
  const dueDate = dueDateInput.value;

  if (!text) {
    input.focus();
    return;
  }

  if (!dueDate) {
    alert('Silakan pilih due date');
    dueDateInput.focus();
    return;
  }

  tasks.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    text,
    done: false,
    created: Date.now(),
    priority: priInput.value,
    dueDate: dueDate
  });

  save();
  render();

  input.value = '';
  dueDateInput.value = '';
  input.focus();
}

function toggle(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) {
    t.done = !t.done;
    save();
    render();
  }
}

function remove(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function clearDone() {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
}

function setFilter(f, btn) {
  filter = f;
  document
    .querySelectorAll(".filters:not(.priority-filters) .filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  render();
}

function setPriorityFilter(p, btn) {
  priorityFilter = p;
  document
    .querySelectorAll(".priority-filters .filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  render();
}

document.getElementById("task-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    addTask();
  }
});

render();
