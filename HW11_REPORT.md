# HW11 - Improvements Based on User Feedback

## What I changed in the app

### 1) Clarified the app purpose on the home page
- Updated the landing headline and supporting copy to explain the full purpose: browse captions, vote, and generate jokes from images.
- Added clearer section titles so users can quickly understand what each part of the app does.

Why: In all 3 studies, users were unsure whether the app was mainly a gallery, voting platform, or joke generator.

### 2) Made sign-in value explicit
- Replaced vague gated-route language with direct messaging:
  - Browsing/searching gallery is available without signing in.
  - Signing in unlocks image upload, joke generation, and saved history.
- Updated call-to-action labels to describe what users get after login ("Open Joke Generator" instead of generic gated wording).

Why: Users repeatedly asked what signing in would unlock and hesitated before using Google sign-in.

### 3) Exposed joke generation before login
- Added a visible "Generate jokes from your own image" feature card directly on the home page.
- Kept the generator itself in the protected area, but made the feature discoverable before authentication.

Why: Users did not discover joke generation on their own and questioned why it was hidden.

### 4) Improved post-login orientation in the protected page
- Reworded the protected page header so users immediately know they are in the joke-generation workspace.
- Updated button and section language to focus on generating jokes from uploaded images.

Why: One user felt briefly disoriented after sign-in and needed time to understand where they landed.

## Files updated
- `app/page.tsx`
- `app/protected/page.tsx`
- `app/layout.tsx`

## Vercel Links (commit-specific)
- Caption creation + rating app: <ADD_URL>
- Admin area app: <ADD_URL>
- Prompt chain tool app: <ADD_URL>
