const assert = require('assert');
const app = require('../../src/app');

describe('\'hpe\' service', () => {
  it('registered the service', () => {
    const service = app.service('hpe');

    assert.ok(service, 'Registered the service');
  });
});
