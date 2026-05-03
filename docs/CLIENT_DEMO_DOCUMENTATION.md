# AI Photo Craft Client Demo Documentation

## 1. Project Overview
AI Photo Craft is a web-based image editing platform that combines classic editing tools with AI-assisted transformations.

The platform is designed for creators, marketers, and business users who want to:
- Upload and manage image projects in the cloud
- Apply manual edits (crop, resize, adjust filters, text)
- Use AI-enhanced editing (background removal, image extension, AI retouch)
- Export final assets in multiple formats

## 2. Business Value
The product delivers value in four key areas:
- Speed: Quickly produce polished visuals without advanced design software
- Accessibility: Browser-based workflow, no desktop installation required
- Scalability: Freemium model supports trial and growth to Pro
- Consistency: Centralized projects and repeatable editing process

## 3. Core User Journey
### 3.1 Landing and Authentication
1. User visits landing page (`/`)
2. User signs up/signs in through Clerk (`/sign-in`, `/sign-up`)
3. Middleware protects app routes and redirects unauthenticated users

### 3.2 Project Creation
1. User opens Dashboard (`/dashboard`)
2. Clicks **New Project**
3. Uploads an image (max 20MB)
4. Image is uploaded via secured API route to ImageKit
5. Project metadata is saved in Convex (title, dimensions, URLs, timestamps)

### 3.3 Editing Workflow
1. User opens project editor (`/editor/[projectId]`)
2. Canvas initializes with Fabric.js
3. Saved canvas state is loaded (if available)
4. User applies manual or AI edits from toolbar/sidebar
5. Canvas changes autosave to Convex (plus manual save button)

### 3.4 Export
1. User chooses export format (PNG/JPEG/WebP)
2. App renders canvas to image client-side
3. Browser downloads file with project title as filename

## 4. Architecture and How It Works
## 4.1 Frontend Layer
- Framework: Next.js App Router (React 19)
- UI: TailwindCSS + shadcn/ui + Radix primitives
- Canvas Engine: Fabric.js
- Notifications: Sonner toasts

What this layer does:
- Handles page routing and UX
- Renders editing interface and controls
- Performs in-browser image/canvas operations
- Invokes backend services for persistence and uploads

## 4.2 Backend/Data Layer
- Backend Platform: Convex
- Data entities: `users`, `projects`, `folders`
- Realtime sync/query hooks through Convex React client

What this layer does:
- Persists projects and user metadata
- Enforces ownership checks per project
- Applies plan limits (project count, export limits)
- Supports near-real-time project retrieval

## 4.3 Authentication and Access Control
- Auth Provider: Clerk
- Protected routes enforced in `middleware.js`
- Convex user records are synced from Clerk identity (`users.store`)

What this layer does:
- Authenticates users
- Restricts dashboard/editor to signed-in users
- Supports plan-based feature access (Free vs Pro)

## 4.4 Media Processing Layer
- File hosting + transformation: ImageKit
- Upload endpoint: `POST /api/imagekit/upload`
- AI transformation effects are applied by building ImageKit transformation URLs

What this layer does:
- Stores uploaded images
- Generates thumbnails
- Performs AI-style background removal/retouch/upscale/extend transforms

## 4.5 External Content
- Unsplash API is used for searchable background images
- Requires `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`

What this layer does:
- Lets users search stock images for canvas background usage

## 5. Data Model
## 5.1 `users` table
Stores:
- Identity fields (name, email, tokenIdentifier, imageUrl)
- Plan (`free` or `pro`)
- Usage counters (`projectsUsed`, `exportsThisMonth`)
- Activity timestamps

## 5.2 `projects` table
Stores:
- Project metadata (title, owner)
- Canvas dimensions and serialized canvas JSON
- Original/current image URLs and thumbnail
- Optional transformation markers and AI flags
- Created/updated timestamps

## 5.3 `folders` table
- Basic optional folder organization per user

## 6. Feature Set and Tool Explanations
## 6.1 Manual Editing Tools (Available on Free)
### Resize
- Purpose: Change canvas dimensions
- Supports custom width/height and preset aspect ratios
- Updates project width/height and saves canvas state

### Crop
- Purpose: Trim image area
- Uses interactive crop rectangle overlay
- Supports ratio presets (1:1, 16:9, 4:5, etc.)

### Adjust
- Purpose: Fine-tune image quality manually
- Controls brightness, contrast, saturation, vibrance, blur, hue
- Uses Fabric.js filter pipeline in real-time

### Text
- Purpose: Add/edit styled text overlays
- Supports font family, size, color, alignment, bold/italic/underline

## 6.2 Pro AI Tools
### AI Background
- Purpose: Remove subject background and set new backgrounds
- Uses ImageKit transform (`e-bgremove`)
- Includes color background and Unsplash image background modes

### AI Image Extender
- Purpose: Expand image edges with generated fill
- Directional extension (top, bottom, left, right)
- Uses ImageKit `bg-genfill` and focus parameters

### AI Editing
- Purpose: Auto-enhancement and upscale presets
- Presets include retouch, upscale, sharpened combinations
- Applies chained ImageKit transformations (e.g., `e-retouch,e-upscale`)

## 6.3 Cross-cutting Editor Tools
### Undo/Redo
- Local undo/redo stack for recent canvas operations

### Save
- Manual save writes latest canvas JSON to Convex

### Export
- Exports PNG/JPEG/WebP
- Free plan logic checks monthly export threshold before allowing export

### Reset to Original
- Restores original uploaded image and clears active transform markers

## 7. Plan and Entitlement Model
## 7.1 Free Plan
- Up to 3 projects
- Up to 20 exports/month
- Access to basic tools

## 7.2 Pro Plan
- Unlimited projects
- Unlimited exports
- Access to AI background, AI extender, AI editing tools

## 7.3 Entitlement Enforcement
- Frontend: feature gating via `usePlanAccess`
- Backend: project creation limits enforced in Convex mutation
- UX: Upgrade modal appears when user hits restricted features

## 8. Security and Compliance Posture
- Auth checks on protected routes
- Server-side verification in upload API route (requires authenticated user)
- Project ownership checks in backend queries/mutations
- Private keys remain server-side in environment variables
- No direct client exposure of ImageKit private key

## 9. Environment Configuration
Required environment variables:
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
- `IMAGEKIT_PRIVATE_KEY`
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` (optional but required for Unsplash search)

## 10. Deployment and Runtime
- Build/runtime: Next.js production build (`npm run build`, `npm start`)
- Convex deployment must be configured and reachable
- Clerk application keys must match environment
- ImageKit endpoint and keys must match storage account

## 11. Known Constraints and Talking Points
- Editor is desktop-only (mobile displays guidance message)
- Export usage display exists, but monthly counter persistence/increment logic should be validated during production hardening
- AI features rely on third-party service availability (ImageKit/Unsplash)
- Canvas state uses JSON serialization; very large projects can increase payload size

## 12. Suggested Demo Script (Client Meeting)
1. Show landing page and positioning
2. Sign in and explain role of secure auth
3. Create new project from uploaded image
4. Demonstrate basic tools quickly: Resize -> Crop -> Adjust -> Text
5. Show Pro tool lock indicators (if on free account)
6. Switch to Pro-capable account and demo:
   - AI Background removal
   - Unsplash background replacement
   - AI Image extension
   - AI Retouch preset
7. Save project, reopen from dashboard, show persistence
8. Export in PNG/JPEG and explain output quality options
9. Close with Free vs Pro model and scalability

## 13. Client FAQ Prep
### Q1: Where are images stored?
- Uploaded source files are stored through ImageKit; project metadata/state is stored in Convex.

### Q2: How is user data secured?
- Authentication is handled by Clerk, protected routes require auth, and backend checks enforce project ownership.

### Q3: Can this support multiple users?
- Yes. The architecture is multi-user by design with user-scoped data and auth identities.

### Q4: What AI engine powers edits?
- AI-style operations are implemented via ImageKit transformation pipeline (background removal, retouch, upscale, extension).

### Q5: Can we control feature access by plan?
- Yes. The app already includes Free/Pro gating and upgrade prompts.

### Q6: Is this mobile-ready?
- Landing pages are responsive, but the editor experience is currently desktop-only.

### Q7: Can projects be resumed later?
- Yes. Canvas state and image references are persisted and reloaded.

### Q8: What file formats are supported?
- Upload accepts common image formats (PNG/JPG/JPEG/WEBP/GIF). Export supports PNG/JPEG/WebP.

### Q9: Can this be extended for enterprise workflows?
- Yes. Architecture supports adding audit logs, team workspaces, billing integrations, approval workflows, and admin controls.

## 14. Recommended Next Steps Before Client Production Rollout
- Add server-side export counter increment/reset logic for strict monthly enforcement
- Add monitoring/logging for API and transformation failures
- Add end-to-end test scenarios for create/edit/save/export flows
- Add role-based admin controls if client requires team governance
- Add backup/recovery and data retention policy documentation

## 15. Technical Reference (Key Paths)
- App shell: `app/layout.js`
- Landing page: `app/page.jsx`
- Route protection: `middleware.js`
- Dashboard: `app/(main)/dashboard/page.jsx`
- Project creation modal: `app/(main)/dashboard/_components/new-project-modal.jsx`
- Editor page: `app/(main)/editor/[projectId]/page.jsx`
- Editor top bar/actions: `app/(main)/editor/[projectId]/_components/editor-topbar.jsx`
- Canvas engine: `app/(main)/editor/[projectId]/_components/canvas.jsx`
- Tool panels: `app/(main)/editor/[projectId]/_components/_tools/*`
- Upload API route: `app/api/imagekit/upload/route.js`
- Convex schema: `convex/schema.js`
- Convex project logic: `convex/projects.js`
- Convex user sync/auth: `convex/users.js`
- Plan access hook: `hooks/use-plan-access.js`

---
If needed, this document can be converted into:
- A one-page executive summary
- A non-technical sales version
- A technical architecture appendix for client engineering teams
