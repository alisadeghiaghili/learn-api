import assert from 'node:assert/strict';
import { test } from 'node:test';
import { en } from '../js/i18n/en.js';
import { fa } from '../js/i18n/fa.js';
import { LEVELS, getLocalizedLevel } from '../js/levels.js';
import { FA_DIALOGS } from '../js/i18n/fa-dialogs.js';

test('i18n: catalogs have consistent keys', () => {
  assert.equal(en.locale, 'en');
  assert.equal(en.dir, 'ltr');
  assert.equal(fa.locale, 'fa');
  assert.equal(fa.dir, 'rtl');

  const enKeys = Object.keys(en.ui).sort();
  const faKeys = Object.keys(fa.ui).sort();

  assert.deepEqual(enKeys, faKeys, 'en and fa ui keys must match exactly');
});

test('i18n: every level has complete curriculum metadata and Persian translation', () => {
  for (const level of LEVELS) {
    assert.ok(level.id, 'level must have id');
    assert.ok(level.name, `level ${level.id} must have name`);
    assert.ok(level.objective, `level ${level.id} must have objective`);
    assert.ok(Array.isArray(level.learning), `level ${level.id} must have learning array`);
    assert.equal(level.learning.length, 3, `level ${level.id} learning should have 3 items`);
    assert.ok(Array.isArray(level.fieldNotes), `level ${level.id} must have fieldNotes array`);
    assert.equal(level.fieldNotes.length, 3, `level ${level.id} fieldNotes should have 3 items`);

    // Persian translations
    assert.ok(level.fa, `level ${level.id} must have fa localization`);
    assert.ok(level.fa.name, `level ${level.id} must have fa.name`);
    assert.ok(level.fa.objective, `level ${level.id} must have fa.objective`);
    assert.equal(level.fa.learning.length, 3, `level ${level.id} fa.learning must have 3 items`);
    assert.equal(level.fa.fieldNotes.length, 3, `level ${level.id} fa.fieldNotes must have 3 items`);
  }
});

test('i18n: FA_DIALOGS covers levels with startDialog', () => {
  for (const level of LEVELS) {
    if (level.startDialog && level.startDialog.length > 0) {
      assert.ok(FA_DIALOGS[level.id], `FA_DIALOGS must cover level ${level.id}`);
      assert.ok(FA_DIALOGS[level.id].intro, `FA_DIALOGS[${level.id}] must have intro slides`);
    }
  }
});

test('i18n: getLocalizedLevel applies correct locale', () => {
  const level = LEVELS[0];
  const enView = getLocalizedLevel(level, 'en');
  assert.equal(enView.name, level.name);
  assert.equal(enView.objective, level.objective);

  const faView = getLocalizedLevel(level, 'fa');
  assert.equal(faView.name, level.fa.name);
  assert.equal(faView.objective, level.fa.objective);
  assert.deepEqual(faView.learning, level.fa.learning);
  assert.deepEqual(faView.fieldNotes, level.fa.fieldNotes);
});

test('i18n: lesson navigation keys exist and format correctly', () => {
  assert.equal(en.ui.back, 'Back');
  assert.equal(en.ui.next, 'Next');
  assert.equal(en.ui.startLevel, 'Start level');
  assert.equal(en.ui.levelMeta('http-01', 'Test'), 'Level http-01 — Test');

  assert.equal(fa.ui.back, 'قبلی');
  assert.equal(fa.ui.next, 'بعدی');
  assert.equal(fa.ui.startLevel, 'شروع مرحله');
  assert.equal(fa.ui.levelMeta('http-01', 'آزمون'), 'مرحله http-01 — آزمون');
});

