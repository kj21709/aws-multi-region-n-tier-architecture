# Homenub Library Design System Mapping

## Sources and Approach

Source: [requirements](../requirements-analysis/requirements.md) FR7, NFR4 and NFR7; [confirmed design inputs](refined-mockups-questions.md); [mockups](mockups.md). There is no established application component library in the current HTML/CSS/JavaScript source. Use a small local token set and native elements, retaining the plain frontend rather than introducing a framework. Reuse existing files during implementation; the preview is a design artifact under this record.

## Color Tokens

| Token | Value | Application |
|---|---|---|
| Canvas | #F8F5EE | Warm cream page. |
| Surface | #FFFFFF | Cards and checkout panel. |
| Ink | #20382D | Primary text. |
| Muted | #54665A | Secondary text with sufficient contrast. |
| Brand | #24543D | Green action, selected label and accents. |
| Brand hover | #1A402E | Hover treatment without movement. |
| Soft accent | #E9F0E8 | Selected-book/helper surface. |
| Boundary | #7A897C | Input/action boundaries; use genuine borders rather than shadow alone. |
| Error | #A62929 | Error text and mark, always accompanied by wording. |
| Caution | #6B4A13 | Recovery/availability-check text. |
| Focus | #1D4ED8 | 3 px focus outline with 3 px offset. |

Computed sRGB ratios for key pairs: ink/canvas 11.58:1; muted/canvas 5.63:1; white/brand 8.71:1; error/white 7.07:1; boundary/white 3.69:1; focus/canvas 6.15:1. These are token calculations, not a rendered audit. Evaluate all actual combinations, hover states, backgrounds and zoom during implementation. Normal text targets 4.5:1; meaningful UI boundaries target 3:1. [W3C contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).

## Typography, Spacing and Layout

| Area | Specification |
|---|---|
| Headings | Georgia, Times New Roman, serif; main 40–56 px fluid on larger screens, 32 px mobile; section 26–32 px; book titles 22 px. No remote font fetch. |
| Body / controls | system-ui, sans-serif, 16 px base, 1.5 line height; helper text at least 14 px. |
| Spacing | 4, 8, 12, 16, 24, 32, 48 px scale using rem equivalents where appropriate. |
| Cards | White, 16 px radius, 24 px internal spacing; content height grows for text. |
| Controls | At least 44 px high; primary submit 48 px; 8 px minimum gap between adjacent actions. |
| Page | Fluid, max 1200 px; mobile 16 px side padding, larger screens 24 px. |
| Breakpoints | Mobile below 768 px; tablet 768–1023 px; desktop at least 1024 px. Effective CSS width controls reflow under zoom. |
| Covers | Decorative typographic paper tiles made with local CSS. No unsupported real-cover/licensing dependency. |
| Motion | No looping skeleton shimmer, parallax or essential animation. Optional short transitions disappear under reduced-motion preference. |

## Component Mapping

| Product element | Native implementation direction | Owned behavior |
|---|---|---|
| Header / policy intro | header, local anchor, h1, paragraphs | Branding and orientation, no account navigation. |
| Catalog / cards | section, h2, ul/li, h3, button | FR1 selection and truthful availability. |
| Checkout panel | section, h2, form, label/input, button | FR3 input and explicit submission. |
| Selected-book summary | Paragraphs / definition list | Chosen title and loan policy, no reservation claim. |
| Error | Associated paragraph with error ID | Specific correction plus semantic invalid state. |
| Progress / recovery | Visible text and status/alert semantics as appropriate | Actionable feedback with no cloud implementation detail. |
| Result | Focusable heading, definition list, time, native action | Durable reference/date with no auto-dismiss. |
| Demo notice | Persistent visible banner | FR2 distinction from production. |

All interaction details belong to [interaction-spec.md](interaction-spec.md). No calendar picker, image library, icon package, cart or authentication component is required. Inputs and controls must not rely solely on color or placeholder text.

## Verification Boundary

Local contrast calculations establish intended token pairs. Preview source checks establish basic markup/reference consistency. Full browser geometry, assistive-technology behavior, real data errors and production API integration remain implementation checks in [accessibility-checklist.md](accessibility-checklist.md), not already completed results.
