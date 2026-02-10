# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-02-10

### Added
- Todo system overhaul: recurring, scheduled, and persistent todo types
- Expandable markdown body for todo details
- Daily/weekly auto-reset for recurring habits
- Subcategory filter dropdown within each review section

## [1.1.0] - 2026-02-10

### Added
- Category/subcategory system for content review (replaces flat categories + blog boolean)
- Review page with collapsible category sections and status filters
- Card and list view toggle with sort options
- Blog publishing gated on category ("blog") + status ("approved")

### Changed
- Moved hardcoded credentials to environment variables (public repo safe)
- Docker Compose uses root `.env` with variable interpolation
- README setup order: environment config before docker compose
- NestJS API documented as future expansion (not actively used)

### Security
- Removed hardcoded email addresses from login page
- Removed hardcoded database credentials from source
- Force-pushed clean git history (no credentials in commits)

## [1.0.0] - 2026-02-09

### Added
- Content review system with approval workflow
- Blog with markdown rendering and approval gating
- Todo list management (add, complete, delete)
- Google OAuth authentication
- Dark theme responsive design
- Notification system for review status changes
- Docker Compose for PostgreSQL

### Fixed
- Login redirect loop (cookie sameSite setting)
- Token display showing zeros on dashboard
- Stale cache issues with force-dynamic pages
- FilePath mismatch between review UI and database
