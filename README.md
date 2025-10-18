# STIIICKS - Social Media Challenges App

A simple web application for participating in social media challenges where users can log in, view challenges by category, and submit URLs to their completed challenge posts.

## Features

### User Features
- **Client-side Authentication**: Simple email-based login (no password validation for MVP)
- **Category-based Challenges**: 7 challenge categories with different themes
- **Progress Tracking**: Visual counters showing completed vs total challenges per subcategory
- **Challenge States**: 
  - Default (grey) - not started
  - Submitted (purple) - URL submitted, pending approval
  - Approved (green) - challenge approved by admin
- **URL Submission**: Paste Instagram/TikTok links with validation
- **Edit Submissions**: Update submitted URLs (resets to pending status)

### Admin Features
- **Admin Panel**: Review and approve/reject pending submissions
- **Submission Management**: View all submissions with status tracking
- **Bulk Actions**: Approve, reject, or reset submissions

## Challenge Categories

1. **Burn List** - Personal growth challenges
   - CHILL (3 challenges)
   - WILD (4 challenges) 
   - SOCIAL (4 challenges)
   - CHAOS (1 challenge)

2. **Tea Time** - Time-based challenges
   - EASY (3 challenges)

3. **Date Devil** - Dating-related challenges
   - FIRST DATE (3 challenges)
   - BAD DATE (3 challenges)

4. **Delulu Zone** - Manifestation challenges
   - EASY (3 challenges)

5. **The Drop** - Relationship challenges
   - SINGLE AF (3 challenges)
   - GHOSTED (4 challenges)
   - BAD DATE (4 challenges)
   - STICKY (1 challenge)

6. **Truth Tag** - Honesty challenges
   - HONEST (3 challenges)

7. **Smoke Story** - Creative challenges
   - CREATIVE (3 challenges)

## Technical Details

### Architecture
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: localStorage for client-side persistence
- **Authentication**: Client-side only (email-based)
- **Styling**: CSS custom properties with existing design system

### File Structure
```
├── index.html              # Login page
├── challenges.html         # Main challenges page
├── admin.html             # Admin panel
├── js/
│   ├── auth.js           # Authentication logic
│   ├── storage.js        # localStorage management
│   ├── ui.js             # UI rendering
│   └── app.js            # Main application logic
├── styles/
│   ├── login.css         # Login page styles
│   ├── challenges.css    # Main page layout
│   ├── category-buttons.css # Category button styles
│   └── challenge-states.css # Challenge state styles
├── assets/               # SVG icons
├── components/           # Existing component library
├── config.css           # Color variables
└── base.css             # Base styles
```

### Getting Started

1. Open `index.html` in a web browser
2. Enter any email address and password to log in
3. Browse challenges by category
4. Submit URLs for completed challenges
5. Use the Admin panel to approve submissions

### Design System

The app uses the existing STIIICKS design system with:
- **Colors**: neon-yellow, purple, green, orange, black, white, greys
- **Typography**: Inter font family
- **Components**: Button and accordion components from existing library
- **Icons**: SVG icons for each category

### Future Enhancements

- Real authentication system (Firebase/Supabase)
- Backend API with database
- Real-time notifications
- User profiles and achievements
- Social features (following, sharing)
- Mobile app version

## Browser Support

- Modern browsers with localStorage support
- Responsive design for mobile and desktop
- No external dependencies required
