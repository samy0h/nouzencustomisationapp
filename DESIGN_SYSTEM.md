# Design System Documentation

## Overview

This design system defines the visual language, components, and patterns for the custom clothing editor. It ensures consistency across the catalog, editor, and preview experiences.

## Brand Colors

### Primary Palette
```
Primary:       #000000 (Black) - Main brand color
Secondary:     #FFFFFF (White) - Contrast and backgrounds
Accent:        #3B82F6 (Blue-500) - CTAs, active states
```

### UI Colors
```
Gray-50:       #F9FAFB - Light backgrounds
Gray-100:      #F3F4F6 - Hover states
Gray-200:      #E5E7EB - Borders
Gray-300:      #D1D5DB - Disabled states
Gray-400:      #9CA3AF - Placeholder text
Gray-500:      #6B7280 - Secondary text
Gray-600:      #4B5563 - Body text
Gray-800:      #1F2937 - Headings
Gray-900:      #111827 - Dark text

Success:       #10B981 (Green-500)
Warning:       #F59E0B (Amber-500)
Error:         #EF4444 (Red-500)
Info:          #3B82F6 (Blue-500)
```

## Typography

### Font Family
```css
Primary: 'Inter', system-ui, -apple-system, sans-serif
Monospace: 'JetBrains Mono', 'Courier New', monospace
```

### Font Scales
```
Heading 1:     48px / 3rem    - font-bold - Page titles
Heading 2:     36px / 2.25rem - font-bold - Section titles
Heading 3:     30px / 1.875rem - font-semibold - Subsections
Heading 4:     24px / 1.5rem  - font-semibold - Card titles
Heading 5:     20px / 1.25rem - font-medium - Component headers

Body Large:    18px / 1.125rem - font-normal - Emphasis
Body:          16px / 1rem     - font-normal - Default text
Body Small:    14px / 0.875rem - font-normal - Secondary text
Caption:       12px / 0.75rem  - font-normal - Labels, captions
```

### Line Heights
```
Tight:         1.25 - Headings
Normal:        1.5  - Body text
Relaxed:       1.75 - Long-form content
```

## Spacing Scale

Using Tailwind's default scale (4px base unit):
```
0    - 0px
1    - 4px
2    - 8px
3    - 12px
4    - 16px
5    - 20px
6    - 24px
8    - 32px
10   - 40px
12   - 48px
16   - 64px
20   - 80px
24   - 96px
32   - 128px
```

## Component Patterns

### Buttons

#### Primary Button
```
Background: Black (#000000)
Text: White (#FFFFFF)
Padding: 12px 24px (py-3 px-6)
Border Radius: 8px (rounded-lg)
Font: 16px medium
Hover: Gray-800 background
Active: Gray-900 background
Disabled: Gray-300 background, Gray-500 text
```

#### Secondary Button
```
Background: White (#FFFFFF)
Border: 2px solid Black
Text: Black (#000000)
Padding: 12px 24px
Border Radius: 8px
Hover: Gray-50 background
Active: Gray-100 background
```

#### Icon Button
```
Size: 40x40px square
Background: Transparent
Hover: Gray-100 background
Border Radius: 8px
Icon Size: 20px
```

### Cards

#### Product Card
```
Background: White
Border: 1px solid Gray-200
Border Radius: 12px (rounded-xl)
Padding: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Hover: Shadow lift (0 4px 6px rgba(0,0,0,0.1))
```

#### Panel Card
```
Background: White
Border: 1px solid Gray-200
Border Radius: 8px
Padding: 20px
```

### Inputs

#### Text Input
```
Height: 40px
Padding: 10px 12px
Border: 1px solid Gray-300
Border Radius: 6px
Font: 16px
Focus: Blue-500 border, Blue-100 ring
Error: Red-500 border, Red-100 ring
```

#### Select Dropdown
```
Height: 40px
Padding: 10px 12px
Border: 1px solid Gray-300
Border Radius: 6px
Arrow: Chevron-down icon
Focus: Blue-500 border
```

#### Color Picker
```
Swatch Size: 32x32px
Border: 2px solid Gray-200
Selected: 3px border Blue-500
Border Radius: 6px
Grid Gap: 8px
```

### Modals

```
Overlay: Black with 50% opacity
Container: White background
Max Width: 600px
Border Radius: 12px
Padding: 32px
Shadow: 0 20px 25px rgba(0,0,0,0.15)
```

### Tooltips

```
Background: Gray-900
Text: White
Padding: 6px 12px
Border Radius: 6px
Font Size: 14px
Arrow: 6px triangle
```

## Layout Patterns

### Page Layout
```
Max Width: 1440px
Padding: 24px (mobile), 48px (desktop)
Margin: 0 auto (centered)
```

### Grid System
```
Catalog Grid: 
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns
  - Gap: 24px

Editor Layout:
  - Toolbar: 280px fixed width (left)
  - Canvas: Flexible center area
  - Panel: 320px fixed width (right)
  - Mobile: Stacked layout
```

## Icons

Using Heroicons (https://heroicons.com/) or Lucide React:

### Common Icons
```
Plus:          Add elements
Trash:         Delete
Edit:          Modify
Image:         Upload image
Type:          Add text
Square:        Shapes
Layers:        Layer panel
Eye:           Preview/Visibility
Download:      Export
Upload:        Import
ChevronLeft:   Back navigation
ChevronRight:  Forward navigation
X:             Close/Remove
Check:         Confirm/Select
Settings:      Configuration
```

### Icon Sizes
```
Small:  16px
Medium: 20px
Large:  24px
XLarge: 32px
```

## Catalog Page Design

### Layout
```
┌─────────────────────────────────────┐
│            Header                    │
├─────────────────────────────────────┤
│  CUSTOM YOUR STYLE                   │
│  Choose a blank product to customize │
├─────────────────────────────────────┤
│ [Filter Buttons: All | T-Shirts |...│
├─────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐│
│  │ T-  │  │ T-  │  │Hoodie│ │Jogger││
│  │Shirt│  │Shirt│  │     │  │     ││
│  │Std  │  │Over │  │     │  │     ││
│  └─────┘  └─────┘  └─────┘  └─────┘│
└─────────────────────────────────────┘
```

### Product Card Anatomy
```
┌────────────────────┐
│                    │
│   Product Image    │
│    (Mockup)        │
│                    │
├────────────────────┤
│ T-Shirt Standard   │
│ Starting at $25    │
│ [Customize →]      │
└────────────────────┘
```

## Editor Page Design

### Layout (Desktop)
```
┌──────────────────────────────────────────────────┐
│  ← Back    T-Shirt Standard    [Preview] [Save]  │
├──────┬────────────────────────────────┬──────────┤
│ TOOL │                                │ LAYERS   │
│ BAR  │                                │          │
│      │       CANVAS AREA              │ Layer 1  │
│ Text │      (Product Mockup           │ Layer 2  │
│ [T]  │       with Design)             │ Layer 3  │
│      │                                │          │
│ Image│                                │ [+ Add]  │
│ [⬆] │                                │          │
│      │                                │ PROPS    │
│ Shape│                                │          │
│ [□]  │                                │ Color:   │
│      │                                │ Size:    │
│      │                                │ Opacity: │
├──────┴────────────────────────────────┴──────────┤
│  [◄ Front]  [Back ►]    Color: [●●●]  Size: [M▼]│
└──────────────────────────────────────────────────┘
```

### Canvas Appearance
```
Background: Product mockup image (selected color)
Print Area: Subtle border/guide (dashed, Gray-300)
Active Object: Blue-500 selection handles
Grid: Optional, togglable, Gray-200 lines
```

### Toolbar Structure
```
TOOLS (Sections):

1. Add Elements
   - Text
   - Upload Image
   - Shapes (Rectangle, Circle, Triangle)
   - Line

2. Edit
   - Select/Move
   - Delete
   - Duplicate
   - Bring Forward / Send Backward

3. View
   - Zoom In/Out
   - Fit to View
   - Show/Hide Guides
```

### Layer Panel
```
Layer List Item:
┌──────────────────────┐
│ [👁] Text Layer    [×]│
│ [👁] Image Layer   [×]│
│ [👁] Shape Layer   [×]│
└──────────────────────┘

Properties (when selected):
- Position: X, Y
- Size: W, H
- Rotation: 0-360°
- Opacity: 0-100%
- Color: Picker
- Text-specific: Font, Size, Weight
```

## Preview Page Design

### Layout
```
┌─────────────────────────────────────┐
│            Header                    │
├─────────────────────────────────────┤
│  YOUR CUSTOM DESIGN                  │
├─────────────────────────────────────┤
│     ┌──────────┐  ┌──────────┐     │
│     │          │  │          │     │
│     │  FRONT   │  │  BACK    │     │
│     │  VIEW    │  │  VIEW    │     │
│     │          │  │          │     │
│     └──────────┘  └──────────┘     │
├─────────────────────────────────────┤
│  Product: T-Shirt Standard          │
│  Color: White                       │
│  Size: Medium                       │
├─────────────────────────────────────┤
│  [← Edit Design]  [Confirm Order →] │
└─────────────────────────────────────┘
```

## Animation & Transitions

### Durations
```
Fast:    150ms - Hover states, clicks
Normal:  300ms - Modals, dropdowns, page elements
Slow:    500ms - Page transitions
```

### Easing
```
Default:    ease-in-out
Sharp:      cubic-bezier(0.4, 0.0, 0.2, 1) - Entrances
Smooth:     cubic-bezier(0.4, 0.0, 0.6, 1) - Exits
Bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55) - Playful
```

### Common Animations
```
Hover Scale:     transform: scale(1.02)
Button Press:    transform: scale(0.98)
Fade In:         opacity: 0 → 1
Slide In:        transform: translateY(10px) → translateY(0)
Modal:           opacity + scale(0.95 → 1)
```

## Responsive Breakpoints

```
Mobile:       < 640px   (sm)
Tablet:       640-1024px (md-lg)
Desktop:      > 1024px   (xl)
Large:        > 1280px   (2xl)
```

### Mobile Adaptations

**Catalog Page:**
- Single column grid
- Larger touch targets (min 44x44px)
- Sticky filter bar

**Editor Page:**
- Stacked layout (vertical)
- Canvas takes full width
- Toolbar becomes bottom sheet
- Layer panel as modal/drawer
- Simplified controls

**Preview Page:**
- Stacked views (front above back)
- Full-width buttons

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1

### Focus States
```
All interactive elements:
- outline: 2px solid Blue-500
- outline-offset: 2px
- Never remove focus styles (outline: none)
```

### ARIA Labels
- All icon buttons must have aria-label
- Canvas operations announced via aria-live
- Form inputs have associated labels

### Keyboard Navigation
- Tab order follows visual order
- Canvas: Arrow keys move selected object
- Escape: Close modals, deselect
- Delete/Backspace: Remove selected object
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo

## Loading States

### Skeleton Loaders
```
Product Card Skeleton:
- Gray-200 background
- Animated shimmer effect
- Same dimensions as actual card
```

### Spinners
```
Small:  16px - Inline loading
Medium: 24px - Button loading
Large:  48px - Page loading
Color:  Gray-400 or Blue-500
```

### Progress Indicators
```
Image Upload: Linear progress bar
Canvas Export: Circular progress with percentage
```

## Error States

### Empty States
```
No Products:
  Icon + "No products found"
  Subtitle: "Try adjusting your filters"

No Layers:
  Icon + "No design elements yet"
  Action: "Add text or images to start"
```

### Error Messages
```
Toast Notification:
- Position: Top-right
- Background: Error color
- Text: White
- Duration: 5 seconds
- Dismissible

Inline Error:
- Below input field
- Red-500 text
- 14px font size
- Icon: AlertCircle
```

## Z-Index Scale

```
Base:           0   - Default content
Dropdown:       10  - Dropdowns, popovers
Sticky:         20  - Sticky headers
Modal Overlay:  40  - Modal backgrounds
Modal Content:  50  - Modal windows
Toast:          60  - Notifications
Tooltip:        70  - Tooltips
```

## Print Area Visualization

The design canvas should clearly indicate the printable area:

```
Printable Area Indicator:
- Dashed border: 2px dashed Gray-300
- Optional padding: 0.5" from edges (safety margin)
- Background: Slightly transparent overlay outside area
- Label: "Print Area: 12" × 16""
```

## Color Selector Design

```
Color Grid:
┌────────────────────────┐
│ ○ ○ ○ ○ ○ ○           │
│ White Black Navy Red... │
│                        │
│ Selected: ⦿ White      │
└────────────────────────┘

Each swatch: 40x40px
Selected: 4px border Blue-500
Hover: Scale 1.1
```

## Design Philosophy

1. **Minimalism** - Clean, uncluttered interface lets the design take center stage
2. **Clarity** - Every action should be obvious and discoverable
3. **Speed** - Optimize for rapid iteration and experimentation
4. **Consistency** - Reuse patterns across catalog, editor, and preview
5. **Accessibility** - Usable by keyboard, screen reader, and touch
6. **Professionalism** - Enterprise-grade quality matching main Shopify store

## Future Considerations

When backend is integrated:
- Loading states for API calls
- Error handling for network failures
- Optimistic UI updates
- Auto-save indicators
- Session timeout warnings
- Order confirmation designs
