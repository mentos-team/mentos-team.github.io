# Adding or replacing course material

Lecture PDFs are **not** stored in this repository. They are release assets of
[mentos-team/mentos-downloads](https://github.com/mentos-team/mentos-downloads),
and this website links to them.

## Why

The previous version of this website carried every PDF in its own git history.
That turned a few hundred kilobytes of website into a 29 MB repository, and
every re-upload of a lecture added another permanent copy — a git history never
forgets a binary. Release assets do not live in the history, so a slide deck can
be replaced as often as the course needs without the clone growing.

`npm run verify` fails if a PDF, slide deck or archive appears in this
repository, so this cannot be undone by accident.

## Publishing a new lecture

You need the [`gh` CLI](https://cli.github.com/) and push access to the
downloads repository.

1. **Upload the asset** to the release its course belongs to:

   ```bash
   gh release upload mentos-course mentos_8_networking.pdf \
       --repo mentos-team/mentos-downloads
   ```

   The two existing releases are `os-course` (the Operating Systems lectures)
   and `mentos-course` (the MentOS lectures and exercises).

2. **Add an entry** to `src/data/lectures.yaml`:

   ```yaml
   - id: mentos-8-networking
     course: mentos
     order: 8
     title: Networking
     summary: >-
       One or two sentences. This is shown under the title on the Course
       Material page.
     release: mentos-course
     file: mentos_8_networking.pdf
   ```

   `file` must match the uploaded asset name **exactly** — the download URL is
   assembled from `release` and `file`, and nothing in this repository can check
   that the asset exists.

3. **Run the checks** and open a pull request:

   ```bash
   npm run ci
   ```

## Replacing an existing lecture

Upload over it with `--clobber`; the URL does not change, so nothing in this
repository needs editing:

```bash
gh release upload os-course 3_filesystem.pdf --clobber \
    --repo mentos-team/mentos-downloads
```

Keep the filename stable. Renaming an asset breaks every link that has ever been
shared, including the ones in students' notes.

## Adding a new course section

Sections come from `src/data/courses.yaml`, and a lecture's `course` field must
name one of them. Adding a section takes three steps, because the id is
validated in two places:

1. Add the section to `src/data/courses.yaml`.
2. Add its id to `COURSE_IDS` in `src/content.config.ts`.
3. Run `npm test` — one test asserts those two lists agree, so a mismatch is
   caught rather than silently rendering an empty section.

The same applies to a new release tag, which is validated by `RELEASE_TAGS` in
the same file.
