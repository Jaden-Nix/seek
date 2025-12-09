# Design Guidelines for Seek

## Design Approach
**Reference-Based:** Drawing inspiration from modern creative tools (Canva, Instagram filters, TikTok editor) with dark-mode aesthetics from Spotify and gaming UIs. The design emphasizes visual impact and intuitive creative controls.

## Core Design Principles
- **Immersive Dark Interface:** Creates focus on creative content
- **Playful Professionalism:** Fun and edgy for pranks, but polished execution
- **Instant Feedback:** Every interaction provides clear visual/audio response
- **Zero Friction:** Minimal steps from upload to effect to export

## Typography
- **Primary Font:** Inter or Manrope via Google Fonts (modern, geometric sans-serif)
- **Accent Font:** Space Grotesk for headings/buttons (slightly edgy, tech-forward)
- **Hierarchy:**
  - Hero/Primary headings: text-4xl to text-6xl, font-bold
  - Section headings: text-2xl to text-3xl, font-semibold
  - Body/labels: text-base to text-lg, font-normal
  - Captions/helper text: text-sm, font-light with reduced opacity

## Layout System
**Spacing Units:** Use Tailwind's 4, 6, 8, 12, 16, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: gap-8 to gap-12
- Container margins: mx-4 to mx-8
- Generous whitespace around interactive elements for touch targets (min 44px)

**Grid Structure:**
- Desktop: 3-column layout (sidebar 20%, canvas 60%, properties 20%)
- Tablet: 2-column (collapsible sidebar, main canvas)
- Mobile: Single column stack with bottom sheet controls

## Visual Treatment
**Dark Mode Palette Structure:**
- Background: Deep charcoal/near-black (#0a0a0f to #151520)
- Surface cards: Elevated dark (#1a1a2e to #252538)
- Neon accents: Purple (#a855f7) to Blue (#3b82f6) gradients
- Text primary: White with 90% opacity
- Text secondary: White with 60% opacity
- Success states: Cyan/teal (#06b6d4)
- Warning/alerts: Amber (#f59e0b)

**Glassmorphism Effects:**
- Upload zones and control panels: backdrop-blur-xl with bg-opacity-10
- Overlay UI elements: Semi-transparent with frosted glass effect

## Component Library

### Upload Zones
- Large drag-drop areas with dashed neon borders
- Icon + text centered layout
- Hover state: border glow animation, scale-105 transform
- Active drag state: Pulsing gradient border

### Canvas/Preview
- Full-screen capable with maintain aspect ratio
- Rounded corners (rounded-2xl) on desktop
- Live video feed with subtle frame/scanline effect overlay
- Processing indicator: Animated gradient border

### Control Panels
**Bottom Bar:**
- Fixed position with glassmorphism background
- Large icon buttons (48px minimum) with labels
- Primary action (Start/Export): Gradient button, text-lg
- Secondary actions: Ghost buttons with neon hover states
- Progress indicators: Animated gradient fills

**Sidebar:**
- Collapsible on tablet/mobile
- Effect thumbnails in grid (3 columns)
- Active effect: Neon border highlight
- Sliders for adjustment: Custom styled with gradient tracks

### Buttons & CTAs
- Primary: bg-gradient-to-r from-purple-600 to-blue-600, rounded-xl, px-8 py-4
- Secondary: border-2 border-purple-500, rounded-xl, backdrop-blur
- Icon-only: Circular, 48px minimum, centered icons
- Disabled state: 40% opacity, no hover effects

### Forms & Inputs
- Audio waveform: Gradient-filled waveform visualization
- Sliders: Gradient track with circular thumb
- File inputs: Hidden, triggered by styled upload zones
- All inputs: rounded-lg, focus ring in neon purple

### Modals & Overlays
- Ethical disclaimer: Centered modal, max-w-lg, dark card with gradient border
- Export options: Bottom sheet on mobile, sidebar panel on desktop
- Loading states: Full-screen overlay with animated logo

## Animations & Transitions
**Performance-First Animations:**
- Button hovers: scale-105, duration-200
- Panel slides: translate-x with duration-300
- Effect previews: opacity fade-ins, duration-150
- Processing states: Infinite gradient rotation on borders
- Page transitions: Minimal, fade-only

**GSAP for Hero Elements:**
- Logo entrance: Stagger animation from center
- Initial disclaimer: Slide-up with fade

## Images
**No large hero image** - This is a tool-focused app. Visual hierarchy comes from:
- Gradient backgrounds with subtle noise texture
- User-uploaded content as the hero (their photo/video)
- Icon-driven interface with emoji/illustrations for empty states
- Preview canvas dominates visual real estate

## Responsive Breakpoints
- Mobile: <640px (single column, bottom sheet controls)
- Tablet: 640px-1024px (2-column, collapsible sidebar)
- Desktop: >1024px (3-column layout, all panels visible)

## Accessibility
- All controls: min-height: 44px for touch targets
- Focus indicators: 2px neon purple ring with 2px offset
- High contrast mode: Increase neon intensity by 20%
- Keyboard navigation: Tab order follows visual flow
- Screen reader labels for all icon-only buttons
- ARIA live regions for processing status updates

## Unique Elements
- **Scanline Effect:** Subtle animated scanline over webcam feed for tech aesthetic
- **Gradient Borders:** All primary containers use animated gradient borders
- **Blob Backgrounds:** Animated gradient blobs behind dark surfaces
- **Noise Texture:** Subtle noise overlay on dark backgrounds for depth
- **Neon Glow:** Text shadows on headings (0 0 20px rgba(168, 85, 247, 0.5))