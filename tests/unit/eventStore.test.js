'use strict';

const EventStore = require('../../backend/eventStore');

describe('EventStore (unit)', () => {
  let store;

  beforeEach(() => {
    store = new EventStore();
  });

  test('starts empty', () => {
    expect(store.size).toBe(0);
    expect(store.list()).toEqual([]);
  });

  test('adds a valid event and assigns an incrementing id', () => {
    const a = store.add({ title: 'Event A', date: '2026-01-10' });
    const b = store.add({ title: 'Event B', date: '2026-01-11' });
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
    expect(store.size).toBe(2);
  });

  test('trims whitespace on text fields', () => {
    const ev = store.add({
      title: '  Trim Me  ',
      date: '2026-02-01',
      location: '  Room 1 ',
      description: '  hello ',
    });
    expect(ev.title).toBe('Trim Me');
    expect(ev.location).toBe('Room 1');
    expect(ev.description).toBe('hello');
  });

  test('throws when title is missing or blank', () => {
    expect(() => store.add({ date: '2026-01-10' })).toThrow('title is required');
    expect(() => store.add({ title: '   ', date: '2026-01-10' })).toThrow(
      'title is required'
    );
  });

  test('throws when date is missing or invalid', () => {
    expect(() => store.add({ title: 'No date' })).toThrow(/date is required/);
    expect(() => store.add({ title: 'Bad', date: '01-01-2026' })).toThrow(
      /YYYY-MM-DD/
    );
    expect(() => store.add({ title: 'Impossible', date: '2026-02-30' })).toThrow(
      /YYYY-MM-DD/
    );
  });

  test('list() is sorted by date then title', () => {
    store.add({ title: 'Zebra', date: '2026-05-05' });
    store.add({ title: 'Apple', date: '2026-01-01' });
    store.add({ title: 'Beta', date: '2026-01-01' });
    const titles = store.list().map((e) => e.title);
    expect(titles).toEqual(['Apple', 'Beta', 'Zebra']);
  });

  test('get() returns the matching event or undefined', () => {
    const ev = store.add({ title: 'Findable', date: '2026-03-03' });
    expect(store.get(ev.id).title).toBe('Findable');
    expect(store.get(9999)).toBeUndefined();
  });

  test('remove() deletes an event and reports success', () => {
    const ev = store.add({ title: 'Delete Me', date: '2026-04-04' });
    expect(store.remove(ev.id)).toBe(true);
    expect(store.size).toBe(0);
    expect(store.remove(ev.id)).toBe(false);
  });

  describe('isValidDate', () => {
    test.each([
      ['2026-01-01', true],
      ['2026-12-31', true],
      ['2024-02-29', true],
      ['2026-02-29', false],
      ['2026-13-01', false],
      ['2026-00-10', false],
      ['not-a-date', false],
      ['', false],
      [null, false],
      [20260101, false],
    ])('isValidDate(%p) === %p', (input, expected) => {
      expect(EventStore.isValidDate(input)).toBe(expected);
    });
  });

  test('constructor seeds initial events', () => {
    const seeded = new EventStore([
      { title: 'Seed 1', date: '2026-06-01' },
      { title: 'Seed 2', date: '2026-06-02' },
    ]);
    expect(seeded.size).toBe(2);
  });
});
