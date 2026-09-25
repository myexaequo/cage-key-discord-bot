import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, OPTIONS, nextStage, isValidMultiChoice } from '../src/questions.js';

test('server language selection is part of onboarding before age', () => {
  assert.equal(STAGES[0], 'language');
  assert.equal(STAGES[1], 'server_languages');
  assert.equal(nextStage('language'), 'server_languages');
  assert.equal(nextStage('server_languages'), 'age');
});

test('server language selection supports one or more known languages', () => {
  assert.deepEqual(OPTIONS.server_languages, ['fr', 'nl', 'en']);
  assert.equal(isValidMultiChoice('server_languages', ['fr']), true);
  assert.equal(isValidMultiChoice('server_languages', ['fr', 'en']), true);
  assert.equal(isValidMultiChoice('server_languages', ['de']), false);
});
