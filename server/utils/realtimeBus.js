const { EventEmitter } = require('events');

const realtimeBus = new EventEmitter();
realtimeBus.setMaxListeners(200);

function emitRealtimeEvent(event) {
  realtimeBus.emit('invoice-event', {
    ...event,
    at: new Date().toISOString(),
  });
}

module.exports = {
  realtimeBus,
  emitRealtimeEvent,
};
