# Table Components

## Overview

Tables use: **Table**, **TableHeader**, **TableHeaderCell**, **TableRow**, **TableCell**, **TableActions**. All in `src/components/tables/`; dark mode via CSS variables. **Named exports** (e.g. `import { Table, TableRow } from "@/components/tables"`).

---

## Correct structure

**TableHeader** renders `<thead>`; put **TableRow** inside it, and **TableHeaderCell** for each column. Use a **manual `<tbody>`** for body rows.

```jsx
import { Table, TableHeader, TableHeaderCell, TableRow, TableCell, TableActions } from "@/components/tables";

<Table>
    <TableHeader>
        <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
        </TableRow>
    </TableHeader>
    <tbody>
        {data.map((item) => (
            <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell align="right">
                    <TableActions onView={...} onEdit={...} onDelete={...} />
                </TableCell>
            </TableRow>
        ))}
    </tbody>
</Table>
```

**Wrong:** Using `TableHeader` for a single column (it’s the whole `<thead>`). **Wrong:** Wrapping `TableHeader` in another `<thead>`.

---

## Components

| Component | Renders | Notes |
|-----------|--------|-------|
| **Table** | Wrapper div + `<table>` | Responsive scroll, border |
| **TableHeader** | `<thead>` | Optional `sticky` |
| **TableHeaderCell** | `<th>` | `sortable`, `sortDirection`, `onSort`, `align` |
| **TableRow** | `<tr>` | Use in both header and body |
| **TableCell** | `<td>` | `align`, `truncate`, `maxWidth` |
| **TableBody** | `<tbody>` | Optional `striped`, `hoverable` (or use manual `<tbody>`) |
| **TableActions** | Buttons | View / Edit / Delete actions |

---

## Reference

User list: `src/app/panel/users/page.js`. Cursor rules: `.cursor/rules/logatech-admin-panel.mdc` (Table Components Usage).
