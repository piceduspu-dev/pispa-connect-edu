# PISPA Connect

A comprehensive educational platform for PISPA (Pasukan Institusi Pertahanan Awam Malaysia) students, built with Next.js and Firebase.

## Features

- **Role-based Authentication**: Admin and Student user roles
- **File Management**: Upload and organize learning materials, drill guides, and activity files
- **Student Dashboard**: Access learning materials and track progress
- **Admin Dashboard**: Manage content and view analytics
- **Responsive Design**: Google Classroom-inspired UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Authentication, Firestore, and Storage enabled
- Firebase configuration in `.env.local`

### Environment Setup

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Security Rules

After setting up your Firebase project, apply the security rules from the project files:

1. **Firestore Rules**: Copy contents from `firestore.rules` to:
   - Firebase Console → Firestore Database → Rules

2. **Storage Rules**: Copy contents from `storage.rules` to:
   - Firebase Console → Storage → Rules

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── student/           # Student-specific components
│   ├── dashboard/         # Dashboard components
│   └── debug/             # Debug utilities
├── contexts/              # React contexts (Auth)
├── lib/                   # Utility functions (Firebase, Auth, Storage)
└── types/                 # TypeScript type definitions
```

## Security Rules Overview

### Firestore Rules (`firestore.rules`)
- **Public read access** for files and activities
- **Admin-only write access** for content management
- **User-specific access** for profiles and progress

### Storage Rules (`storage.rules`)
- **Public read access** for educational content
- **Admin upload** for learning materials and drill guides
- **User + Admin upload** for profile photos

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
