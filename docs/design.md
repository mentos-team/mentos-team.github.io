# Design system

The visual system is taken from
[esd-univr.github.io](https://github.com/esd-univr/esd-univr.github.io), the CISD
research-group website, which shares an author and a department with this one.
The type scale, spacing scale, rule, radius, motion, container widths, band
alternation and page-opening contract are that site's, unchanged, so the two
read as one family.

Three things differ, all of them recorded in `src/styles/tokens.css`:

1. **The accent is MentOS green, not CISD purple.** It is derived from the hue
   of the project's mark rather than chosen, so the interface and the logo agree.
2. **There are no group hues.** CISD binds a per-research-group accent with
   `[data-group]`. MentOS is one project, so there is nothing for a second hue
   to mean, and the layer is gone rather than repurposed as decoration.
3. **There is a `--brand-*` block.** Three colours sampled from the mark, used
   by exactly one component.

## Everything is a token

`src/styles/tokens.css` is the only place a colour, size or space is written
down. Components read variables; none hard-codes a value. Colour works in three
layers:

1. the light palette (`--light-*`) — real hex values, once
2. the dark palette (`--dark-*`) — real hex values, once
3. the active theme (`--color-*`) — an alias to one of the two

Only layer 3 is switched. Change a colour in layer 1 or 2 and nothing else moves.

## Contrast is tested, not asserted

Every accessible-contrast claim in `tokens.css` is recomputed by
`tests/tokens.test.mjs`: each foreground the site paints against each ground it
can land on, with a 4.5:1 floor. Comments rot; a failing test does not.

This caught a real regression while the palette was being built. An accent
cleared 4.90:1 on `--color-paper` but only **4.45:1** on `--color-paper-2` —
which is the ground every sunken band uses, so it failed on half the page while
looking fine on the other half. The accent was darkened until both grounds
cleared the floor.

**If you change a palette colour, run `npm test`.** If it fails, move the colour
rather than the floor.

## The brand colours are not interface colours

`--brand-green`, `--brand-cream` and `--brand-ground` are the mark's own
colours. The green measures 2.44:1 on light paper: it is not a link, not body
text, and not a heading. One component paints with them — `Console.astro`, which
supplies its own dark ground and so is not bound by the page's contrast floor.

A test asserts that the brand green *fails* AA on paper. That reads oddly on
purpose: it is what makes the restriction real, and if a future palette makes
the brand green accessible the test should be deleted deliberately.

## Colour never carries meaning alone

Anywhere colour marks something — the slogan's emphasised words, a lecture
number, a figure on the home page — the text beside it says the same thing. Read
the page in one tone and nothing is lost. Do not add a colour prop to a
component.

## Dark theme

Resolved before first paint by an inline script in `BaseLayout.astro`, so no
page flashes the wrong palette. With no explicit choice the CSS follows
`prefers-color-scheme`, which means the site themes itself correctly with
JavaScript disabled; the toggle only appears once the script has marked the
document as scripted, because without it the button would do nothing.

MentOS boots onto a dark console, so the dark theme is the project's native
register rather than an inversion of the light one.
