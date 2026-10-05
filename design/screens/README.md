# Design source (readable)

These are the six screens of the approved Sanad design, exported from Claude Design as plain HTML source.
Same version as `design/sanad-design.html` (5 Oct 2026, 07:03). That file is a packed bundle for viewing in a browser; these files are for reading.

| File | Screen |
| --- | --- |
| Main.dc.html | «هوية سند» — the identity board: logo, slogan, colours, type, tree nodes, components, voice |
| Home.dc.html | 1 · Home and search (mobile, 390 px) |
| Tree.dc.html | 2 · Isnad tree (mobile, 390 px) |
| TreeDesktop.dc.html | 2 · Isnad tree (desktop, 1440 px) |
| Paste.dc.html | 3 · Paste an isnad (mobile, 390 px) |
| About.dc.html | 4 · About and method (mobile, 390 px) |
| canvas.json | Board sizes and order |

Notes:
- `<x-dc>`, `<sc-if>`, `<sc-for>`, `{{...}}` and the `class Component` script are Claude Design's own format. Read them as a description of the layout and the interactions; rebuild them as React components.
- `/_blob/84b90d4d...` is the logo. In the app use `public/brand/sanad-mark.svg`.
- All names, counts, pages, dates and percentages in these files are sample content only. Never copy them into `data/`.
