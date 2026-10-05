import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseVisitorBadgeSvg, getVisitorCount } from '../js/visitor.js';

test('parseVisitorBadgeSvg parses count from combined badge title', () => {
  const svg = '<svg role="img" aria-label="VISITORS: 10 / 25"><title>VISITORS: 10 / 25</title></svg>';
  assert.equal(parseVisitorBadgeSvg(svg), 10);
});

test('parseVisitorBadgeSvg parses single count with commas', () => {
  const svg = '<svg><title>VISITORS: 1,450</title></svg>';
  assert.equal(parseVisitorBadgeSvg(svg), 1450);
});

test('parseVisitorBadgeSvg parses abbreviations K and M', () => {
  const svgK = '<svg><title>VISITORS: 2.5K</title></svg>';
  assert.equal(parseVisitorBadgeSvg(svgK), 2500);

  const svgM = '<svg><title>VISITORS: 1.2M</title></svg>';
  assert.equal(parseVisitorBadgeSvg(svgM), 1200000);
});

test('parseVisitorBadgeSvg returns null on invalid input', () => {
  assert.equal(parseVisitorBadgeSvg(''), null);
  assert.equal(parseVisitorBadgeSvg(null), null);
  assert.equal(parseVisitorBadgeSvg('<svg><title>INVALID</title></svg>'), null);
});

test('getVisitorCount guarantees minimum BASE_COUNT of 4', async () => {
  const count = await getVisitorCount();
  assert.ok(typeof count === 'number');
  assert.ok(count >= 4);
});
