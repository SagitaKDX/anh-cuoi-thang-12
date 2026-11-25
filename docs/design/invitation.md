# Wedding invitation design

## Scope

`public/thiep-moi.html` is the canonical invitation. Its styles and interactions live in `public/css/thiep-moi.css` and `public/js/thiep-moi.js`. The planner’s `WeddingInvitePreview` embeds this same page, with desktop and phone preview controls, so the invitation has one implementation. Other planning pages retain their existing behavior.

## Information preserved

- Groom: Lã Tiến Anh. Bride: Đỗ Thị Thanh Thư.
- Wedding: Sunday, 20 December 2026, with guest reception at 17:00 in TP. Hòa Bình (UTC+07:00).
- Schedule: 17:00 reception, 17:30 ceremony and banquet, 18:15 celebration, and 19:30 closing thanks.
- The precise venue address and wedding gift/bank details are pending. The invitation says so explicitly; the map currently points to Hòa Bình rather than an invented venue.
- The love story remains illustrative, and the two existing guestbook messages remain labeled as samples for this preview.

## Visual direction

Warm ivory paper and restrained burgundy set the palette. Cormorant Garamond gives names, dates and headings a literary character; Be Vietnam Pro keeps Vietnamese body text and controls clear. Generous spacing, thin rules, asymmetric photographic composition and varied section layouts replace the earlier repeated cards, strong gradients, lattice patterns and decorative flying graphics.

The opening is a folded paper envelope with a wax-style typographic seal. Its pop-up uses the supplied transparent `couple-cutout.png`, cropped to the subject and optimized as `couple-popup.webp`, as a separate photographic foreground above an ivory mat. The flap, letter, folded paper and photograph move in a finite sequence with small changes in depth and light. Guests can skip the opening or replay it; reduced-motion preferences bypass the animated sequence.

The portrait is the couple’s existing image, not a replacement stock photograph. The pop-up uses the existing cutout, not a newly generated illustration. Decorative and control icons are official downloaded Phosphor thin SVGs with their original paths, not custom-drawn substitutes.

## Preview behavior

The countdown uses `2026-12-20T17:00:00+07:00`. Calendar and map links retain this date and Hòa Bình context. The official YouTube IFrame API prepares I Do (911 ft Đức Phúc) on the cover, with playback starting only when the guest taps open or skip. A floating button pauses or resumes the same player; scrolling and replay do not restart the track. The footer can expand the official player, including a direct YouTube fallback if playback is blocked. No music file is downloaded or redistributed.

RSVP is a local demonstration: attendance and guestbook additions are saved in the current browser’s local storage. Nothing is delivered remotely, emailed to the couple or shared across devices. The form and confirmation message disclose this limitation. A real delivery service must be connected before using the form to collect guests’ responses.

Native dialogs support keyboard use, with clear close/skip controls and focus handling. The invitation is responsive, and the planner preview can show the same page at phone or desktop width.

## Sources and asset provenance

Design guidance used for the redesign:

- [Awesome Design Skills](https://github.com/bergside/awesome-design-skills)
- [Impeccable](https://github.com/pbakaus/impeccable)
- [Hallmark](https://github.com/Nutlope/hallmark)

Asset sources, subsets and licenses are recorded alongside the files:

- [Typography provenance](../../public/fonts/README.md): self-hosted Cormorant Garamond and Be Vietnam Pro from Google Fonts, including Vietnamese subsets and SIL Open Font Licenses.
- [Icon provenance](../../public/icons/README.md): official [Phosphor thin SVGs](https://github.com/phosphor-icons/core/tree/main/assets/thin), downloaded on 25 November 2026, with the MIT license included.

## Validation

Production build and whitespace checks pass. Browser QA covers 320, 390, 768, 1440 and 1920 pixel widths, a short landscape viewport, replay/skip, native-dialog focus and Escape, reduced motion, images and SVG masks, local persistence and safe display of guest-supplied text. The Hallmark sweep has no Floor failures; the larger touch controls, sparse family letter/real guestbook, and envelope fold shading are intentional, recorded exceptions.

## Scroll and photograph interactions

The main printed portrait tilts in actual CSS perspective with passive touch or pointer movement, realistic paper edge, offset shadow and restrained reflected light. It settles on release and stops work offscreen. Scroll motion opens the date plane, lifts story chapters once and draws the event timeline; numerals in the live countdown remain still. The progress rail and all spatial effects respect reduced motion. CSS and JavaScript are isolated in `portrait-depth` and `scroll-moments` modules.
