# Claude Code Prompt: Property Management Forms & List View

## Context
You're building a rental property maintenance expense tracker. This prompt focuses on the property creation/edit/list UX flow using Vue 3 with VeeValidate + Zod for form validation.

## Requirements

### Form Validation Strategy
- Use **VeeValidate** for form state management (touched, dirty, pristine, errors)
- Use **Zod** for schema validation (already in project)
- Pattern: Blank form shows NO validation errors
- Validation errors appear ONLY after a field is touched (focused and blurred)
- Submit button is disabled until entire form passes validation
- On submission error, form stays filled with data and error message displays
- On submission success, show success toast and redirect to Property List

### Zod Schema for Property
```typescript
const propertySchema = z.object({
  street: z.string().min(1, "Street address is required"),
  address2: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid zip code is required"),
})
```

### Pages to Create

#### 1. Add Property Form Page
- Route: `/properties/add`
- Form fields: street, address2 (optional), city, state, zipCode
- Required fields: street, city, state, zipCode
- Submit button disabled until form valid
- On success: Toast "Property created successfully" → redirect to `/properties`
- On error: Keep form filled, show error message at top of form or field-level
- Cancel button goes back to Property List

#### 2. Edit Property Form Page
- Route: `/properties/:id/edit`
- Same form layout as Add
- Form pre-populated with existing property data
- On success: Toast "Property updated successfully" → redirect to `/properties`
- On error: Keep form filled, show error message
- Delete button available here (routes to deletion confirmation or detail page)

#### 3. Property List Page (Mobile-First Cards)
- Route: `/properties`
- Card-based layout (NOT table)
- Each card shows:
  - Full address (street, address2 if exists, city, state, zipCode)
  - Vacancy status badge (e.g., "Vacant")
  - Details button OR card is clickable → navigates to `/properties/:id`
- "Add Property" button at top or bottom → navigates to `/properties/add`
- List fetches properties from `GET /api/properties`
- Displays loading state while fetching
- Displays empty state if no properties

#### 4. Property Detail Page
- Route: `/properties/:id`
- Shows full property information
- Shows tenant history (section header, empty state if none)
- Shows maintenance record history (section header, empty state if none)
- Edit button → navigates to `/properties/:id/edit`
- Delete button → modal confirmation or route to delete flow
- Back button → returns to Property List

### API Integration
- `POST /api/properties` - Create property (body: propertySchema)
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get single property detail
- `PUT /api/properties/:id` - Update property (body: propertySchema)
- `DELETE /api/properties/:id` - Delete property

### Form Library Setup
- Install `vee-validate` and ensure `zod` is available
- Create a composable for reusable form validation logic
- Create a utility to integrate Zod schema with VeeValidate
- Use VeeValidate's `useForm()` and `useField()` composables

### Component Structure (Suggested)
```
frontend/src/
├── pages/
│   ├── PropertyList.vue (list view, cards)
│   ├── PropertyForm.vue (reusable add/edit form)
│   └── PropertyDetail.vue (detail page)
├── components/
│   ├── PropertyCard.vue (card component for list)
│   └── FormInput.vue (reusable validated input)
├── composables/
│   └── usePropertyForm.ts (VeeValidate + Zod integration)
├── schemas/
│   └── property.ts (Zod schema)
└── types/
    └── property.ts (TypeScript interfaces)
```

### Validation Behavior (Key UX Requirements)
- **Blank form**: No red error text visible
- **User focuses field, types, then leaves (blur)**: Validation runs
  - If invalid: Show error message in red
  - If valid: Clear error message
- **Field with error, user corrects it**: Error clears in real-time as they type
- **Submit button**: 
  - Disabled and grayed out while form is invalid or submitting
  - Enabled only when entire form is valid
- **On successful submit**: 
  - Button shows loading state during submission
  - Toast appears: "Property created successfully" or "Property updated successfully"
  - Redirect to Property List
- **On submit error** (e.g., duplicate address):
  - Form stays on page with all data intact
  - Error message displayed (at form top or relevant field)
  - Submit button re-enabled for retry

### Toast/Notification Library
- Use a lightweight toast library (e.g., `vue-toastification`, `sonner-vue`, or custom)
- Success toast: "Property created successfully" (green, auto-dismiss)
- Error handling: Display backend error messages in form or as error toast

### Styling Notes
- Mobile-first responsive design
- Form should be comfortable on mobile (touch-friendly inputs)
- Cards on list should be readable on mobile
- Spacing and font sizes appropriate for small screens

### Edge Cases to Handle
- Network error during form submission → show error message, keep form data
- Invalid zip code format → show validation error
- Address already exists → backend returns error, display in form
- Navigating away from form with unsaved changes → optional: warn user
- Loading state while fetching properties for list and detail views

## Implementation Order
1. Create Zod schema for Property
2. Set up VeeValidate integration composable
3. Build PropertyForm component (add/edit)
4. Build PropertyCard component
5. Build PropertyList page
6. Build PropertyDetail page
7. Set up routing for all pages
8. Test form validation flow (touch → blur → error behavior)
9. Test submit success/error flows
10. Test navigation between pages

## Notes
- This is a mobile-first design, so prioritize mobile UX
- Keep form minimal and fast to fill out
- No tenant assignment on property creation (separate flow later)
- All new properties start with status "Vacant"
