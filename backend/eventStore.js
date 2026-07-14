'use strict';

/**
 * EventStore
 *
 * A tiny in-memory data store for calendar events. It is intentionally
 * framework-free so it can be unit-tested in isolation from Express.
 *
 * An event looks like:
 *   { id, title, date, location, description }
 */
class EventStore {
  constructor(seed = []) {
    this._events = [];
    this._nextId = 1;
    seed.forEach((e) => this.add(e));
  }

  /** Return all events sorted by date ascending, then by title. */
  list() {
    return [...this._events].sort((a, b) => {
      if (a.date === b.date) return a.title.localeCompare(b.title);
      return a.date < b.date ? -1 : 1;
    });
  }

  /** Find a single event by id, or undefined. */
  get(id) {
    return this._events.find((e) => e.id === Number(id));
  }

  /**
   * Add an event. Throws on invalid input.
   * `title` and `date` are required; date must be YYYY-MM-DD.
   */
  add({ title, date, location = '', description = '' } = {}) {
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle) {
      throw new Error('title is required');
    }
    if (!EventStore.isValidDate(date)) {
      throw new Error('date is required and must be in YYYY-MM-DD format');
    }
    const event = {
      id: this._nextId++,
      title: cleanTitle,
      date,
      location: typeof location === 'string' ? location.trim() : '',
      description: typeof description === 'string' ? description.trim() : '',
    };
    this._events.push(event);
    return event;
  }

  /** Remove an event by id. Returns true if something was removed. */
  remove(id) {
    const numId = Number(id);
    const before = this._events.length;
    this._events = this._events.filter((e) => e.id !== numId);
    return this._events.length < before;
  }

  /** Number of stored events. */
  get size() {
    return this._events.length;
  }

  /** Validate a YYYY-MM-DD date string (also rejects impossible dates). */
  static isValidDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }
    const [y, m, d] = date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  }
}

module.exports = EventStore;
