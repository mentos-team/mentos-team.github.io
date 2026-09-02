/**
 * Typed accessors over the content collections. Pages call these rather than
 * `getCollection` directly, so sorting and grouping live in one place and no page can
 * disagree with another about the order things appear in.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../data/site.ts';
import type { CourseId, Standing } from '../content.config.ts';

export type Course = CollectionEntry<'courses'>;
export type Lecture = CollectionEntry<'lectures'>;
export type Person = CollectionEntry<'people'>;

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** Course sections, in the order they should appear on the page. */
export const getCourses = async (): Promise<Course[]> => (await getCollection('courses')).sort(byOrder);

/** All lectures, ordered within their course. */
export const getLectures = async (): Promise<Lecture[]> => (await getCollection('lectures')).sort(byOrder);

/** Lectures belonging to one course section. */
export const getLecturesByCourse = async (course: CourseId): Promise<Lecture[]> =>
  (await getLectures()).filter((lecture) => lecture.data.course === course);

/** Everyone, ordered within their standing group. */
export const getPeople = async (): Promise<Person[]> => (await getCollection('people')).sort(byOrder);

/** People with one standing — maintainers, advisors, or past contributors. */
export const getPeopleByStanding = async (standing: Standing): Promise<Person[]> =>
  (await getPeople()).filter((person) => person.data.standing === standing);

/**
 * Download URL of a lecture's PDF.
 *
 * This is the only place the release-asset URL shape is written down. The files are not
 * in this repository — they are release assets of mentos-team/mentos-downloads — so if
 * GitHub ever changes the shape of a release download URL, this function is the whole
 * fix. See src/data/lectures.yaml for how to publish an asset.
 */
export const lectureUrl = (lecture: Lecture): string =>
  `${site.links.downloads}/releases/download/${lecture.data.release}/${lecture.data.file}`;

/** Human-readable link to the release a lecture belongs to. */
export const releaseUrl = (lecture: Lecture): string =>
  `${site.links.downloads}/releases/tag/${lecture.data.release}`;
