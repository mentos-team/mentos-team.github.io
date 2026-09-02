/**
 * Content tests. These read the YAML and Markdown sources directly rather than going
 * through Astro, so they run in milliseconds and fail with a message about the content
 * rather than about a build.
 *
 * What they are for: the content collections already validate shape at build time, so
 * these check the things a Zod schema cannot — that ids referenced from one file exist in
 * another, that nothing is duplicated, and that the release-asset filenames the website
 * links to are still the ones this repository believes in.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import YAML from 'yaml';

const root = path.join(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const yaml = (p) => YAML.parse(read(p));

const courses = yaml('src/data/courses.yaml');
const lectures = yaml('src/data/lectures.yaml');

const PEOPLE_DIR = path.join(root, 'src/content/people');
const people = fs
  .readdirSync(PEOPLE_DIR)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .map((f) => {
    const body = fs.readFileSync(path.join(PEOPLE_DIR, f), 'utf8');
    const match = /^---\n([\s\S]*?)\n---/.exec(body);
    assert.ok(match, `${f}: missing YAML frontmatter`);
    return { file: f, slug: f.replace(/\.md$/, ''), data: YAML.parse(match[1]) };
  });

test('every course id is unique', () => {
  const ids = courses.map((c) => c.id);
  assert.deepEqual(ids, [...new Set(ids)], 'duplicate course id');
});

test('every lecture id is unique', () => {
  const ids = lectures.map((l) => l.id);
  assert.deepEqual(ids, [...new Set(ids)], 'duplicate lecture id');
});

test('every lecture belongs to a course that exists', () => {
  const known = new Set(courses.map((c) => c.id));
  for (const lecture of lectures) {
    assert.ok(known.has(lecture.course), `${lecture.id}: unknown course "${lecture.course}"`);
  }
});

test('every course has at least one lecture', () => {
  for (const course of courses) {
    const count = lectures.filter((l) => l.course === course.id).length;
    assert.ok(count > 0, `course "${course.id}" has no lectures, so it would render as an empty section`);
  }
});

test('lecture order is unique within a course', () => {
  for (const course of courses) {
    const orders = lectures.filter((l) => l.course === course.id).map((l) => l.order);
    assert.deepEqual(orders, [...new Set(orders)], `duplicate order in course "${course.id}"`);
  }
});

test('every lecture points at a distinct release asset', () => {
  const files = lectures.map((l) => `${l.release}/${l.file}`);
  assert.deepEqual(files, [...new Set(files)], 'two lectures link to the same asset');
});

test('every asset filename is a bare PDF name', () => {
  for (const lecture of lectures) {
    assert.match(lecture.file, /^[A-Za-z0-9._-]+\.pdf$/, `${lecture.id}: "${lecture.file}" is not a bare PDF filename`);
  }
});

test('every release tag is one the site knows about', () => {
  // Mirrors RELEASE_TAGS in src/content.config.ts; kept in sync by the test below.
  const known = new Set(['os-course', 'mentos-course']);
  for (const lecture of lectures) {
    assert.ok(known.has(lecture.release), `${lecture.id}: unknown release "${lecture.release}"`);
  }
});

test('the release tags in the test match the ones in the schema', () => {
  const schema = read('src/content.config.ts');
  const match = /export const RELEASE_TAGS = \[([^\]]*)\]/.exec(schema);
  assert.ok(match, 'RELEASE_TAGS not found in src/content.config.ts');
  const tags = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(tags.sort(), ['mentos-course', 'os-course']);
});

test('the course ids in the schema match the data file', () => {
  const schema = read('src/content.config.ts');
  const match = /export const COURSE_IDS = \[([^\]]*)\]/.exec(schema);
  assert.ok(match, 'COURSE_IDS not found in src/content.config.ts');
  const ids = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), courses.map((c) => c.id).sort());
});

test('every person has a name, role, standing and order', () => {
  for (const person of people) {
    assert.ok(person.data.name, `${person.file}: missing name`);
    assert.ok(person.data.role, `${person.file}: missing role`);
    assert.ok(person.data.standing, `${person.file}: missing standing`);
    assert.equal(typeof person.data.order, 'number', `${person.file}: order must be a number`);
  }
});

test('every standing is one the team page renders', () => {
  // A person filed under an unknown standing would silently vanish from the page.
  const known = new Set(['maintainer', 'advisor', 'past']);
  for (const person of people) {
    assert.ok(known.has(person.data.standing), `${person.file}: unknown standing "${person.data.standing}"`);
  }
});

test('order is unique within a standing', () => {
  for (const standing of ['maintainer', 'advisor', 'past']) {
    const orders = people.filter((p) => p.data.standing === standing).map((p) => p.data.order);
    assert.deepEqual(orders, [...new Set(orders)], `duplicate order among ${standing}`);
  }
});

test('no person carries a photo field', () => {
  // Portraits were removed by decision, not by accident — see the comment on the
  // `people` collection in src/content.config.ts. If they come back, they come back for
  // everyone, and this test is the thing to delete deliberately.
  for (const person of people) {
    assert.equal(person.data.photo, undefined, `${person.file}: has a photo field`);
  }
});

test('there is exactly one maintainer', () => {
  const maintainers = people.filter((p) => p.data.standing === 'maintainer');
  assert.equal(maintainers.length, 1, 'the team page reads oddly with zero or several maintainers');
});
