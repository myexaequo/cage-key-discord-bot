import test from 'node:test';
import assert from 'node:assert/strict';
import { nextStage, isValidChoice, isValidMultiChoice } from '../src/questions.js';

test('questionnaire suit le bon ordre', () => {
  assert.equal(nextStage('language'), 'age');
  assert.equal(nextStage('age'), 'orientation');
  assert.equal(nextStage('orientation'), 'gender');
  assert.equal(nextStage('gender'), 'role');
  assert.equal(nextStage('role'), 'devices');
  assert.equal(nextStage('devices'), 'keys');
  assert.equal(nextStage('keys'), 'kinks');
  assert.equal(nextStage('kinks'), 'summary');
  assert.equal(nextStage('summary'), null);
});

test('la catégorie -18 est reconnue', () => {
  assert.equal(isValidChoice('age', 'under18'), true);
});

test('les réponses multiples sont contrôlées', () => {
  assert.equal(isValidMultiChoice('kinks', ['dom', 'leather']), true);
  assert.equal(isValidMultiChoice('kinks', ['dom', 'invalid']), false);
});
