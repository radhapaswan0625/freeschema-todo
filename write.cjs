const fs = require('fs');

const code = `import { init, MakeTheInstanceConcept, DeleteConceptById } from 'mftsccs-browser';

const BACKEND_URL = 'https://boomconsole.com';
const userId = 14297, accessId = 105845437, sessionId = 107818560;
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjE0Mjk3IiwiZW1haWwiOiJyYWRoYXBhc3dhbjA2MjVAZ21haWwuY29tIiwidXBuIjoiMTA1ODQ1NDM3IiwiRW50aXR5SWQiOiIxMDU4NDU0MzgiLCJwcmltYXJ5c2lkIjoiMTA3ODE4NTYwIiwibmJmIjoxNzc5Nzg1NTA5LCJleHAiOjE3ODAzOTAzMDksImlhdCI6MTc3OTc4NTQ0OX0.qKW51XHK78O0DIXtc6W_smc3B4hU_u8nd-3MFLTRJ54';

let tasks = JSON.parse(localStorage.getItem('fs_tasks') || '[]');
let editId = null;
let nid = parseInt(localStorage.getItem('fs_nid') || '1');

function save() {
  localStorage.setItem('fs_tasks', JSON.stringify(tasks));
  localStorage.setItem('fs_nid', String(nid));
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function badge(s) {
  return {'pending':'🕐 Pending','in-progress':'⚡ In Progress','done':'✅ Done'}[s] || s;
}

function render() {
  const c = document.getElementById('task-list');
  if (!c) return;
  if (!tasks.length) {
    c.innerHTML = '<p style="text-align:center;color:#636e72;padding:40px">No tasks yet. Add one above!</p>';
    return;
  }
  c.innerHTML = tasks.map(t => {
    const color = t.status === 'done' ? '#27ae60' : t.status === 'in-progress' ? '#6c63ff' : '#f39c12';
    const bg = t.status === 'done' ? '#e8f8f0' : t.status === 'in-progress' ? '#ede9ff' : '#fef3e2';
    const tc = t.status === 'done' ? '#27ae60' : t.status === 'in-progress' ? '#6c63ff' : '#e67e22';
    if (editId === t.id) {
      return '<div style="background:#fff;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,.08);padding:20px;border-left:4px solid ' + color + '">' +
        '<input id="et' + t.id + '" class="input" value="' + esc(t.title) + '" style="width:100%;padding:10px;border:1.5px solid #dfe6e9;border-radius:8px;margin-bottom:10px;font-size:.95rem">' +
        '<textarea id="ed' + t.id + '" class="input" style="width:100%;padding:10px;border:1.5px solid #dfe6e9;border-radius:8px;margin-bottom:10px;min-height:60px">' + esc(t.description) + '</textarea>' +
        '<select id="es' + t.id + '" style="width:100%;padding:10px;border:1.5px solid #dfe6e9;border-radius:8px;margin-bottom:10px">' +
        '<option value="pending"' + (t.status==='pending'?' selected':'') + '>🕐 Pending</option>' +
        '<option value="in-progress"' + (t.status==='in-progress'?' selected':'') + '>⚡ In Progress</option>' +
        '<option value="done"' + (t.status==='done'?' selected':'') + '>✅ Done</option>' +
        '</select>' +
        '<div style="display:flex;gap:8px">' +
        '<button data-a="save" data-id="' + t.id + '" style="padding:8px 16px;background:#6c63ff;color:#fff;border:none;border-radius:8px;cursor:pointer">💾 Save</button>' +
        '<button data-a="cancel" data-id="' + t.id + '" style="padding:8px 16px;background:#f5f5f5;border:1px solid #ddd;border-radius:8px;cursor:pointer">Cancel</button>' +
        '</div></div>';
    }
    return '<div style="background:#fff;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,.08);padding:20px;border-left:4px solid ' + color + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
      '<h3 style="margin:0;font-size:1rem;color:#2d3436">' + esc(t.title) + '</h3>' +
      '<span style="font-size:.75rem;font-weight:700;padding:4px 10px;border-radius:20px;background:' + bg + ';color:' + tc + '">' + badge(t.status) + '</span>' +
      '</div>' +
      (t.description ? '<p style="color:#636e72;font-size:.9rem;margin-bottom:8px">' + esc(t.description) + '</p>' : '') +
      (t.createdAt ? '<p style="color:#636e72;font-size:.78rem;margin-bottom:12px">Created: ' + new Date(t.createdAt).toLocaleString() + '</p>' : '') +
      '<div style="display:flex;gap:8px">' +
      '<button data-a="edit" data-id="' + t.id + '" style="padding:8px 16px;border:1px solid #ddd;background:#f5f5f5;border-radius:8px;cursor:pointer">✏️ Edit</button>' +
      '<button data-a="delete" data-id="' + t.id + '" style="padding:8px 16px;border:none;background:#e74c3c;color:#fff;border-radius:8px;cursor:pointer">🗑 Delete</button>' +
      '</div></div>';
  }).join('');

  c.querySelectorAll('[data-a]').forEach(b => {
    b.onclick = async () => {
      const a = b.dataset.a, id = Number(b.dataset.id);
      if (a === 'edit') { editId = id; render(); }
      if (a === 'cancel') { editId = null; render(); }
      if (a === 'delete') {
        try { await DeleteConceptById(id); } catch(e) {}
        tasks = tasks.filter(t => t.id !== id);
        save(); render();
      }
      if (a === 'save') {
        const ti = document.getElementById('et'+id);
        const de = document.getElementById('ed'+id);
        const st = document.getElementById('es'+id);
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) tasks[idx] = {...tasks[idx], title: ti.value.trim(), description: de.value.trim(), status: st.value};
        save(); editId = null; render();
      }
    };
  });
}

async function bootstrap() {
  await init(BACKEND_URL, undefined, authToken);
  render();
  document.getElementById('add-task-form').onsubmit = async (e) => {
    e.preventDefault();
    const ti = document.getElementById('task-title');
    const de = document.getElementById('task-desc');
    const st = document.getElementById('task-status');
    const title = ti.value.trim();
    if (!title) return;
    const btn = document.getElementById('add-btn');
    btn.disabled = true; btn.textContent = 'Adding...';
    try {
      const tc = await MakeTheInstanceConcept('the_task', title, true, userId, accessId, sessionId);
      await MakeTheInstanceConcept('the_description', de.value.trim(), true, userId, accessId, sessionId);
      await MakeTheInstanceConcept('the_status', st.value, true, userId, accessId, sessionId);
      const task = { id: (tc && (tc.id || tc.conceptId)) || nid++, title, description: de.value.trim(), status: st.value, createdAt: new Date().toISOString() };
      tasks.push(task);
      save();
      ti.value = ''; de.value = ''; st.value = 'pending';
    } catch(err) { console.error(err); }
    btn.disabled = false; btn.textContent = '+ Add Task';
    render();
  };
}

bootstrap();
`;

fs.writeFileSync('src/main.ts', code);
console.log('Done!');