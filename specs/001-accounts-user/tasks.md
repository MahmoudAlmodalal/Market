---
description: "Task list for Custom User Model and Email Authentication (TK-03)"
---

# Tasks: Custom User Model and Email Authentication (TK-03)

**Input**: Design documents from `/specs/001-accounts-user/`

**Prerequisites**: [plan.md](file:///home/mahmoud/Desktop/p3/specs/001-accounts-user/plan.md), [spec.md](file:///home/mahmoud/Desktop/p3/specs/001-accounts-user/spec.md), [research.md](file:///home/mahmoud/Desktop/p3/specs/001-accounts-user/research.md), [data-model.md](file:///home/mahmoud/Desktop/p3/specs/001-accounts-user/data-model.md), [contracts/](file:///home/mahmoud/Desktop/p3/specs/001-accounts-user/contracts/)

**Tests**: Test tasks are included per Constitution Principle III (Test-First) and Spec Success Criteria SC-005.

**Organization**: Tasks are grouped by user story (US1 through US4) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Every task includes an exact target file path

## Path Conventions

- Django backend application: `api/`
- Application root: `api/accounts/`
- Configuration root: `api/souqi/`
- Test suite: `api/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project and test runner initialization

- [X] T001 Configure and verify accounts application registration in `api/souqi/settings.py` and `api/accounts/apps.py`
- [X] T002 [P] Configure pytest test runner settings and environment in `api/pytest.ini` and `api/souqi/settings.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model structure and manager definition that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Configure `AUTH_USER_MODEL = 'accounts.User'` in `api/souqi/settings.py`
- [X] T004 [P] Define `accounts.User` base class inheriting from `AbstractUser` without traditional username/first_name/last_name fields in `api/accounts/models.py`
- [X] T005 Define custom `UserManager` base class inheriting from `BaseUserManager` with `use_in_migrations = True` in `api/accounts/models.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in priority order or in parallel.

---

## Phase 3: User Story 1 - Email-Based User Account Creation (Priority: P1) 🎯 MVP

**Goal**: Allow platform users to create accounts using email, name, and password with email designated as the unique primary login identifier (`USERNAME_FIELD`) without any username field.

**Independent Test**: Create a standard user via `User.objects.create_user(email="customer@example.com", name="Jane Doe", password="password")` and verify email authentication, default customer role, active status, password hashing, and rejection of missing email/name.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Write unit tests for email-based user creation, required fields validation, and password hashing in `api/tests/test_accounts.py`

### Implementation for User Story 1

- [X] T007 [US1] Implement `email`, `name`, `USERNAME_FIELD = 'email'`, and `REQUIRED_FIELDS = ['name']` on `User` model in `api/accounts/models.py`
- [X] T008 [US1] Implement `create_user` method on `UserManager` with email requirement and password hashing in `api/accounts/models.py`
- [X] T009 [US1] Implement string representation `__str__` returning user email in `api/accounts/models.py`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP ready).

---

## Phase 4: User Story 2 - Case-Insensitive Unique Email Enforcement (Priority: P1)

**Goal**: Prevent duplicate accounts across differing letter casing by enforcing case-insensitive email uniqueness and email normalization (DR-01).

**Independent Test**: Create an account with one email casing (e.g. `alex@example.com`) and verify that attempting to create another with differing casing (e.g. `ALEX@example.com`) raises an `IntegrityError` at the database level.

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] Write unit tests for email normalization and case-insensitive unique constraint collisions in `api/tests/test_accounts.py`

### Implementation for User Story 2

- [X] T011 [US2] Add `normalize_email()` in `UserManager.create_user` and database `UniqueConstraint(Lower('email'), name='uniq_email_ci')` to `User.Meta` in `api/accounts/models.py`
- [X] T012 [US2] Generate initial migration `0001_initial.py` containing table schema and `uniq_email_ci` constraint in `api/accounts/migrations/0001_initial.py`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Administrator Creation with Elevated Privileges (Priority: P2)

**Goal**: Provide superuser account creation via email and name, automatically granting `is_staff=True`, `is_superuser=True`, and `role='admin'`.

**Independent Test**: Call `User.objects.create_superuser(email="admin@souqi.com", name="Admin User", password="password")` or CLI `python manage.py createsuperuser` and verify staff status, superuser privileges, and admin role assignment.

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Write unit tests for superuser creation via `create_superuser` and CLI createsuperuser invariants in `api/tests/test_accounts.py`

### Implementation for User Story 3

- [X] T014 [US3] Implement `create_superuser` method in `UserManager` enforcing `is_staff=True`, `is_superuser=True`, and `role=User.Role.ADMIN` in `api/accounts/models.py`

**Checkpoint**: At this point, User Stories 1, 2, and 3 should all work independently.

---

## Phase 6: User Story 4 - User Account State & Role Classification (Priority: P2)

**Goal**: Enforce explicit actor roles (`customer`, `seller`, `admin`) and lifecycle status (`active`, `suspended`) choices on user accounts.

**Independent Test**: Instantiate and update user accounts with various `Role` and `Status` choices, verifying default assignments and validation of valid enum choices.

### Tests for User Story 4 ⚠️

- [X] T015 [P] [US4] Write unit tests for `User.Role` and `User.Status` text choices, defaults, and transitions in `api/tests/test_accounts.py`

### Implementation for User Story 4

- [X] T016 [US4] Implement `Role` (`TextChoices`) and `Status` (`TextChoices`) enumerations with field defaults on `User` in `api/accounts/models.py`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: System verification, migration integrity checks, test execution, and documentation validation

- [X] T017 [P] Validate migration application and consistency against clean PostgreSQL database in `api/accounts/migrations/0001_initial.py`
- [X] T018 [P] Execute full automated test suite for accounts domain in `api/tests/test_accounts.py`
- [X] T019 Run quickstart scenarios verification per `specs/001-accounts-user/quickstart.md`
- [X] T020 [P] Update API and domain documentation for accounts module in `API.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion.
  - Can proceed sequentially in priority order (P1 → P1 → P2 → P2) or in parallel.
- **Polish (Phase 7)**: Depends on all user story phases being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately after Foundational (Phase 2).
- **User Story 2 (P1)**: Depends on US1 model fields; can be tested alongside US1.
- **User Story 3 (P2)**: Depends on US1 user creation methods; sets elevated admin privileges.
- **User Story 4 (P2)**: Integrates `Role` and `Status` choices into US1 and US3.

### Within Each User Story

- Test-first: Unit tests written in `api/tests/test_accounts.py` before implementation.
- Model field definitions and manager logic implemented.
- Database constraints and migrations aligned.
- Checkpoint verified before moving to next story.

### Parallel Opportunities

- `T001` and `T002` can be executed in parallel during Setup.
- `T004` and `T005` can be defined in parallel during Foundational.
- Test tasks `T006`, `T010`, `T013`, `T015` across stories can be drafted concurrently.
- Polish tasks `T017`, `T018`, and `T020` can run in parallel.

---

## Parallel Example: User Story 1 & User Story 2

```bash
# Launch test definitions in parallel:
Task T006: "Write unit tests for email-based user creation, required fields validation, and password hashing in api/tests/test_accounts.py"
Task T010: "Write unit tests for email normalization and case-insensitive unique constraint collisions in api/tests/test_accounts.py"

# Implement core model & constraint:
Task T007: "Implement email, name, USERNAME_FIELD = 'email', and REQUIRED_FIELDS = ['name'] on User model in api/accounts/models.py"
Task T011: "Add normalize_email() in UserManager.create_user and database UniqueConstraint(Lower('email'), name='uniq_email_ci') to User.Meta in api/accounts/models.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`, `T002`)
2. Complete Phase 2: Foundational (`T003`, `T004`, `T005`)
3. Complete Phase 3: User Story 1 (`T006`, `T007`, `T008`, `T009`)
4. **STOP and VALIDATE**: Verify email-only account creation independently
5. Base MVP functional

### Incremental Delivery

1. **Increment 1**: Setup + Foundation + User Story 1 (Basic email-based user identity)
2. **Increment 2**: User Story 2 (Case-insensitive unique constraint DR-01 + migration)
3. **Increment 3**: User Story 3 (Superuser creation manager & CLI `createsuperuser`)
4. **Increment 4**: User Story 4 (Role and status classification enum integration)
5. **Increment 5**: Polish & validation (Full test suite & quickstart verification)

---

## Notes

- `[P]` tasks mark activities in separate files or independent units with no sequential blocking dependency.
- `[Story]` label maps every task to its corresponding user story for complete traceability.
- Every task includes an explicit target file path.
- Migration `0001_initial.py` in `accounts` provides the zero-state identity migration for all downstream platform apps.
