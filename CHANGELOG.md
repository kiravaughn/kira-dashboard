# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Category/subcategory system for content review (replaces flat categories + blog boolean)
- Review page with collapsible category sections, status filters, card/list views
- Blog toggle replaced with proper category-based blog publishing
- Docker Compose for PostgreSQL with environment variable configuration
- Content review system with approval workflow
- Blog with markdown rendering and approval gating
- Todo list management (add, complete, delete)
- Google OAuth authentication with configurable allowed emails
- Dark theme responsive design
- Notification system for review status changes

### Changed
- Moved hardcoded credentials to environment variables (public repo safe)
- README setup order: environment config before docker compose
- NestJS API documented as future expansion (not actively used)

### Fixed
- Login redirect loop (cookie sameSite setting)
- Token display showing zeros on dashboard
- Stale cache issues with force-dynamic pages
- FilePath mismatch between review UI and database

### Security
- Removed hardcoded email addresses from login page
- Removed hardcoded database credentials from source
- Force-pushed clean git history (no credentials in commits)
