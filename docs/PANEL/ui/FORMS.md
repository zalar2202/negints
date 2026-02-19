# Form Components

The `src/components/forms` directory contains a set of **Formik-compatible** input components. They are designed to encapsulate:

- **Labeling** standard consistent labels
- **Error handling** automatically displaying Formik validation errors
- **Styling** consistent Tailwind CSS styling for light and dark modes
- **Accessibility** basic aria attributes

## Usage

All fields must be used inside a Formik `<Form>` context.

```jsx
import { Formik, Form } from 'formik';
import { InputField, SelectField, Button } from '@/components';

<Formik
  initialValues={{ name: '', role: 'user' }}
  validationSchema={...}
  onSubmit={...}
>
  <Form>
    <InputField 
      name="name" 
      label="Full Name" 
      placeholder="John Doe" 
    />
    
    <SelectField name="role" label="Role">
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </SelectField>

    <Button type="submit">Save</Button>
  </Form>
</Formik>
```

## Components

### InputField

Standard text input.

| Prop | Type | Description |
|Data | | |
| `name` | string | **Required**. Field name matching Formik state |
| `label` | string | Label text displayed above input |
| `type` | string | HTML input type (text, email, password, etc.). Default: `text` |
| `placeholder` | string | Placeholder text |
| `className` | string | Additional classes for the container |

### SelectField

Dropdown select input.

| Prop | Type | Description |
|Data | | |
| `name` | string | **Required**. Field name |
| `label` | string | Label text |
| `children` | node | `<option>` elements |

### TextareaField

Multi-line text input.

| Prop | Type | Description |
|Data | | |
| `name` | string | **Required** |
| `label` | string | Label text |
| `rows` | number | Number of rows. Default: `4` |

### CheckboxField

Single checkbox or boolean toggle.

| Prop | Type | Description |
|Data | | |
| `name` | string | **Required** |
| `label` | string | Text displayed next to checkbox |

### FileUploadField

File input with preview and easy clearance.

| Prop | Type | Description |
|Data | | |
| `name` | string | **Required** |
| `label` | string | Label text |
| `accept` | string | File types (e.g., `image/*`). Default: `image/*` |
| `multiple` | boolean | Allow multiple files. Default: `false` |
| `setFieldValue`| func | Check component implementation if you need to pass Formik's setter directly |

### DatePickerField & TimePickerField

Wrappers for date/time selection.

| Prop | Type | Description |
|Data | | |
| `name` | string | **Required** |
| `label` | string | Label text |

### RichTextEditor & RichEditor

WYSIWYG editors (likely wrapping a library like Quill or Tiptap - check implementation if needed).

---

**Note:** All components automatically handle `meta.touched && meta.error` to display validation messages below the input.
