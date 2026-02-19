# Common UI Components

The `src/components/common` directory contains reusable UI primitives used throughout the Admin Panel. These components enforce the design system (colors, spacing, dark mode).

## Components

### Button

Primary interaction element.

- **Props**:
  - `variant`: `primary` (default), `secondary`, `danger`, `outline`, `ghost`
  - `size`: `sm`, `md` (default), `lg`
  - `loading`: boolean - shows a spinner and disables button
  - `icon`: ReactNode - icon to display before text
  - `disabled`: boolean

```jsx
<Button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
  Save Changes
</Button>
```

### Card

Container with white/dark-gray background, shadow, and rounded corners.

- **Props**:
  - `className`: additional styles
  - `children`: content
  - `noPadding`: boolean - remove default internal padding

```jsx
<Card>
  <h2>User Details</h2>
  <p>...</p>
</Card>
```

### Modal

Dialog overlay for focused tasks.

- **Props**:
  - `isOpen`: boolean
  - `onClose`: function
  - `title`: string
  - `size`: `sm`, `md`, `lg`, `xl`, `full`
  - `children`: content

```jsx
<Modal isOpen={show} onClose={() => setShow(false)} title="Edit User">
  <EditUserForm />
</Modal>
```

### Badge

Small label for status or categories.

- **Props**:
  - `variant`: `success`, `warning`, `danger`, `info`, `primary`, `neutral`
  - `size`: `sm`, `md`
  - `children`: content

```jsx
<Badge variant="success">Active</Badge>
```

### Avatar

User profile image with fallback initials.

- **Props**:
  - `src`: string (image URL)
  - `alt`: string (user name for initials)
  - `size`: `sm`, `md`, `lg`, `xl`

```jsx
<Avatar src={user.avatar} alt={user.name} />
```

### Pagination

Pagination controls for lists.

- **Props**:
  - `currentPage`: number
  - `totalPages`: number
  - `onPageChange`: function(pageNumber)

### Tabs

Tabbed interface switcher.

- **Props**:
  - `tabs`: Array<{ id: string, label: string, icon?: node }>
  - `activeTab`: string (id)
  - `onChange`: function(id)

```jsx
<Tabs 
  tabs={[{ id: 'info', label: 'Info' }, { id: 'logs', label: 'Logs' }]}
  activeTab={tab}
  onChange={setTab}
/>
```

### Loader

Circular spinner for loading states.

- **Props**:
  - `size`: `sm`, `md`, `lg`
  - `className`: colors/margins

### Skeleton

Loading placeholder animation (shimmer).

- **Props**:
  - `className`: utility classes for height/width (e.g., `h-4 w-32`)

### EmptyState

Placeholder for empty lists.

- **Props**:
  - `title`: string
  - `description`: string
  - `icon`: Lucide icon component
  - `action`: ReactNode (usually a Button)

```jsx
<EmptyState 
  title="No Users" 
  description="Get started by creating a user." 
  icon={User}
  action={<Button>Create</Button>} 
/>
```
