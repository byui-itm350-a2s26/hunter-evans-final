'use strict';

const path = require('path');
const express = require('express');
const EventStore = require('./eventStore');

/**
 * Build and return an Express app. A fresh EventStore is created per app so
 * tests get isolated state. A few seed events make the UI non-empty on boot.
 */
function createApp() {
  const app = express();
  const store = new EventStore([
    {
      title: 'Fall Semester Kickoff',
      date: '2026-09-01',
      location: 'Manwaring Center',
      description: 'Welcome event for all students.',
    },
    {
      title: 'ITM 350 Final Presentations',
      date: '2026-07-24',
      location: 'STC 274',
      description: 'DevOps final project demos.',
    },
  ]);

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Health check for load balancers / EC2 probes.
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', events: store.size });
  });

  // List all events.
  app.get('/api/events', (req, res) => {
    res.json(store.list());
  });

  // Create an event.
  app.post('/api/events', (req, res) => {
    try {
      const event = store.add(req.body || {});
      res.status(201).json(event);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete an event by id.
  app.delete('/api/events/:id', (req, res) => {
    const removed = store.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'event not found' });
    }
    res.status(204).end();
  });

  // Expose the store for testing/inspection.
  app.locals.store = store;
  return app;
}

module.exports = createApp;
