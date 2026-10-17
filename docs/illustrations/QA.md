# FitBreak illustrations — QA report (2026-10-17)

Source manifest: `fitbreak_exercise_prompts.json` (31 slots: 30 exercises + `celebrate`).
Visual review: `contact-sheet.html`. Per-slot status: `status.json`. Every Recraft call: `generation-log.json`.
Assets still to make: `missing.txt`.

QA was done by eye against the reference sheet and each exercise's `pose` text. It cannot guarantee
anatomical or medical correctness. Every image marked "review" needs a human check.

## Summary

| State | Count | Slots |
|---|---|---|
| In app | 7 | breathing, celebrate, chest-opener, forward-reach, seated-overhead-reach, sit-to-stand, standing-reach |
| In app, flagged for review | 5 | shoulder-rolls, mini-squat, seated-side-reach, standing-side-reach, seated-rotation |
| Accepted but kept out of the app | 1 | seated-march |
| Rejected (no usable attempt) | 7 | chin-glide, shoulder-squeeze, knee-extension, calf-raise, wall-push, step-touch, march-arms |
| Not generated | 11 | neck-tilt, wrist-circles, hand-openers, ankle-circles, hip-circles (hard to show safely in a still); seated-cat-cow, arm-circles, seated-heel-raise, toe-taps, weight-shift, standing-march (credits ran out) |

**The collection is not complete: 12 of 31 slots are in the app.** Every other slot keeps its existing line figure.

## Character consistency

- Canonical reference: `character-reference.png`, a four-view sheet made with `image_edit` from the three short-haired pilot images. This replaced the first, longer-haired reference.
- All 13 accepted images show the same short-haired man, with the same face, skin tone, clothing colours and proportions. I found no hairstyle or clothing drift.
- Generation used a Recraft V4 style built from that sheet, not true identity locking. It held well across this set, but it isn't guaranteed for future batches.
- Chairs vary in shape: a stool with no back, a chair with a backrest, and one tall stool.
- Background: Recraft returned a grey-sage background (about `#D7DDC6`) instead of `#CEF3DF`. The backgrounds were shifted to the site's mint in post-processing, and the figure pixels are untouched. This lightens the soft floor shadow.

## Pose flags (human review needed)

- **shoulder-rolls**: the shrug is subtle; the arrow carries the movement.
- **mini-squat**: a shallow knee bend with little backward hip hinge.
- **seated-side-reach / standing-side-reach**: the arm arcs overhead, but the torso barely leans to the side.
- **seated-rotation**: the rotation shows mostly in the head; the torso turns only slightly.
- **seated-march**: the knee lift is correct, but on a tall bar stool the planted leg is nearly straight. Not integrated.

## Why the rejects failed

The style pulls poses toward a neutral rest position. Supported and asymmetric poses failed most often:
heels not lifted, no wall drawn, both legs lifted, one arm doing the wrong thing, a walk instead of a side step.
Rejected images are kept in the contact sheet for reference only.

## Cost and licence

- 59 of 60 credits used: about 2 per generation and 11 for the `image_edit` reference sheet.
- The account refused to create a private style, which points to a free plan. **Free-plan Recraft images are not licensed for commercial use**, and upgrading later doesn't license them retroactively. Check the plan before deploying these images.
