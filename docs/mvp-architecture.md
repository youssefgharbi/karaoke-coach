# Karaoke Coach MVP Architecture

## Product statement

Karaoke Coach helps singers rehearse songs with synchronized lyrics, transpose songs to a comfortable key, and receive simple real-time pitch feedback.

## MVP boundaries

### Included

- Email/password authentication
- User-owned songs
- Timed lyric lines per song
- Karaoke practice view with current and next lyric
- Semitone transposition setting
- Basic pitch feedback status: on pitch, flat, sharp
- Practice session summary

### Not in the first version

- Advanced vocal scoring
- Audio pitch shifting of the playback track
- Lyrics scraping from third-party services
- Social features

## Frontend modules

- `app/`: router, providers, layout
- `features/auth/`: login and registration
- `features/dashboard/`: user overview and quick stats
- `features/songs/`: song library and song editor
- `features/lyrics/`: timed lyric editing
- `features/karaoke/`: playback, transposition, pitch meter
- `features/sessions/`: practice history and summaries
- `shared/`: API client, reusable types, utilities

## Backend modules

- `auth/`: login, registration, JWT issuance
- `user/`: user model and persistence
- `song/`: song CRUD and ownership checks
- `lyric/`: lyric line management
- `practice/`: session storage and summaries
- `stats/`: dashboard aggregates
- `common/`: shared API responses and error handling
- `config/`: security and app configuration
