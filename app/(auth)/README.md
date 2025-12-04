# Authentication Pages

This directory contains the authentication pages for BillForge.

## Pages Created

### Login Page (`/login`)
- Located at: `app/(auth)/login/page.tsx`
- Features:
  - Email and password input fields
  - Form validation with error messages
  - Loading states during submission
  - Link to register page
  - Link to forgot password (placeholder)
  - Responsive design with shadcn components

### Register Page (`/register`)
- Located at: `app/(auth)/register/page.tsx`
- Features:
  - Name, email, password, and password confirmation fields
  - Client-side password matching validation
  - Server-side error handling
  - Loading states during submission
  - Link to login page
  - Terms and privacy policy links (placeholders)
  - Responsive design with shadcn components

## Components Used

The authentication pages use the following shadcn UI components:
- `Button` - For form submission
- `Input` - For text and password fields
- `Label` - For form field labels
- `Card` - For the main container with CardHeader, CardContent, CardFooter, etc.

## Features

### Error Handling
Both pages include comprehensive error handling:
- Field-specific validation errors
- General error messages
- Loading states to prevent multiple submissions

### Authentication Flow
1. User submits credentials
2. API call is made to the backend
3. On success:
   - Token is stored in localStorage
   - User data is stored in localStorage
   - User is redirected to the home page (`/`)
4. On failure:
   - Appropriate error messages are displayed
   - User can correct and resubmit

### Styling
- Uses Tailwind CSS with the theme defined in `globals.css`
- Dark mode support through CSS variables
- Responsive design that works on mobile and desktop
- Clean, modern UI following shadcn design principles

## API Integration

The pages integrate with the existing API functions:
- `login()` from `@/lib/api/auth.ts`
- `register()` from `@/lib/api/auth.ts`

These functions handle the HTTP requests and token management.

## Future Enhancements

Consider adding:
- Forgot password page
- Terms of service page
- Privacy policy page
- Social authentication (Google, GitHub, etc.)
- Remember me functionality
- Password strength indicator
- Email verification flow

