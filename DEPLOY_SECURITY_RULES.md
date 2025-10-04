# Deploying Firebase Security Rules

## Prerequisites

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase project** (if not already done):
   ```bash
   firebase init
   ```

## Security Rules Files Created

✅ **Firestore Rules**: `firestore.rules`
✅ **Storage Rules**: `storage.rules`

## Deployment Commands

### Deploy Firestore Rules Only
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules Only
```bash
firebase deploy --only storage:rules
```

### Deploy Both Rules
```bash
firebase deploy --only firestore:rules,storage:rules
```

## Security Rules Summary

### Firestore Rules (`firestore.rules`)

**Access Levels:**
- **Admin**: Full CRUD access to all collections
- **Student**: Read-only access to students, learning materials, and activities
- **Unauthenticated**: No access

**Protected Collections:**
- `users/` - User profiles and authentication data
- `students/` - PISPA student records
- `learningMaterials/` - APM learning materials
- `activities/` - PISPA activities and events
- `categories/` - Content organization

### Storage Rules (`storage.rules`)

**File Access:**
- **Admin**: Full access to all storage folders
- **Student**: Read access to learning materials, write access to own photos
- **Unauthenticated**: No access

**Protected Folders:**
- `learning-materials/` - APM learning materials
- `drill-guides/` - Drill and marching guides
- `student-photos/` - Student profile photos
- `activity-media/` - Activity images and videos

**File Size Limits:**
- Documents & Images: 10MB
- Videos: 50MB
- Admins can override limits if needed

## Testing Security Rules

### After Deployment

1. **Check Firebase Console**:
   - Go to Firestore Database → Rules tab
   - Verify rules are published
   - Go to Storage → Rules tab
   - Verify storage rules are published

2. **Run Tests**:
   ```bash
   # Start development server
   npm run dev

   # Visit test page
   http://localhost:3000/test-firebase
   ```

3. **Manual Testing**:
   - Try accessing collections without authentication (should fail)
   - Test admin operations with admin account
   - Test student operations with student account

### Common Issues

**Permission Denied Errors:**
- Verify Firebase Authentication is properly set up
- Check user roles are correctly assigned
- Ensure rules are deployed correctly

**Storage Access Issues:**
- Verify Storage bucket name matches your Firebase project
- Check file paths match the rules exactly
- Ensure proper content-type headers

## Security Best Practices

1. **Regular Monitoring**:
   - Monitor Firebase Console for rule violations
   - Check usage patterns and access logs

2. **Rule Updates**:
   - Test rules in development first
   - Deploy to staging before production
   - Keep rule versions in git

3. **User Management**:
   - Implement proper role assignment
   - Use custom claims for role management
   - Regular audit user permissions

## Next Steps

After deploying security rules:

1. [ ] Set up Firebase Authentication with custom claims
2. [ ] Implement user registration and login
3. [ ] Create admin dashboard
4. [ ] Build student interface
5. [ ] Implement file upload functionality

## Support

If you encounter issues:

1. Check Firebase Console for error messages
2. Verify your Firebase project configuration
3. Review Firebase documentation on security rules
4. Test with different user roles and scenarios