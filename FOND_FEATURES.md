# Fond — Feature Documentation

## Navigation

### AppDock (Primary Navigation)
The AppDock is the main navigation bar, visible on all signed-in pages. It floats at the bottom of the screen.

| Icon | Tab | Route | Description |
|------|-----|-------|-------------|
| 🏠 | Feed | `/dashboard` | Global & circle feed of verdicts |
| 🏆 | Ranks | `/leaderboards` | Leaderboard with podium + table |
| ➕ | FAB | `/posts/new` | Create a new post (floating action button) |
| 🔗 | Bond | `/circles` | Cliques/groups + inner circle connections |
| 💕 | Partners | `/partners` | Manage relationship partners |
| 👤 | Profile | `/profile` | Personal profile with stats & verdicts |

### Sparkle Panel (✨)
Opened by tapping the ✨ icon in the AppDock. Contains:
- **Atmosphere controls**: Change visual ambiance (Soft Blush, Mesh Rose, etc.)
- **Particles toggle**: Enable/disable floating particles
- **Theme toggle**: Light/Dark mode
- **Quick Links**: Settings, Meet the Creators

### Notification Bell 🔔
A floating bell icon appears at the top of every signed-in page. Shows unread count badge. Click to open dropdown with 5 most recent notifications. "View All" link goes to `/notifications`.

---

## Post Detail Page — Magazine Layout

### Layout (Desktop lg+)
```
┌──────────────────────┬──────────────────────────┐
│  ⭕ Score Hero       │  ✨ AI Verdict            │
│  @user × partner 💖  │  "The verdict"           │
│  #1 Globally 🏆      │                          │
│                      │  📊 Score Breakdown      │
│  ♥ 42  |  💬 3       │  Thoughtfulness ██       │
│                      │  Effort ██████           │
│      [📤 Share]      │                          │
│      [✏️ Edit]       │                          │
│      [🗑️ Archive]    │                          │
│                      │                          │
│  📋 Post Details     │                          │
│  Posted · Status · # │                          │
│                      │                          │
│  📖 Original Story   │                          │
│  "...story..."        │                          │
└──────────────────────┴──────────────────────────┘
```

### Action Pill
A compact glass pill between stats and the story. Contains Share (always visible), Edit + Archive (only for post owner). Share button uses `shadow-glow` rose styling.

### Post Details Card
Shows: Posted date, Status (Public/Private), Location, Verdict №.

---

## Comment System

### Components

| Component | Location | Features |
|-----------|----------|----------|
| `CommentCard` | `components/ui/CommentCard.tsx` | Vote, reactions, reply, edit, delete, @mention, thread preview |
| `CommentInput` | `components/ui/CommentInput.tsx` | Two-part input box with emoji picker, @mention autocomplete |
| `CommentModal` | `components/ui/CommentModal.tsx` | Modal overlay for feed comments — Popular/Recent sort |

### CommentCard Layout
```
┌────────── glass-1 rounded-2xl ──────────────────────┐
│ 🅰  @username · 5h ago                     [⋯]     │
│                                                     │
│   Comment text with @mention (pink, clickable)      │
│                                                     │
│  [▲ 12 ▼]  [❤️ 3]  [🔥 1]  😊  Reply               │
│                                                     │
│  ┌── Reply input with @mention autocomplete ──────┐ │
│  │  🅰  @user...  [dropdown]              [➤]     │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ── Thread Preview ────────────────────────────────  │
│  🅰 @user · 2h ago                         [⋯]     │
│   Reply text                                          │
│  🅰🅱 +2 replies → (click to expand)                │
└─────────────────────────────────────────────────────┘
```

### Features

| Feature | Frontend | API | DB |
|---------|----------|-----|-----|
| **Create comment** | `CommentInput` + `CommentModal` | `POST /api/posts/{id}/comments` | `comments` table |
| **Fetch comments** | `GET` on modal/post detail | `GET /api/posts/{id}/comments` | `comments` table |
| **Vote ▲/▼** | Optimistic local state, syncs via PATCH | `PATCH /api/posts/{id}/comments/{cid}` → `{ votes: N }` | `comments.votes` |
| **Reactions ❤️🔥** | Optimistic, toggle on/off, hides at 0 | `PATCH /api/posts/{id}/comments/{cid}` → `{ reaction: '❤️' }` | `comments.reactions` (jsonb) |
| **Reply** | Inline input → `@username` prefix → POST | `POST /api/posts/{id}/comments` | `comments.parent_id` |
| **Edit** | Inline textarea → Save/Cancel | `PATCH /api/posts/{id}/comments/{cid}` → `{ content: '...' }` | `comments.content` |
| **Delete** | Confirm modal → DELETE | `DELETE /api/posts/{id}/comments/{cid}` | Removes row |
| **@ Mention** | Real user search + dropdown + pink pill | `GET /api/users/search?q=` | `profiles` table |
| **Thread preview** | First reply shown, +N expand button | N/A (local state) | `comments.parent_id` |

### Vote Logic
| Action | Result |
|--------|--------|
| Click ▲ (neutral) | `voted = 'up'`, count +1, turns rose |
| Click ▲ again | `voted = null`, count -1 |
| Click ▼ (neutral) | `voted = 'down'`, count -1 (min 0) |
| Click ▼ again | `voted = null`, count +1 (unless was clamped at 0) |
| Switch ▲ → ▼ | count -2 |
| Switch ▼ → ▲ | count +2 |
| Count = 0, click ▼ | Stays 0 (clamped), undo also stays 0 |

### Reaction Logic
| Action | Result |
|--------|--------|
| Click existing emoji pill (not reacted) | count +1, pill stays |
| Click existing emoji pill (already reacted) | count -1, pill hides at 0 |
| Click 😊 picker | Shows popup with 6 emojis |
| Pick emoji | Adds reaction pill with count 1 |
| Click same emoji again | Toggles off, count -1 |

### Reply Thread Preview
- First reply is always visible
- Additional replies show as: `🅰🅱 +2 replies` with stacked mini-avatars
- Click to expand all nested replies
- Uses `expandedReplies` local state

---

## Notifications System

### Database Schema
Notifications are stored in a `notifications` table with:
- `id` (uuid, primary key)
- `user_id` (uuid, recipient)
- `actor_id` (uuid, who triggered it)
- `type` (string — notification type identifier)
- `reference_id` (uuid, optional — links to post/comment/circle)
- `read` (boolean)
- `created_at` (timestamp)

### Notification Types — Complete List

#### Post Notifications
| Type Key | Text | Priority | API Trigger |
|----------|------|:--------:|-------------|
| `post_like` | `@{actor} liked your verdict` | High | `POST /api/posts/{id}/like` |
| `post_comment` | `@{actor} commented: "{snippet}"` | High | `POST /api/posts/{id}/comments` |
| `comment_reply` | `@{actor} replied to your comment` | Medium | `POST /api/posts/{id}/comments` (has parent_id) |
| `comment_mention` | `@{actor} mentioned you in a comment` | High | `POST /api/posts/{id}/comments` (contains @username) |
| `comment_reaction` | `@{actor} reacted {emoji} to your comment` | Medium | `PATCH /api/posts/{id}/comments/{cid}` |
| `post_fabricated` | `⚠️ Your post was flagged as potentially fabricated` | Low | AI scoring pipeline |
| `post_rank_reached` | `🏆 Your verdict hit #1 in {city}!` | Low | Leaderboard calculation |

#### Connection Notifications
| Type Key | Text | Priority | API Trigger |
|----------|------|:--------:|-------------|
| `connection_request` | `@{actor} wants to connect with you` | High | `POST /api/connections` |
| `connection_accepted` | `@{actor} accepted your connection request` | Medium | `PATCH /api/connections/requests/{id}` |

#### Circle/Bond Notifications
| Type Key | Text | Priority | API Trigger |
|----------|------|:--------:|-------------|
| `clique_invite` | `@{actor} invited you to "{circle}"` | High | `POST /api/circles/{id}/members` |
| `clique_joined` | `@{actor} joined "{circle}"` | Low | `POST /api/circles/join` |
| `clique_rank_update` | `New rankings are in for "{circle}"` | Low | Leaderboard calculation |

#### Leaderboard Notifications
| Type Key | Text | Priority | API Trigger |
|----------|------|:--------:|-------------|
| `rank_top10_city` | `You're now top 10 in {city}! 🎉` | Medium | Leaderboard calculation |
| `rank_top100_global` | `You're now top 100 globally! 🌍` | Medium | Leaderboard calculation |
| `rank_overtaken` | `@{actor} overtook you for #{rank} in {scope}` | Low | Leaderboard calculation |
| `tier_earned` | `You've reached "{tier}" tier! {emoji}` | High | AI scoring pipeline |

#### Streak Notifications
| Type Key | Text | Priority | API Trigger |
|----------|------|:--------:|-------------|
| `streak_at_risk` | `Your streak is at risk! Post today to keep it alive.` | Medium | Daily cron check |
| `streak_milestone` | `{N}-day streak! You're on fire! 🔥` | Medium | Post creation check |
| `streak_lost` | `Your streak was broken after {N} days 💔` | Low | Daily cron check |
| `streak_restored` | `Your streak has been restored to {N} days!` | Low | Streak restore API |

#### Premium/Account Notifications
| Type Key | Text | Priority | API Trigger |
|----------|------|:--------:|-------------|
| `premium_activated` | `Welcome to Premium! ✨ All features unlocked` | High | Payment verification |
| `premium_expiring` | `Your Premium expires in 3 days` | Medium | Daily cron check |
| `premium_expired` | `Your Premium has expired. Downgraded to Free.` | Low | Subscription check |
| `post_limit_reached` | `You've used your 2 free posts for today. Upgrade for unlimited.` | Low | Post creation check |

#### System Notifications
| Type Key | Text | Priority | API Trigger |
|----------|------|:--------:|-------------|
| `welcome` | `Welcome to Fond! Post your first story to get your score.` | High | Signup completion |
| `new_feature` | `New: you can now {feature}! ✨` | Low | Manual broadcast |

---

## Share Card (Social Media Image)

The `ShareCard` component generates a 540×960 PNG image for sharing on Instagram, WhatsApp, etc.

### Design
- Dark velvet background with rose/gold ambient glow orbs
- Score circle with dramatic outer glow
- Tier badge (gold-bordered pill)
- Verdict quote in Playfair Display italic
- Rose-gold gradient progress bar
- Attribution: `@username × emoji partnerName`
- CTA badge: "✦ Your Relationship Has a Score ✦"
- Saved as `fond-{score}.png`

### Share Flow
1. Click "Share Score Card" button
2. Canvas renders the design
3. Native share dialog (Web Share API) — includes image + text
4. Fallback: downloads the PNG directly

---

## CommentInput Component

### Two-Part Design
```
┌──────────────────────────────────────────┐
│ 🅰  Leave a love note...                  │ bg-muted/20 (top)
├──────────────────────────────────────────┤
│ 😊  @                        [➤ send]   │ bg-elevated/60 (toolbar)
└──────────────────────────────────────────┘
```

### Features
- **Avatar**: User's avatar in the input area (or fallback icon)
- **Emoji picker**: 6 quick emojis — ❤️🔥😂😍💀👏
- **@ Mention**: Real-time user search, dropdown with avatars + usernames. Insert as `@username ` with trailing space.
- **Send button**: Muted when empty. Rose + `shadow-glow` when text is typed.
- **Keyboard**: Enter to submit. Escape to close mention dropdown.

---

## Database Migrations

### Comment Enhancements
File: `supabase-migration-comment-enhancements.sql`
Run via: `node scripts/migrate.mjs "$(cat supabase-migration-comment-enhancements.sql)"`

Adds to `comments` table:
- `votes` — integer, default 0 — upvote/downvote count
- `reactions` — jsonb, default `{}` — emoji reaction counts: `{"❤️": 3, "🔥": 1}`
- `parent_id` — uuid, FK → comments(id) — for nested reply threading
