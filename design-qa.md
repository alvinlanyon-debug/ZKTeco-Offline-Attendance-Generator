# Homepage video and feature showcase QA

## Latest refinement

- [x] Replaced the old feature screenshots with six user-provided fictional-data screenshots, cropped to the application window.
- [x] Added accessible feature tabs for staff classification, analysis settings, guard compliance, timetables, report summaries, and exceptions.
- [x] Matched the hero headline weight to Zen’s normal-weight headline, widened the desktop video frame, and applied Zen’s dark palette to the feature chapter.
- [x] Unified the section inset at desktop, tablet, and mobile sizes without changing the workflow section’s content.
- [x] Visually checked each cropped image and corrected the mapping between analysis settings and the hourly-compliance table.
- [ ] Capture the changed homepage at desktop and mobile sizes; the local-page browser policy still prevents that rendered check.

**Findings**

- [Blocked] Rendered comparison and video timing review could not be completed.
  Location: `app/index.html` hero and `app/index.html#features`.
  Evidence: The source visual direction is Zen Browser's [published Features component](https://github.com/zen-browser/www/blob/main/src/components/Features.astro) and [Video component](https://github.com/zen-browser/www/blob/main/src/components/Video.astro); AtGen's product screenshots are in `app/assets/features/`. The in-app browser rejected the local `file:` video URL under its browser security policy. The policy also disallows using another route to reach the same local page. No rendered implementation screenshot could therefore be captured or compared.
  Impact: Hero framing, video crop, zoom cue timing against recorded clicks, mobile layout, and playback remain visually unverified.
  Fix: Open the current branch's homepage in a browser that permits local project preview, then check the video framing, align zoom cues with the recorded clicks, and review mobile layout before publication.

**Open Questions**

- Confirm the supplied walkthrough is suitable for public display, including any staff details visible during playback.
- Align the three progress-based zoom cues with the actual moments in the recording when the cursor acts on important controls.

**Implementation Checklist**

- [x] Replace the hero report mockup with the supplied video in a rounded frame, based on Zen's video treatment.
- [x] Keep the post-hero feature section and remove its demo-video tab.
- [x] Add three restrained progress-based focus zooms and honor reduced-motion settings.
- [x] Add responsive horizontal feature tabs and keyboard arrow navigation.
- [x] Replace earlier example media with the six fictional-data screenshots supplied for the latest refinement.
- [x] Use fictional names in the visible roster and report examples.
- [x] Check JavaScript syntax, local asset references, and whitespace errors.
- [ ] Capture and compare the rendered page on desktop and mobile.
- [ ] Verify hero playback and review all visible demo content.
- [ ] Align zoom cues with actual recorded click moments.

**Follow-up Polish**

- Confirm the hero video crop, zoom timing, screenshot framing, and mobile tab widths after browser preview.

## Comparison record

- Source visual truth: Zen Browser feature-section implementation at `https://github.com/zen-browser/www/blob/main/src/components/Features.astro` and video element at `https://github.com/zen-browser/www/blob/main/src/components/Video.astro`. The supplied AtGen screenshots are product media, not a visual reference for the page layout.
- Implementation: homepage hero and `app/index.html#features`, styled in `app/style.css`.
- Implementation screenshot: unavailable; the browser policy blocked local-page access.
- Viewport, pixel dimensions, CSS size, and density: unavailable because no implementation screenshot could be captured.
- State: default selected “Classify your team” tab; the hero video and zoom states were not browser-rendered.
- Full-view and focused-region evidence: unavailable; no rendered comparison image.
- Comparison history: no visual comparison iterations were possible. Static source validation passed; it does not substitute for rendered QA.
- Final result: blocked
