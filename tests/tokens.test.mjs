/**
 * Contrast tests over the design tokens.
 *
 * The palette in src/styles/tokens.css documents a contrast ratio beside almost every
 * colour. Comments rot; this recomputes them. Every foreground the site paints is
 * checked against every ground it can land on, and the whole suite fails if any pair
 * drops below its floor — so re-paletting the site cannot quietly break legibility.
 *
 * This caught a real regression while the palette was being built: an accent that
 * cleared 4.90:1 on --color-paper but only 4.45:1 on --color-paper-2, which is the
 * ground every sunken band uses.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const css = fs.readFileSync(path.join(import.meta.dirname, '..', 'src/styles/tokens.css'), 'utf8');

/** Read a custom property's literal hex value out of tokens.css. */
const token = (name) => {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css);
  assert.ok(match, `--${name} is not declared as a literal hex value in tokens.css`);
  return match[1];
};

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** WCAG AA for normal-size text. Nothing the site paints as text may fall below this. */
const AA = 4.5;

for (const theme of ['light', 'dark']) {
  const grounds = [`${theme}-paper`, `${theme}-paper-2`];
  const foregrounds = [
    `${theme}-ink`,
    `${theme}-ink-2`,
    `${theme}-ink-3`,
    `${theme}-accent`,
    `${theme}-accent-strong`,
  ];

  for (const fg of foregrounds) {
    for (const bg of grounds) {
      test(`${fg} on ${bg} clears AA`, () => {
        const ratio = contrast(token(fg), token(bg));
        assert.ok(ratio >= AA, `${fg} on ${bg} is ${ratio.toFixed(2)}:1, below ${AA}:1`);
      });
    }
  }

  test(`${theme} focus ring clears AA on both grounds`, () => {
    for (const bg of grounds) {
      const ratio = contrast(token(`${theme}-focus`), token(bg));
      assert.ok(ratio >= AA, `${theme}-focus on ${bg} is ${ratio.toFixed(2)}:1`);
    }
  });

  test(`${theme} ink ramp keeps its steps distinct`, () => {
    // ink / ink-2 / ink-3 are a hierarchy; if two of them converge the hierarchy is
    // decorative rather than real.
    const ramp = [`${theme}-ink`, `${theme}-ink-2`, `${theme}-ink-3`].map((n) => luminance(token(n)));
    for (let i = 1; i < ramp.length; i += 1) {
      assert.ok(
        Math.abs(ramp[i] - ramp[i - 1]) > 0.01,
        `${theme} ink ramp steps ${i - 1} and ${i} are too close to tell apart`,
      );
    }
  });
}

test('the mark reads on its own ground', () => {
  // The one place --brand-* is painted: the console block, on the mark's black.
  const ground = token('brand-ground');
  for (const fg of ['brand-green', 'brand-cream']) {
    const ratio = contrast(token(fg), ground);
    assert.ok(ratio >= AA, `${fg} on brand-ground is ${ratio.toFixed(2)}:1`);
  }
});

test('the mark green is NOT used as interface text', () => {
  /*
   * The brand green is deliberately too light to be body text (2.44:1 on light paper).
   * This asserts the thing that makes that safe: that it fails, and therefore that
   * anything painting text with --brand-green would be a bug. If a future palette makes
   * the brand green accessible, this test should be deleted rather than worked around.
   */
  const ratio = contrast(token('brand-green'), token('light-paper'));
  assert.ok(ratio < AA, `brand-green now clears AA (${ratio.toFixed(2)}:1) — see the note in this test`);
});

test('every colour token is a six-digit hex value', () => {
  // Keeps the palette greppable and keeps this test able to read it. Aliases in the
  // theme blocks are var() references and are skipped.
  const declarations = [...css.matchAll(/--((?:light|dark|brand)-[a-z0-9-]+):\s*([^;]+);/g)];
  assert.ok(declarations.length > 20, 'suspiciously few palette declarations found');
  for (const [, name, value] of declarations) {
    assert.match(value.trim(), /^#[0-9a-f]{6}$/, `--${name} is "${value.trim()}", not a six-digit hex`);
  }
});
