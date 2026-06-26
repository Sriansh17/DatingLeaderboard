# API & Business Rules

## Conventions

- All API responses follow `ApiResponse<T>`: `{ success: boolean, data?: T, error?: string }`
- Paginated responses use `PaginatedResponse<T>`: adds `total`, `page`, `limit`, `has_more`
- Auth is handled via Supabase SSR session cookie (not JWT bearer tokens)
- Admin client (service role) is used for cross-user reads, bypassing RLS
- Error format: `{ success: false, error: string }` with appropriate HTTP status

---

## Auth

### `POST /api/auth/[...supabase]`
- **Action:** Supabase Auth handler
- **Routes handled:** Login, Signup, OAuth callback, Signout
- **Signout:** `{ action: 'signout' }` → calls `supabase.auth.signOut()`
- **GET:** Returns refreshed session cookies

---

## Users

### `GET /api/users`
- **Auth:** Required
- **Returns:** Current user's profile row
- **Logic:** Fetches profile by `auth.uid()`

### `PATCH /api/users`
- **Auth:** Required
- **Body:** Any profile fields
- **Special logic:** Catches `PGRST204` (missing `is_premium` column) → returns 409 with migration instructions
- **⚠️ Risk:** The PostForm premium bypass path (`handleUpgradeToPremium`) sets `is_premium: true` via this endpoint without payment

### `GET /api/users/me`
- **Auth:** Optional (returns null if not authenticated)
- **Returns:** `{ user, profile }` — used by AuthProvider on mount
- **Behavior:** Creates Supabase client from cookies, if no session returns `{ user: null, profile: null }`

### `GET /api/users/[id]`
- **Auth:** Optional (viewer must be authenticated for connection status)
- **Returns:** Public profile + public posts + partners + stats + connection_status
- **Connection status:** one of `none | pending_sent | pending_received | connected`
- **Premium check:** If viewer has premium, shows extended data

### `GET /api/users/search`
- **Query:** `q` (min 2 chars)
- **Logic:** Uses admin client, `ILIKE` search on `username` or `full_name`
- **Limit:** 20 results
- **⚠️ Performance:** `ILIKE` without index will degrade on scale

### `GET /api/users/stats`
- **Auth:** Required
- **Returns:** `post_count`, `average_score`, `partner_count`
- **Logic:** Counts posts (non-archived, public), averages scores, counts partners

---

## Posts

### `POST /api/posts`
- **Auth:** Required
- **Body:** `{ partner_id, description, is_public?, timezone_offset_minutes? }`
- **Validation:**
  - Description min 30 chars
  - Non-premium users: max 2 posts per day (computed from timezone offset)
- **Business Logic:**
  1. Validates partner belongs to user
  2. Checks daily post limit
  3. Creates post row
  4. Runs AI scoring (`scorePost()`)
  5. If flagged → returns 400 with `flag_reason`
  6. Snapshots user's city to `post_city`
  7. Returns `{ post, aiResult }`

### `GET /api/posts`
- **Auth:** Required
- **Returns:** Current user's own non-archived posts

### `GET /api/posts/[id]`
- **Auth:** Optional (for public posts)
- **Returns:** Post + profile + partner + likes_count + comments_count + views_count + has_liked

### `PATCH /api/posts/[id]`
- **Auth:** Required (must be post owner)
- **Body:** Any post fields
- **Rules:**
  - Archive toggle (`is_archived`) is FREE
  - All other edits require premium
  - Description change triggers RE-SCORING
  - Returns error if flagged

### `DELETE /api/posts/[id]`
- **Auth:** Required (must be post owner)
- **Behavior:** Soft delete — sets `is_archived = true`

### `GET /api/posts/feed`
- **Query:** `page`, `limit`
- **Returns:** Paginated public posts with AI scores
- **Joins:** Profile, partner, likes count, comments count, has_liked

### `GET /api/posts/explore`
- **Returns:** Latest 50 public posts
- **Auth:** Optional (checks session for has_liked)
- **Special:** Uses `force-dynamic` — no caching

### `GET /api/posts/circle-feed`
- **Auth:** Required
- **Logic:** Finds user's circles → gets all members → fetches their public posts
- **Limit:** 50 posts
- **Special:** Uses `force-dynamic`

### `POST /api/posts/[id]/like`
- **Auth:** Required
- **Behavior:** Toggle — if liked → unlike (delete), if not liked → insert
- **Returns:** `{ liked: true/false }`

### `POST /api/posts/[id]/view`
- **Auth:** Optional
- **Behavior:** Increments `views_count`
- **⚠️ Bug:** Read-then-write pattern — race condition under concurrent requests

### `GET /api/posts/[id]/comments`
- **Query:** `sort` (popular|recent)
- **Returns:** Top-level comments with nested `replies[]` array
- **Joins:** Profile on each comment

### `POST /api/posts/[id]/comments`
- **Auth:** Required
- **Body:** `{ content, parent_id? }` (parent_id for threaded replies)

### `PATCH /api/posts/[id]/comments/[commentId]`
- **Auth:** Required (must be comment owner for content edits)
- **Operations:** `votes` (set count), `reaction` (increment emoji), `content` (edit text)
- **⚠️ Votes uses SET not INCREMENT** — directly sets vote count instead of atomic increment

### `DELETE /api/posts/[id]/comments/[commentId]`
- **Auth:** Required (must be comment owner)

---

## Partners

### `POST /api/partners`
- **Auth:** Required
- **Body:** `{ name, relationship, emoji?, avatar_url? }`
- **Rules:**
  - Free users: max 1 partner
  - Premium users: unlimited
  - Exceed limit → returns 403 with `PREMIUM_REQUIRED` code

### `PATCH /api/partners/[id]`
- **Auth:** Required (must be owner)
- **Body:** Any partner fields

### `DELETE /api/partners/[id]`
- **Auth:** Required (must be owner)

---

## Leaderboards

### `GET /api/leaderboards`
- **Query:** `type` (global|local|city|country), `latitude`, `longitude`, `city`, `country`, `page`, `limit`
- **Logic:**
  1. Query all profiles with posts
  2. Compute average_score per user
  3. Filter by `MIN_POSTS_FOR_LEADERBOARD` (1)
  4. Location filter: local uses Haversine (10km radius), city uses string match
  5. Sort by score desc → assign ranks → paginate (50/page)
  6. Cache in Redis with 5-minute TTL
- **⚠️ Cache is disabled** — every request hits the database
- **Performance risk:** O(n) over all users + posts on every request

### `POST /api/leaderboards/refresh`
- **Auth:** Required (no admin check — any authenticated user can flush cache)
- **Behavior:** Calls `invalidateLeaderboardCache()`

---

## Circles

### `POST /api/circles`
- **Auth:** Required
- **Body:** `{ name, emoji?, passcode?, expires_in_hours? }` (default expires 24h)
- **Logic:** Generates 8-char alphanumeric code, retries on collision
- **Limits:** `max_members = 10`, creator added as `creator` role

### `GET /api/circles/[id]`
- **Auth:** Required (must be member)
- **Returns:** Circle with creator + members profiles, member_count

### `DELETE /api/circles/[id]`
- **Auth:** Required (must be creator)
- **Behavior:** Cascade deletes members

### `POST /api/circles/join`
- **Body:** `{ code, passcode? }`
- **Validation:**
  - Code exists
  - Not expired
  - Passcode matches (if required)
  - Not already a member
  - Member count not exceeded
- **Side effect:** Sends `clique_joined` notification to creator

### `POST /api/circles/[id]/members`
- **Auth:** Required (must be creator or admin)
- **Body:** `{ user_id }`
- **Side effect:** Sends `clique_invite` notification

### `DELETE /api/circles/[id]/members`
- **Auth:** Required (creator for others, anyone for self)
- **Rule:** Creator cannot be removed

---

## Connections

### `POST /api/connections/requests`
- **Body:** `{ receiver_id }`
- **Validation:** No self-requests, no duplicate, not already connected
- **Side effect:** Sends `connection_request` notification

### `PATCH /api/connections/requests/[id]`
- **Body:** `{ status }` (accepted|rejected)
- **Logic on accept:** Inserts bidirectional connection rows, sends `connection_accepted` notification

---

## Confessions

### `GET /api/confessions`
- **Returns:** Up to 50 approved confessions
- **Computed fields:** `reaction_counts`, `user_reaction`, `is_confession_of_day` (most reactions in 24h, min 2), `replies_count`
- **Sort:** Confession of the day first, then by `created_at` desc

### `POST /api/confessions`
- **Auth:** Required
- **Validation:** Content min 10 chars
- **Note:** Confessions are pre-approved (`is_approved: true` set by default)

### `POST /api/confessions/[id]/react`
- **Body:** `{ reaction }` (peek|spicy|relatable|dead|wholesome)
- **Behavior:** Three-way toggle:
  - Same reaction → removes it
  - Different reaction → updates it
  - No existing → inserts

### `POST /api/confessions/[id]/replies`
- **Auth:** Required
- **Validation:** Content max 500 chars
- **Anonymization:** Reply identity is computed as deterministic emoji + color from hash of `(user_id, confession_id)`

---

## AI Scoring

### `POST /api/ai/score`
- **Body:** `{ description }` (min 10 chars)
- **Delegates to:** `scorePost()` in `lib/ai/scoring.ts`
- **Returns:** Full `AIScoreResult` or 400 if flagged

### `scorePost()` (scoring.ts)
- **Model:** DeepSeek `deepseek-v4-flash`
- **System Prompt:** Fond AI persona — sassy, dramatic, "has seen every rom-com"
- **5 Scoring Dimensions:**
  | Dimension | Max | Description |
  |-----------|-----|-------------|
  | Thoughtfulness | 30 | How well did they know you? |
  | Effort | 25 | What did they give of themselves? |
  | Creativity | 20 | Was it inventive or unexpected? |
  | Emotional Weight | 15 | Did it land deep or bounce off? |
  | Authenticity | 10 | Selfless love, or for the photo? |
- **Guardrails:** Rejects gibberish, impossible acts, non-gestures, self-promotion, prompt injection, fabricated stories
- **Fallback:** Returns score of 50 on API failure (silent failover)

---

## Payments

### `POST /api/payments/razorpay/order`
- **Body:** `{ plan_id }` (premium_monthly|premium_yearly)
- **Validation:** Rejects free plans (price <= 0)
- **Returns:** Razorpay order ID, amount, currency

### `POST /api/payments/razorpay/verify`
- **Body:** `{ orderId, paymentId, signature, plan_id }`
- **Logic:** HMAC SHA-256 signature verification, then:
  1. Upsert subscription record (status: active)
  2. Set `profile.is_premium = true`
- **Returns:** Plan details, premium status

---

## Notifications

### `GET /api/notifications`
- **Query:** `page`, `limit` (max 50)
- **Sort:** Unread first, then newest first

### `POST /api/notifications/read`
- **Behavior:** Marks all user's notifications as read

### `GET /api/notifications/unread-count`
- **Returns:** `{ count: number }`

### Notification Types
| Type | Triggers | Status |
|------|----------|--------|
| `connection_request` | Someone sends connection request | ✅ Implemented |
| `connection_accepted` | Connection request accepted | ✅ Implemented |
| `clique_invite` | Invited to circle | ✅ Implemented |
| `clique_joined` | Someone joined your circle | ✅ Implemented |
| `post_like` | Someone liked your post | ❌ NOT implemented (type not in schema, no trigger) |
| `post_comment` | Someone commented on your post | ❌ NOT implemented (type not in schema, no trigger) |

---

## Business Rules Summary

| Rule | Enforcement | Location |
|------|------------|----------|
| Free users: max 2 posts/day | Server-side | `POST /api/posts` |
| Free users: max 1 partner | Server-side | `POST /api/partners` |
| Post edit requires premium | Server-side | `PATCH /api/posts/[id]` |
| Post min 30 chars | Client + Server | `PostForm.tsx`, `POST /api/posts` |
| Daily post limit: timezone-based | Server-side | `POST /api/posts` (uses `timezone_offset_minutes`) |
| Leaderboard min 1 post | Server-side | `GET /api/leaderboards` |
| Circle max 10 members | Server-side | `POST /api/circles` |
| Confession min 10 chars | Server-side | `POST /api/confessions` |
| Circle invite expires default 24h | Server-side | `POST /api/circles` |
| Streak freeze: 1/month (premium) | Client-side | `streak.ts` (override logic) |
