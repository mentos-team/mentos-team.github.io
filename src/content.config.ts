/**
 * Content collections — the single source of truth for what a lecture, a course section
 * or a person may contain. Every field is validated at build time, so a typo or a
 * missing required field fails the build with a message naming the file and the field.
 *
 * Where the content lives:
 *   src/data/courses.yaml     the sections of the Course Material page
 *   src/data/lectures.yaml    one entry per published PDF (hosted as a release asset)
 *   src/content/people/<slug>.md (+ <slug>.png)
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import YAML from 'yaml';

/** Markdown files; names starting with "_" (e.g. _README.md) are ignored. */
const MARKDOWN = '**/[^_]*.md';
/** YAML data files are lists of objects, each with its own `id`. */
const yaml = (path: string) => file(path, { parser: (text) => YAML.parse(text) });

/**
 * Sections of the Course Material page. Their ids are the only allowed values of a
 * lecture's `course` field, so a lecture cannot be filed under a section that does not
 * exist — that used to be a silently missing entry on the page.
 */
export const COURSE_IDS = ['os', 'mentos', 'exercises'] as const;
export type CourseId = (typeof COURSE_IDS)[number];

const courses = defineCollection({
  loader: yaml('src/data/courses.yaml'),
  schema: z.object({
    name: z.string().min(1),
    /** One or two sentences introducing the section. */
    summary: z.string().min(1),
    order: z.number().int(),
  }),
});

/**
 * Release tags in mentos-team/mentos-downloads. Restricted to a known list for the same
 * reason as the course ids: a typo here would produce a link that 404s, and nothing on
 * this site can detect that at build time because the asset lives in another repository.
 */
export const RELEASE_TAGS = ['os-course', 'mentos-course'] as const;
export type ReleaseTag = (typeof RELEASE_TAGS)[number];

const lectures = defineCollection({
  loader: yaml('src/data/lectures.yaml'),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    course: z.enum(COURSE_IDS),
    order: z.number().int(),
    /** Release tag the asset is published under. */
    release: z.enum(RELEASE_TAGS),
    /**
     * Asset filename, exactly as uploaded. The download URL is assembled from `release`
     * and this, so it must match the published asset character for character.
     */
    file: z.string().regex(/^[A-Za-z0-9._-]+\.pdf$/, 'must be a PDF filename with no path'),
  }),
});

/**
 * Where a person currently stands in relation to the project. This is deliberately not
 * called "active" or "inactive": `past` records people who contributed and moved on,
 * which is a credit, not a status.
 */
export const STANDINGS = ['maintainer', 'advisor', 'past'] as const;
export type Standing = (typeof STANDINGS)[number];

/*
 * People are credited, not portrayed: there is no `photo` field, by decision.
 *
 * The previous website carried four real portraits and used a clip-art placeholder for
 * everyone else, so two thirds of the roster read as missing rather than as deliberate.
 * Photographs of former students also carry a consent question that a credits list has
 * no need to reopen, and images are the class of asset that made the old repository
 * 29 MB. A name, a role and a GitHub link is the whole of what this page owes someone.
 *
 * If portraits are ever wanted, the decision to reverse is this comment — add
 * `photo: image().optional()` here and a component to render it — but do it for
 * everyone or not at all.
 */
const people = defineCollection({
  loader: glob({ pattern: MARKDOWN, base: './src/content/people' }),
  schema: z.object({
    name: z.string().min(1),
    /** Free text shown next to the name, e.g. "Developer", "Academic advisor". */
    role: z.string().min(1),
    standing: z.enum(STANDINGS),
    /** Order within a standing group. */
    order: z.number().int(),
    /** GitHub username, linked from the person's entry. */
    github: z.string().min(1).optional(),
  }),
});

export const collections = { courses, lectures, people };
