/* global document, fetch */
(function () {
  'use strict';

  const form = document.getElementById('event-form');
  const listEl = document.getElementById('event-list');
  const emptyState = document.getElementById('empty-state');
  const errorEl = document.getElementById('form-error');

  function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  async function loadEvents() {
    const res = await fetch('/api/events');
    const events = await res.json();
    render(events);
  }

  function render(events) {
    listEl.innerHTML = '';
    if (!events.length) {
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    events.forEach((ev) => {
      const li = document.createElement('li');
      li.className = 'event-item';
      li.innerHTML = `
        <div>
          <span class="date-badge">${escapeHtml(formatDate(ev.date))}</span>
          <p class="event-title">${escapeHtml(ev.title)}</p>
          <p class="event-meta">${ev.location ? '📍 ' + escapeHtml(ev.location) : ''}</p>
          ${ev.description ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ''}
        </div>
        <button class="btn btn-danger" data-id="${ev.id}" aria-label="Delete ${escapeHtml(ev.title)}">Delete</button>
      `;
      listEl.appendChild(li);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const payload = {
      title: form.title.value,
      date: form.date.value,
      location: form.location.value,
      description: form.description.value,
    };

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      errorEl.textContent = body.error || 'Could not add event.';
      return;
    }

    form.reset();
    await loadEvents();
  });

  listEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    await fetch(`/api/events/${btn.dataset.id}`, { method: 'DELETE' });
    await loadEvents();
  });

  loadEvents();
})();
