# Implementation Plan: Clickable & Draggable Editor Preview Elements

## GitHub Issue #49
**[Feat] Elements In The Editor's Live Preview Are Clickable & Dragable**

---

## 📌 Overview

This document outlines the implementation plan for making the editor's live preview interactive, allowing merchants to:
- Click on elements to edit them
- Drag and drop elements within widgets
- View storefront in mobile/desktop modes
- Save or discard changes with shared state management

---

## ✅ Acceptance Criteria (from Issue)

1. [x] Merchants can view their storefront in the editor
   - When mobile is toggled on, render merchants storefront in mobile view
   - When desktop is toggled on, render merchants storefront in desktop view
2. [x] Widgets are rendered on the storefront for the live preview
3. [x] Merchants can click any element in the announcement bar
4. [x] On click, that element can be edited (color, size, etc)
5. [x] Merchants can drag and drop a selected element within the announcement bar
6. [x] Merchant can save or discard settings

---

## 📝 Implementation Tasks

### Phase 1: Shared State Management

#### Task 1.1: Create Editor Redux Slice
**File:** `web/frontend/features/editor/editorSlice.jsx`

**State Structure:**
```javascript
{
  viewportMode: 'desktop' | 'mobile',
  selectedElementId: string | null,
  elements: [
    {
      id: string,
      type: 'text' | 'countdown' | 'button' | 'image' | 'emoji',
      order: number,
      config: {
        // Element-specific settings
        text: string,
        fontSize: string,
        fontColor: string,
        fontFamily: string,
        backgroundColor: string,
        // ... other styles
      }
    }
  ],
  unsavedChanges: boolean,
  lastSavedState: null | elements[]
}
```

**Actions:**
- `setViewportMode(mode)`
- `selectElement(elementId)`
- `deselectElement()`
- `updateElementConfig(elementId, config)`
- `reorderElements(sourceIndex, destinationIndex)`
- `addElement(elementType)`
- `removeElement(elementId)`
- `saveChanges()`
- `discardChanges()`

#### Task 1.2: Update Store Configuration
**File:** `web/frontend/store.jsx`
- Add editor reducer to store configuration

---

### Phase 2: Live Preview Component

#### Task 2.1: Create LivePreview Container
**File:** `web/frontend/components/LivePreview/LivePreview.jsx`

**Features:**
- Viewport toggle (mobile/desktop)
- Simulated storefront background
- Widget overlay area
- Element rendering from Redux state

**Props:**
- `widgetType`: 'announcement-bar' | 'bundle' | etc.
- `onElementClick`: (elementId) => void
- `onElementDrop`: (sourceIdx, destIdx) => void

#### Task 2.2: Create Draggable Element Wrapper
**File:** `web/frontend/components/LivePreview/DraggableElement.jsx`

**Features:**
- Click handler for selection
- Drag handle
- Visual feedback (hover, selected, dragging states)
- Uses @dnd-kit for drag-and-drop

**Implementation:**
```javascript
// Uses @dnd-kit/core and @dnd-kit/sortable
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
```

---

### Phase 3: Element Selection & Editing

#### Task 3.1: Create Element Config Panel
**File:** `web/frontend/components/LivePreview/ElementConfigPanel.jsx`

**Features:**
- Dynamic configuration based on element type
- Real-time preview updates
- Color pickers for colors
- Font family/size selectors
- Spacing/padding controls

**Element Types & Configurations:**
| Element Type | Available Settings |
|-------------|-------------------|
| Text | font color, font size, font family, font weight, text content, letter spacing, line height |
| Countdown | timer theme, digit colors, label colors, background |
| Button | text, background color, text color, border radius, padding |
| Image | src, alt, width, height |
| Emoji | emoji selection, size |

#### Task 3.2: Selection Visual Feedback
- Blue border around selected element
- Hover state with lighter border
- Drag handle icon visible on hover

---

### Phase 4: Drag and Drop System

#### Task 4.1: Install Dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### Task 4.2: Implement DnD Context
**File:** `web/frontend/components/LivePreview/LivePreview.jsx`

```javascript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
```

**Features:**
- Sortable context for element reordering
- Collision detection
- Drag overlay for visual feedback

---

### Phase 5: Integration with Existing Editor

#### Task 5.1: Update AnnouncementBarActions
**File:** `web/frontend/apps/announcement-bar/announcementBarActions.jsx`

**Changes:**
- Replace static preview with LivePreview component
- Connect to Redux state
- Add element config panel alongside preview
- Add viewport toggle controls

#### Task 5.2: Update Design Tab
- Elements list shows all widget elements
- Click element in list = select in preview
- Bidirectional selection sync

---

### Phase 6: Save/Discard Functionality

#### Task 6.1: Implement Save Logic
- On save: 
  1. Update Redux lastSavedState
  2. Call API to persist changes
  3. Set unsavedChanges = false

#### Task 6.2: Implement Discard Logic
- On discard:
  1. Reset elements to lastSavedState
  2. Set unsavedChanges = false
  3. Deselect current element

---

## 📁 File Structure

```
web/frontend/
├── features/
│   ├── product/
│   │   └── productSlices.jsx (existing)
│   └── editor/
│       └── editorSlice.jsx (NEW)
├── components/
│   ├── LivePreview/
│   │   ├── index.js (NEW)
│   │   ├── LivePreview.jsx (NEW)
│   │   ├── LivePreview.css (NEW)
│   │   ├── DraggableElement.jsx (NEW)
│   │   ├── ElementConfigPanel.jsx (NEW)
│   │   └── ViewportToggle.jsx (NEW)
│   └── ... (existing)
├── store.jsx (MODIFY)
└── apps/
    └── announcement-bar/
        └── announcementBarActions.jsx (MODIFY)
```

---

## 🎨 UI/UX Specifications

### Selection States
- **Default:** No border, normal cursor
- **Hover:** Light blue border (#5169DD20), pointer cursor
- **Selected:** Solid blue border (#5169DD), blue shadow
- **Dragging:** Semi-transparent, elevated shadow

### Viewport Toggle
- Desktop icon (monitor) / Mobile icon (phone)
- Located above preview area
- Changes preview container width

### Config Panel
- Appears to the left of preview when element selected
- Collapsible sections for different config groups
- Real-time updates as user changes values

---

## 🔄 Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Design Tab    │────▶│   Redux Store    │◀────│  Live Preview   │
│  (Element List) │     │  (editorSlice)   │     │ (Clickable/Drag)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │                       ▼                        │
        │              ┌──────────────────┐              │
        └─────────────▶│  Config Panel    │◀─────────────┘
                       │ (Edit Settings)  │
                       └──────────────────┘
```

---

## 📋 Testing Checklist

- [ ] Can select element by clicking in preview
- [ ] Selected element shows visual highlight
- [ ] Config panel shows correct settings for selected element
- [ ] Can edit settings and see live preview update
- [ ] Can drag element to new position
- [ ] Element order updates correctly after drag
- [ ] Mobile toggle changes preview width
- [ ] Desktop toggle restores full preview width
- [ ] Save button persists changes
- [ ] Discard button reverts to last saved state
- [ ] Design tab list syncs with preview selection

---

## ⏱️ Estimated Timeline

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Shared State Management | 2-3 hours |
| 2 | Live Preview Component | 3-4 hours |
| 3 | Element Selection & Config | 4-5 hours |
| 4 | Drag and Drop | 3-4 hours |
| 5 | Integration | 2-3 hours |
| 6 | Save/Discard | 1-2 hours |
| **Total** | | **15-21 hours** |

---

## 🗒️ Notes

1. This implementation applies to all apps moving forward (announcement bars, bundles, etc.)
2. Existing style settings remain unchanged - only adding click/drag capability
3. Widgets have boundaries - elements can only be moved within the widget, not outside
4. The storefront preview is a simulation for the editor, not an actual iframe of the live store
