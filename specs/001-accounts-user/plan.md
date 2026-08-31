# Implementation Plan: Custom User Model and Email Authentication (TK-03)

**Branch**: `001-accounts-user` | **Date**: 2026-08-26 | **Spec**: [spec.md](file:///home/mahmoud/Desktop/p3/specs/001-accounts-user/spec.md)

**Input**: Feature specification from `/specs/001-accounts-user/spec.md`

## Summary

Implement the foundational custom user model `accounts.User` subclassing Django's `AbstractUser`. Designate `email` as the primary authentication identifier (`USERNAME_FIELD`) and omit traditional `username`, `first_name`, and `last_name` fields. Enforce case-insensitive email uniqueness at both model and PostgreSQL database constraint levels (`DR-01`). Provide an email-keyed custom manager `UserManager` that defaults standard users to `role='customer'` and superusers to `role='admin'` with full staff and superuser privileges. Configure `AUTH_USER_MODEL = 'accounts.User'` and generate the initial zero-state migration.

## Technical Context

**Language/Version**: Python 3.10+ (Django 5.2 LTS compatible)

**Primary Dependencies**: Django 5.2, djangorestframework, psycopg 3

**Storage**: PostgreSQL 16 (enforcing `UniqueConstraint(Lower('email'), name='uniq_email_ci')`)

**Testing**: pytest, pytest-django

**Target Platform**: Linux server / Docker containerized API

**Project Type**: Web service / REST API backend

**Performance Goals**: Sub-10ms indexed email queries; O(1) identity lookups via primary and expression-indexed constraints

**Constraints**:
- Must inherit from `AbstractUser` without unused `username`/`first_name`/`last_name` fields.
- Email normalization and database case-folding uniqueness (`DR-01`).
- `AUTH_USER_MODEL` configured before downstream domain models (catalog, orders, AI) introduce foreign keys.
- Superuser creation via manager and CLI must automatically grant `is_staff=True`, `is_superuser=True`, and `role='admin'`.

**Scale/Scope**: Foundational identity entity supporting all marketplace users (customers, sellers, administrators).

## Constitution Check

*GATE: Passed before Phase 0 research. Verified after Phase 1 design.*

- **Test-First Principle**: Unit and integration test suites cover standard user creation, email normalization, case-insensitive collision rejection, and superuser generation.
- **Simplicity / YAGNI**: Direct field removal on `AbstractUser` avoids boilerplate of custom `AbstractBaseUser` while avoiding unnecessary role mapping tables.
- **Zero-State Integrity**: Migration `0001_initial` isolates `accounts.User` as the standalone root identity migration.

## Project Structure

### Documentation (this feature)

```text
specs/001-accounts-user/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Technical research & decisions (Phase 0)
├── data-model.md        # Data model schema & constraints (Phase 1)
├── quickstart.md        # Runnable validation guide (Phase 1)
├── contracts/           # Interface contracts (Phase 1)
│   ├── user-model.md    # Model & UserManager ORM contract
│   └── cli-createsuperuser.md # CLI management command contract
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code Layout

```text
api/
├── accounts/
│   ├── migrations/
│   │   └── 0001_initial.py  # Initial User model migration with DR-01 constraint
│   ├── __init__.py
│   ├── apps.py
│   └── models.py            # User model, Role/Status choices, UserManager
├── souqi/
│   └── settings.py          # AUTH_USER_MODEL = 'accounts.User' configuration
└── tests/
    └── test_accounts.py     # Automated test suite for User model & UserManager
```

**Structure Decision**: Standard Django modular architecture within `api/`. The `accounts` application encapsulates all identity and authentication models.

## Complexity Tracking

> **No constitution violations or unjustified complexity introduced.**
