# Toast Notification Component

A professional, corporate-styled toast notification system for displaying success, error, warning, and info messages.

## Features

✨ **Modern Design**
- Clean white background with subtle borders
- Icon-based type indicators
- Smooth animations
- Progress bar for auto-dismiss

🎯 **Best Practices**
- Non-blocking (positioned at edges)
- Auto-dismiss with visual countdown
- Manual close option
- Accessible with ARIA labels

🎨 **Customizable**
- 4 types: success, error, warning, info
- 4 positions: top-right, top-center, bottom-right, bottom-center
- Custom duration
- Optional message

## Usage

### Using the Hook (Recommended)

```tsx
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation Successful', 'Your changes have been saved.');
  };

  const handleError = () => {
    toast.error('Operation Failed', 'Please try again later.');
  };

  return (
    <>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      
      {/* Toast Container */}
      <toast.ToastContainer />
    </>
  );
}
```

### Direct Component Usage

```tsx
import Toast from '../components/Toast';
import { useState } from 'react';

function MyComponent() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <button onClick={() => setShowToast(true)}>Show Toast</button>
      
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        type="success"
        title="Success!"
        message="Your operation completed successfully."
        duration={5000}
        position="top-right"
      />
    </>
  );
}
```

## API Reference

### Toast Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | required | Controls visibility |
| `onClose` | `() => void` | required | Callback when closed |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Toast type |
| `title` | `string` | required | Toast title |
| `message` | `string` | `undefined` | Optional message |
| `duration` | `number` | `5000` | Auto-dismiss duration (ms) |
| `position` | `'top-right' \| 'top-center' \| 'bottom-right' \| 'bottom-center'` | `'top-right'` | Position |

### useToast Hook

```typescript
const {
  success,    // (title, message?, duration?) => void
  error,      // (title, message?, duration?) => void
  warning,    // (title, message?, duration?) => void
  info,       // (title, message?, duration?) => void
  showToast,  // (options) => void
  ToastContainer // Component
} = useToast();
```

## Examples

### Success Toast
```tsx
toast.success(
  'Request Submitted',
  'Your PEAF request has been submitted successfully.'
);
```

### Error Toast
```tsx
toast.error(
  'Submission Failed',
  'Unable to submit request. Please check your connection.'
);
```

### Warning Toast
```tsx
toast.warning(
  'Unsaved Changes',
  'You have unsaved changes. Please save before leaving.'
);
```

### Info Toast
```tsx
toast.info(
  'New Update Available',
  'A new version of the application is available.'
);
```

### Custom Duration
```tsx
toast.success('Saved!', 'Changes saved successfully.', 3000); // 3 seconds
```

### Custom Position
```tsx
showToast({
  type: 'success',
  title: 'Success',
  message: 'Operation completed',
  position: 'top-center'
});
```

## Design Specifications

### Colors

**Success (Emerald)**
- Icon: `text-emerald-600`
- Background: `bg-emerald-50`
- Border: `border-emerald-200`
- Progress: `bg-emerald-500`

**Error (Red)**
- Icon: `text-red-600`
- Background: `bg-red-50`
- Border: `border-red-200`
- Progress: `bg-red-500`

**Warning (Amber)**
- Icon: `text-amber-600`
- Background: `bg-amber-50`
- Border: `border-amber-200`
- Progress: `bg-amber-500`

**Info (Blue)**
- Icon: `text-blue-600`
- Background: `bg-blue-50`
- Border: `border-blue-200`
- Progress: `bg-blue-500`

### Spacing
- Padding: `p-4` (16px)
- Gap: `gap-3` (12px)
- Border radius: `rounded-xl` (12px)

### Animations
- Entry: Slide from right/top with scale
- Exit: Slide to right/top with scale
- Duration: 200-300ms with spring physics
- Progress bar: Linear animation

### Icons
- Success: CheckCircle2
- Error: XCircle
- Warning: AlertCircle
- Info: Info
- Close: X

## Accessibility

- ✅ Keyboard navigation (ESC to close)
- ✅ ARIA labels on buttons
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ High contrast colors

## Best Practices

### When to Use

**Success Toast:**
- Form submitted successfully
- Data saved
- Action completed
- Operation successful

**Error Toast:**
- Form validation errors
- API errors
- Network errors
- Operation failed

**Warning Toast:**
- Unsaved changes
- Potential issues
- Confirmations needed
- Important notices

**Info Toast:**
- General information
- Updates available
- Tips and hints
- Status changes

### Duration Guidelines

- **Quick actions:** 3000ms (3 seconds)
- **Standard:** 5000ms (5 seconds)
- **Important messages:** 7000ms (7 seconds)
- **Critical errors:** 0 (manual close only)

### Position Guidelines

- **Top-right:** Default, non-intrusive
- **Top-center:** Important messages
- **Bottom-right:** Less important
- **Bottom-center:** Form-related messages

## Integration Examples

### Admin Panel - Approve/Reject

```tsx
const handleApprove = async (userId: string) => {
  try {
    await approveUser(userId);
    toast.success(
      'User Approved',
      'The user account has been activated successfully.'
    );
  } catch (error) {
    toast.error(
      'Approval Failed',
      'Unable to approve user. Please try again.'
    );
  }
};

const handleReject = async (userId: string) => {
  try {
    await rejectUser(userId);
    toast.warning(
      'User Rejected',
      'The registration request has been rejected.'
    );
  } catch (error) {
    toast.error(
      'Rejection Failed',
      'Unable to reject user. Please try again.'
    );
  }
};
```

### Form Submission

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    const result = await submitForm(data);
    toast.success(
      'Form Submitted',
      `Document number: ${result.document_no}`
    );
    navigate('/dashboard');
  } catch (error) {
    toast.error(
      'Submission Failed',
      error.message || 'Please check your input and try again.'
    );
  }
};
```

### File Upload

```tsx
const handleUpload = async (files: File[]) => {
  try {
    await uploadFiles(files);
    toast.success(
      'Upload Complete',
      `${files.length} file(s) uploaded successfully.`
    );
  } catch (error) {
    toast.error(
      'Upload Failed',
      'Some files could not be uploaded. Please try again.'
    );
  }
};
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

## Dependencies

- `motion/react` (Framer Motion) - for animations
- `lucide-react` - for icons
- React 18+

## Performance

- Lightweight: ~2KB gzipped
- Efficient animations
- Minimal re-renders
- Auto-cleanup

## Troubleshooting

### Toast not showing
- Check if `show` prop is true
- Verify ToastContainer is rendered
- Check z-index conflicts

### Animation issues
- Ensure Framer Motion is installed
- Check for CSS conflicts
- Verify position prop is valid

### Multiple toasts overlapping
- Use different positions
- Implement toast queue (future enhancement)
- Adjust timing

## Future Enhancements

- Toast queue system
- Stacking multiple toasts
- Custom icons
- Sound notifications
- Persistent toasts
- Action buttons in toast
