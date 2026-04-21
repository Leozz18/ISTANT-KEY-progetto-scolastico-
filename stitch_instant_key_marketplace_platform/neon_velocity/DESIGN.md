# Design System Specification: High-Performance Digital Gaming

## 1. Overview & Creative North Star: "The Kinetic Pulse"
The gaming market is saturated with cluttered, loud, and often untrustworthy layouts. This design system rejects the "warehouse" aesthetic of traditional marketplaces in favor of **The Kinetic Pulse**. 

Our North Star is a high-performance, editorial-grade interface that feels like a premium piece of gaming hardware. We move beyond the "grid of boxes" by utilizing intentional asymmetry, deep tonal layering, and high-contrast typography. The goal is to make the act of buying a key feel as fast and exciting as the game itself—professional, secure, and technologically superior.

## 2. Colors & Surface Philosophy
The palette is built on a foundation of absolute blacks and deep charcoals, punctuated by high-frequency accents.

### The "No-Line" Rule
**Strict Mandate:** Traditional 1px solid borders are prohibited for sectioning or containment. We define boundaries through visual weight, not lines. 
- Use background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background).
- Boundaries are felt, not seen. This creates an immersive, "unboxed" experience.

### Surface Hierarchy & Nesting
Instead of a flat plane, treat the UI as a series of physical layers.
- **Base Level:** `surface` (#0e0e0f) is the canvas.
- **Sectioning:** Use `surface-container-low` to define large content areas.
- **Active Elements:** Use `surface-container-high` or `highest` for cards or interactive modules. 
- **The Nested Lift:** To draw focus to a specific element (like a featured deal), place a `surface-container-highest` card inside a `surface-container-low` section.

### The Glass & Gradient Rule
- **Floating Elements:** Modals and navigation bars must use Glassmorphism. Apply `surface` with 70% opacity and a `backdrop-blur` (min 12px).
- **Signature Textures:** Main CTAs and Hero backgrounds should not be flat. Use subtle linear gradients transitioning from `primary` (#9cff93) to `primary-container` (#00fc40) at a 135-degree angle to provide "glow" and depth.

## 3. Typography: Technical Sophistication
We pair the geometric precision of **Space Grotesk** with the high-legibility of **Inter**.

- **Display & Headlines (Space Grotesk):** These are our "editorial" voices. Use `display-lg` for hero value propositions. The wide apertures and technical feel of Space Grotesk communicate "High-Performance."
- **Body & Titles (Inter):** Used for all functional data. Inter's neutrality balances the expressive nature of the headlines.
- **Labeling (Inter):** Use `label-md` for technical specs (e.g., "GLOBAL KEY," "STEAM"). Always set to uppercase with a `0.05em` letter spacing to mimic high-end hardware branding.

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking" surface tokens. A card does not "cast a shadow" onto the background; it simply exists on a higher tonal plane (`surface-container-highest`).
- **Ambient Shadows:** When a floating state is required (e.g., a dropdown), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow must feel like ambient occlusion in a game engine, not a 2D effect.
- **The Ghost Border Fallback:** If accessibility requires a border, use the `outline-variant` token at **15% opacity**. This creates a "glint" or a "soft edge" rather than a hard line.

## 5. Components & Primitives

### Buttons: High-Velocity Action
- **Primary:** Gradient fill (`primary` to `primary_container`). Radius: `md` (0.375rem). Text: `title-sm` bold. No border. On hover: Increase `primary_dim` saturation.
- **Secondary:** Surface-container-highest background with a `primary` "Ghost Border" (20% opacity).
- **Tertiary:** No background. `primary` text. Underline only on hover.

### Cards: The Content Vessel
- **Forbid Dividers:** Do not separate "Title" from "Price" with a line. Use vertical white space from the spacing scale (e.g., `gap-4`).
- **Structure:** `surface-container-low` base. On hover, transition background to `surface-container-high` and apply a subtle `primary` glow (5% opacity overlay).

### Inputs: The Secure Terminal
- **Base State:** `surface-container-highest` background. No border.
- **Active State:** A 1px "Ghost Border" using `secondary` (#00e3fd) at 40% opacity. 
- **Error State:** Shift background to a 5% opacity tint of `error`.

### Chips: Metadata Tags
- **Selection Chips:** Use `secondary_container` with `on_secondary_container` text. Use `sm` (0.125rem) radius for a "technical/chip" look.

## 6. Do's and Don'ts

### Do:
- **Embrace Negative Space:** Use aggressive padding (at least 24px) between content blocks to maintain a "premium" feel.
- **Use Intentional Asymmetry:** In the Hero section, offset the product image from the text alignment to create a dynamic, kinetic energy.
- **Micro-Interactions:** Every interaction should have a 150ms "Ease-Out" transition. The UI should feel snappy and responsive.

### Don't:
- **Don't use 100% white text for body copy:** Use `on_surface_variant` (#adaaab) to reduce eye strain and maintain the dark-mode depth. Save `on_surface` (Pure White) for headlines.
- **Don't use standard "Grey" shadows:** Always use a dark-tinted version of the background to ensure the shadow feels integrated.
- **Don't use standard dividers:** If you think you need a horizontal rule, use an 8px vertical gap and a color-shift instead.