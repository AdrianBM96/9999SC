# LinkedIn Integration Setup

This guide explains how to set up the LinkedIn OAuth integration for your application.

## Prerequisites

1. A LinkedIn Developer Account
2. A registered LinkedIn Application

## Configuration Steps

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Create a new app or select your existing app
3. Get your OAuth 2.0 credentials:
   - Client ID
   - Client Secret
4. Configure OAuth 2.0 settings:
   - Add redirect URI: `http://localhost:3000/auth/linkedin/callback`
   - Request the following OAuth 2.0 scopes:
     - r_liteprofile
     - r_emailaddress
     - w_member_social

## Environment Variables

Update the `.env` file with your LinkedIn OAuth credentials:

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

## Implementation Details

The integration consists of the following files:
- `unileap.ts`: Handles LinkedIn OAuth URL generation
- `settingsService.ts`: Manages LinkedIn connection/disconnection
- `AccountsSettings.tsx`: React component for the UI
- `types.ts`: TypeScript interfaces

## Common Issues

If you see the error "Unileap configuration is missing", make sure:
1. The `.env` file exists and contains all required variables
2. The environment variables are properly loaded in your application
3. The LinkedIn OAuth credentials are correct

## Testing

1. Start your application
2. Go to Settings > Connected Accounts
3. Click "Connect LinkedIn"
4. You should be redirected to LinkedIn's authorization page
5. After authorization, you'll be redirected back to your application

## Support

If you encounter any issues:
1. Check the console for detailed error messages
2. Verify your LinkedIn App settings
3. Ensure all environment variables are properly set
4. Check if the redirect URI matches exactly with the one configured in LinkedIn App