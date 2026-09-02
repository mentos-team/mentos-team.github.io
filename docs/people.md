# Adding or editing a person

One Markdown file per person in `src/content/people/`, named after the person's
slug (`enrico-fraccaroli.md`).

```markdown
---
name: Ada Lovelace
role: Developer
standing: past
order: 9
github: adalovelace
---

An optional sentence or two. Most entries have none, and that is fine.
```

| Field | Required | What it does |
| --- | --- | --- |
| `name` | yes | Shown as the entry's heading. |
| `role` | yes | Free text under the name, e.g. `Developer`, `Academic advisor`. |
| `standing` | yes | `maintainer`, `advisor` or `past` — which section the person appears in. |
| `order` | yes | Position within that section. Must be unique per section. |
| `github` | no | Username, linked as `@username`. |

## There are no photographs, on purpose

The `people` collection has no `photo` field. The previous website carried four
real portraits and a clip-art placeholder for everyone else, so two thirds of
the roster read as broken rather than as deliberate. Photographs of former
students also carry a consent question that a credits list has no reason to
reopen, and — the practical objection — a portrait has to be kept current
forever, which nobody will do. A name and a role age gracefully; a photograph
from 2019 does not.

If portraits are ever wanted, add `photo: image().optional()` to the collection
and a component to render it, and delete the `no person carries a photo field`
test in `tests/content.test.mjs` deliberately rather than working around it. Do
it for everyone or not at all.

## Who belongs on this page

The page lists people who shaped the project's direction, and links to
[GitHub's contributor graph](https://github.com/mentos-team/MentOS/graphs/contributors)
for everyone who has sent a fix. That split is intentional: the graph is always
current and never needs editing, so this file does not have to track every
contributor to stay honest.
