# SuccessNotification Component

A corporate-styled, animated success notification component for displaying submission confirmations and important messages.

## Features

✨ **Modern Design**
- Gradient header with emerald/teal colors
- Smooth animations using Framer Motion
- Responsive and mobile-friendly
- Corporate professional look

🎯 **Best Practices**
- Auto-close with visual progress indicator
- Accessible with ARIA labels
- Keyboard navigation support
- Non-blocking (positioned at top of screen)

🎨 **Customizable**
- Custom title and message
- Optional document number display
- Optional action button
- Configurable auto-close behavior

## Usage

### Basic Usage

```tsx
import SuccessNotification from '../components/SuccessNotification';

function MyComponent() {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <SuccessNotification
      show={showSuccess}
      onClose={() => setShowSuccess(false)}
    />
  );
}
```

### With Document Number

```tsx
<SuccessNotification
  show={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="Request Submitted Successfully"
  message="Your PEAF request has been submitted and is now pending approval."
  documentNo="01/PEAF/IFM/MFG-PE/05/2026"
/>
```

### With Action Button

```tsx
<SuccessNotification
  show={showSuccess}
  onClose={() => setShowSuccess(false)}
  documentNo="01/PEAF/IFM/MFG-PE/05/2026"
  onViewDetails={() => navigate('/dashboard')}
/>
```

### Without Auto-Close

```tsx
<SuccessNotification
  show={showSuccess}
  onClose={() => setShowSuccess(false)}
  autoClose={false}
/>
```

### Custom Auto-Close Delay

```tsx
<SuccessNotification
  show={showSuccess}
  onClose={() => setShowSuccess(false)}
  autoClose={true}
  autoCloseDelay={10000} // 10 seconds
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | required | Controls visibility of notification |
| `onClose` | `() => void` | required | Callback when notification is closed |
| `title` | `string` | `"Request Submitted Successfully"` | Notification title |
| `message` | `string` | `"Your PEAF request has been submitted..."` | Notification message |
| `documentNo` | `string` | `undefined` | Optional document number to display |
| `autoClose` | `boolean` | `true` | Whether to auto-close notification |
| `autoCloseDelay` | `number` | `5000` | Auto-close delay in milliseconds |
| `onViewDetails` | `() => void` | `undefined` | Optional callback for action button |

## Design Specifications

### Colors
- **Success Gradient**: `from-emerald-500 via-emerald-600 to-teal-600`
- **Background**: White with shadow
- **Border**: `border-slate-200`
- **Text**: `text-slate-900` (primary), `text-slate-500` (secondary)

### Spacing
- **Padding**: `px-6 py-5` (content), `px-6 py-5` (header)
- **Gap**: `gap-3` (between elements)
- **Rounded**: `rounded-2xl` (container), `rounded-xl` (inner elements)

### Animations
- **Entry**: Slide down from top with scale
- **Exit**: Fade out with scale
- **Duration**: 200-300ms with spring physics
- **Progress Bar**: Linear animation matching auto-close delay

### Icons
- **Success**: `CheckCircle2` (emerald)
- **Document**: `FileText` (blue)
- **Status**: `Clock` (amber)
- **Action**: `ArrowRight` (white)

## Accessibility

- ✅ Keyboard navigation (ESC to close)
- ✅ ARIA labels on interactive elements
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Color contrast WCAG AA compliant

## Examples

### Success Notification
```tsx
<SuccessNotification
  show={true}
  onClose={() => {}}
  title="Request Submitted Successfully"
  message="Your PEAF request has been submitted and is now pending approval."
  documentNo="01/PEAF/IFM/MFG-PE/05/2026"
/>
```

### Approval Notification
```tsx
<SuccessNotification
  show={true}
  onClose={() => {}}
  title="Request Approved"
  message="Your PEAF request has been approved by the HSE team."
  documentNo="01/PEAF/IFM/MFG-PE/05/2026"
  onViewDetails={() => navigate('/request/123')}
/>
```

### Simple Success
```tsx
<SuccessNotification
  show={true}
  onClose={() => {}}
  title="Changes Saved"
  message="Your profile has been updated successfully."
  autoClose={true}
  autoCloseDelay={3000}
/>
```

## Integration with CreateRequest

The component is integrated in `CreateRequest.tsx`:

1. **State Management**:
   ```tsx
   const [showSuccessNotification, setShowSuccessNotification] = useState(false);
   const [submittedDocumentNo, setSubmittedDocumentNo] = useState('');
   ```

2. **Show on Success**:
   ```tsx
   const result = await res.json();
   setSubmittedDocumentNo(result.document_no);
   setShowSuccessNotification(true);
   ```

3. **Render Component**:
   ```tsx
   <SuccessNotification
     show={showSuccessNotification}
     onClose={() => setShowSuccessNotification(false)}
     documentNo={submittedDocumentNo}
     onViewDetails={() => navigate('/dashboard')}
   />
   ```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Dependencies

- `motion/react` (Framer Motion) - for animations
- `lucide-react` - for icons
- React 18+

## Notes

- Notification appears at the top center of the screen
- Uses `z-index: 100` to appear above other content
- Non-blocking (pointer-events-none on container)
- Smooth spring animations for professional feel
- Progress bar indicates auto-close timing
- Responsive design works on all screen sizes
