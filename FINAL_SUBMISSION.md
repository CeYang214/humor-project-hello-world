# Final Submission (April 24, 2026)

## Commit-Specific URLs (3 Apps)

- Caption creation + rating app: https://humor-project-hello-world-33r5qre10-cecilia-yangs-projects.vercel.app
- Admin area app: https://humor-project-part-2-pglky8u1i-cecilia-yangs-projects.vercel.app
- Prompt chain tool app: https://humor-project-part-3-i0r7dydll-cecilia-yangs-projects.vercel.app

## Full QA / Test Plan (Tree by App)

### Project 1: Caption Creation + Rating App (`humor-project-hello-world`)

- Branch A: Public home and gallery
  - Load `/` and verify hero copy + CTA rendering
  - Validate caption gallery skeleton-to-data transition
  - Validate caption search input submit behavior
  - Validate pagination: next, previous, direct page jump
- Branch B: Public vs authenticated behavior
  - Unauthenticated user can browse/search but is redirected off protected route
  - OAuth sign-in button starts Google flow (`/auth/callback` redirect chain)
- Branch C: Voting flow
  - Authenticated vote up/down persistence
  - Vote status messaging (`saving/success/error`) per caption card
  - Existing user vote hydration on reload
- Branch D: Protected generator flow
  - Upload image type validation (jpg/png/webp/gif/heic)
  - Presigned URL generation + upload + pipeline invoke
  - Generated captions persistence and history grouping by image
  - Error-state messaging for failed API/storage paths
- Branch E: Resilience
  - Supabase initialization failure fallback UI
  - Invalid refresh token cleanup path

### Project 2: Admin Area App (`Humor_Project_Part-2`)

- Branch A: Access control
  - `/admin*` guarded for unauthenticated users (redirect)
  - Signed-in non-admin rejection path
  - Superadmin access path success
- Branch B: Admin dashboard
  - KPI/stat cards load with expected counts
  - No-data and partial-data states
- Branch C: Users management (`/admin/users`)
  - Read-only users/profiles table renders
  - Paging/filter/sort behavior where available
- Branch D: Images management (`/admin/images`)
  - Create/read/update/delete image records
  - Upload path + URL hydration validation
- Branch E: Captions + ratings
  - Captions table read flow
  - Ratings stats route rendering and aggregate correctness
- Branch F: Operations area
  - Generic entity operations route rendering
  - CRUD actions per entity with server action error handling

### Project 3: Prompt Chain Tool App (`Humor_Project_Part-3`)

- Branch A: Access and navigation
  - `/admin*` route gating and redirect behavior
  - Admin nav visibility for humor-flavor tooling
- Branch B: Humor flavors (`/admin/humor-flavors`)
  - Flavor CRUD operations
  - Flavor step CRUD and ordering/reordering
  - Persisted ordering reflected after reload
- Branch C: Prompt-chain tester
  - Test image selection/upload path
  - Prompt chain execution request path to pipeline API
  - Generated caption result rendering and persistence
- Branch D: Supporting admin entities
  - Read/write paths for terms, providers/models, examples, allowlists
  - Error banners for invalid payload/schema mismatch
- Branch E: UI/system behavior
  - Light/dark/system theme mode switching
  - Long-running operation status and retry/error handling

## Post-Testing Write-Up (What Was Tested, Issues Found, Fixes)

- Ran **3 full local workflow passes** across all three repositories (`npm run lint` + `npm run build` each pass); all passes completed without build errors after fixes.
- Ran **3 runtime smoke passes** per repo by launching each app locally and validating key routes (`/`, `/protected`, `/admin`, `/admin/humor-flavors`) with expected status behavior.
- Ran **3 deployed smoke passes** against the three submitted Vercel URLs for root/protected/auth-callback/admin/prompt-chain route behavior.
- Found and fixed a blocking issue in Project 3 local environment: missing `.env.local` caused build failure (`@supabase/ssr` missing URL/API key). Fixed by adding the same Supabase env configuration used in Projects 1/2; build then passed consistently.
- Confirmed protected-route middleware behavior is stable across projects (unauthenticated requests redirect to `/`; auth callback redirects toward `/protected`).
- Confirmed Project 1 public flow is stable: home page marker text renders consistently and unauthenticated gating behavior works as expected.
- Identified non-blocking lint warnings remaining for optimization/refinement (not failures): `next/no-img-element` warnings (Project 1 + Project 3) and one `react-hooks/exhaustive-deps` warning (Project 3).
- Deployment-level observation: submitted Project 2/3 URLs are reachable and stable, but route/content differentiation should be re-verified before grading to ensure each URL maps to the intended app role (admin vs prompt-chain).
