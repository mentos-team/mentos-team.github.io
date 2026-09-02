/**
 * Site-wide metadata. Edit this file to change the project name, affiliation, headline
 * copy or footer links. Nothing here is generated.
 *
 * The counts in `facts` are the one thing here that can go stale: they describe the
 * MentOS source tree, not this website. tests/content.test.mjs asserts they are present
 * and well-formed, but only a human reading the source can say whether 77 is still 77.
 * Each one records how to re-derive it, so checking takes a single command.
 */
export const site = {
  shortName: 'MentOS',
  name: 'MentOS',
  expandedName: 'Mentoring Operating System',
  /** Used for <title> on the home page and as the Open Graph site name. */
  title: 'MentOS — an educational operating system · University of Verona',
  /** Default meta description (≤ 160 characters). */
  description:
    'MentOS is an open-source educational operating system: a 32-bit Linux-like kernel small enough to read in an afternoon and real enough to teach how an OS works.',
  /** Hero copy on the home page. */
  mission:
    'MentOS is an open-source educational operating system. It is realistic enough to show how a real kernel works — the same data structures and algorithms Linux uses — and small enough that a student can read it, modify it, and see the result boot in seconds.',
  /**
   * Headline figures about the source tree, shown on the home page.
   *
   * Every value was counted on the `develop` branch and each carries the command that
   * re-derives it. They deliberately disagree with the "60+ / 40+ / 60+" figures in the
   * repository README, which are older and rounder than the tree they describe.
   */
  facts: [
    {
      value: '77',
      label: 'system calls',
      /** grep -roP 'sys_call_table\[\K__NR_\w+' kernel/src/system/syscall.c | sort -u | wc -l */
      note: 'handlers actually registered in the dispatch table',
    },
    {
      value: '39',
      label: 'userspace programs',
      /** ls userspace/bin/*.c | wc -l */
      note: 'a shell, the core utilities, and the tools to inspect a running system',
    },
    {
      value: '56',
      label: 'test programs',
      /** ls userspace/tests/*.c | wc -l */
      note: 'run from userspace against the kernel they exercise',
    },
    {
      value: '7',
      label: 'scheduling policies',
      /** grep -oP 'SCHEDULER_\w+' kernel/CMakeLists.txt | sort -u | grep -v TYPE | wc -l */
      note: 'round-robin and priority are implemented; the rest are the exercise',
    },
  ],
  /**
   * What a running MentOS actually shows, for the console block on the home page.
   *
   * Every value here is read off the source tree, and each is a thing that can change
   * without anyone thinking of this website:
   *   version   kernel/inc/version.h (OS_MAJOR/MINOR/MICRO_VERSION)
   *   hostname  filesystem/etc/hostname
   *   motd      filesystem/etc/motd, printed by userspace/bin/login.c after login
   */
  console: {
    version: '0.9.4',
    hostname: 'avalon',
    motd: 'Call `man` to have a list of all the commands.',
  },
  organisation: {
    university: 'University of Verona',
    universityUrl: 'https://www.univr.it/',
    department: 'Department of Engineering for Innovation Medicine',
    departmentUrl: 'https://www.dimi.univr.it/',
    address: ['Strada le Grazie 15', '37134 Verona', 'Italy'],
    /** Link (not an embed) to a map; no third-party iframes are loaded. */
    mapUrl: 'https://www.openstreetmap.org/search?query=Strada%20le%20Grazie%2015%2C%20Verona',
  },
  links: {
    github: 'https://github.com/mentos-team/MentOS',
    organisation: 'https://github.com/mentos-team',
    wiki: 'https://github.com/mentos-team/MentOS/wiki',
    issues: 'https://github.com/mentos-team/MentOS/issues',
    contributors: 'https://github.com/mentos-team/MentOS/graphs/contributors',
    /**
     * Course slides live as release assets in a separate repository, so this one stays a
     * few hundred kilobytes instead of tens of megabytes. See src/data/lectures.yaml for
     * the individual files and docs/course-material.md for how to publish a new one.
     */
    downloads: 'https://github.com/mentos-team/mentos-downloads',
  },
  /** MIT, as declared by LICENSE.md in the source repository. */
  licence: {
    name: 'MIT License',
    url: 'https://github.com/mentos-team/MentOS/blob/develop/LICENSE.md',
    holder: 'MentOS Team',
    since: 2014,
  },
  /**
   * The slogan. The emphasised words are the ones the mark's green picks out; everything
   * else is set in ink. Written as data rather than markup so it is stated once — the
   * home page renders it, and anything else that needs it reads it from here.
   *
   * `accent: true` means "this word carries the accent colour". Colour is never the only
   * carrier of meaning here: the line reads correctly in one tone, and the emphasis is
   * decoration on top of a sentence that already works.
   */
  slogan: [
    [
      { text: 'Learn', accent: true },
      { text: 'the', accent: false },
      { text: 'kernel.', accent: true },
    ],
    [
      { text: 'Understand', accent: true },
      { text: 'the system.', accent: false },
    ],
    [
      { text: 'Shape', accent: true },
      { text: 'it.', accent: false },
    ],
  ],
  /**
   * Brand assets served from public/ and src/assets/.
   *
   * The mark itself is imported directly by the components that draw it (Header.astro and
   * pages/index.astro) so Astro fingerprints it and emits its intrinsic dimensions;
   * replacing the mark means replacing src/assets/logo_mentos.png, not editing this.
   *
   * `ogImage` is still empty: a link preview wants a 1200x630 image with the mark and the
   * name laid out for it, which is a design job rather than a resize of the icon.
   */
  brand: {
    /*
     * 16, 32 and 48 px inside one .ico — 15 KB. Generating it at 256 and 128 as well,
     * which is the obvious recipe, produces a 150 KB file: ImageMagick stores each size
     * as an uncompressed bitmap, so the two large ones are nine tenths of the weight and
     * no browser asks for them for a tab icon.
     *
     *   convert src/assets/logo_mentos.png -define icon:auto-resize=48,32,16 public/favicon.ico
     */
    favicon: '/favicon.ico',
    /** iOS home-screen icon; .ico is ignored there. 180px is the size Apple asks for. */
    touchIcon: '/apple-touch-icon.png',
    ogImage: undefined as string | undefined,
  },
  locale: 'en',
} as const;

export type Site = typeof site;
