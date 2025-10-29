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
- **Frontend**: Svelte 5 with Vite bundler
- **Storage**: localStorage for client-side persistence
- **Authentication**: Client-side only (email-based)
- **Styling**: CSS custom properties with existing design system
- **State Management**: Svelte stores for reactive state

### File Structure
```
├── index.html              # Login page
├── challenges.html         # Main challenges page
├── admin.html             # Admin panel
├── src/
│   ├── main.js            # Login page entry
│   ├── challenges.js      # Challenges page entry
│   ├── admin.js           # Admin page entry
│   ├── components/        # Svelte components
│   │   ├── Login.svelte
│   │   ├── Challenges.svelte
│   │   ├── Admin.svelte
│   │   ├── CategoryButton.svelte
│   │   └── ChallengeItem.svelte
│   └── stores/            # Svelte stores
│       ├── auth.js        # Authentication state
│       └── storage.js     # Data management
├── styles/
│   ├── login.css         # Login page styles
│   ├── challenges.css    # Main page layout
│   ├── category-buttons.css # Category button styles
│   └── challenge-states.css # Challenge state styles
├── assets/               # SVG icons
├── components/           # Existing component library
├── config.css           # Color variables
├── base.css             # Base styles
├── vite.config.js       # Vite configuration
└── svelte.config.js     # Svelte configuration
```

### Getting Started

#### Development
1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Open your browser to the local URL shown (typically http://localhost:3000)

#### Production Build
1. Build the app: `npm run build`
2. Preview the build: `npm run preview`
3. Deploy the `dist/` folder to your hosting service

#### Using the App
1. Enter any email address and password to log in
2. Browse challenges by category
3. Submit URLs for completed challenges
4. Use the Admin panel to approve submissions

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

## Technical Stack

- **Svelte 5**: Modern reactive frontend framework
- **Vite**: Fast build tool and dev server
- **CSS Custom Properties**: For theming and design tokens
- **localStorage**: Client-side data persistence

## Browser Support

- Modern browsers with localStorage and ES6+ support
- Responsive design for mobile and desktop
