# Feature Specification: Custom User Model and Email Authentication (TK-03)

**Feature Branch**: `001-accounts-user`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "### TK-03 — accounts.User only in TICKETS.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email-Based User Account Creation (Priority: P1)

As a platform user (customer or seller), I want to create an account using my email address and name without having to choose or remember a separate username.

**Why this priority**: Core identity mechanism for all platform actors. Every downstream feature (authentication, profiles, carts, orders) depends on an email-keyed user entity.

**Independent Test**: Can be fully tested by creating standard user accounts with valid email addresses and verifying identity and credential validation without any username input.

**Acceptance Scenarios**:

1. **Given** a valid email address "user@example.com", a valid name "Jane Doe", and a valid password, **When** an account is created, **Then** the system persists the user record with email as the unique login identifier and assigns the default role of "customer" with "active" status.
2. **Given** an account creation request without an email address, **When** creation is attempted, **Then** the system rejects the operation with a validation error indicating that email is required.
3. **Given** an account creation request without a name, **When** creation is attempted, **Then** the system rejects the operation with a validation error indicating that name is required.

---

### User Story 2 - Case-Insensitive Unique Email Enforcement (Priority: P1)

As a platform administrator and security safeguard, I want the system to treat email addresses case-insensitively so that duplicate accounts with different capitalization cannot be created.

**Why this priority**: Essential data integrity and security requirement (DR-01, FR-06). Prevents account squatting, collision, and confusion.

**Independent Test**: Can be tested by creating an account with one email casing and attempting to create another with different casing (e.g., lowercase vs uppercase).

**Acceptance Scenarios**:

1. **Given** an existing account with email "alex@example.com", **When** a user attempts to create an account with "ALEX@example.com" or "Alex@Example.Com", **Then** the system rejects the creation due to duplicate email conflict.
2. **Given** an email address entered with mixed casing during account creation, **When** the account is saved, **Then** the normalized email is indexed and enforced as unique regardless of case.

---

### User Story 3 - Administrator Creation with Elevated Privileges (Priority: P2)

As a system administrator, I want to create superuser accounts using an email address via administrative tooling, automatically granting full administrative access and assigning the admin role.

**Why this priority**: Essential for platform operations, database seeding, administrative access, and maintenance workflows.

**Independent Test**: Can be tested by running superuser creation commands with email and credentials and verifying that the resulting user has superuser privileges, staff status, and the "admin" role.

**Acceptance Scenarios**:

1. **Given** valid administrator details (email "admin@souqi.com", name "Admin User", and password), **When** a superuser is created via administrative management commands, **Then** the user is stored with superuser status, staff status, and role set to "admin".
2. **Given** a superuser account, **When** the administrator authenticates, **Then** administrative permissions and role flags are verified.

---

### User Story 4 - User Account State & Role Classification (Priority: P2)

As a platform service or administrator, I want user accounts to store explicit role classification ("customer", "seller", "admin") and lifecycle status ("active", "suspended") so that downstream access control policies can be enforced.

**Why this priority**: Provides the foundational schema and state model required by authorization guards, token claims, and seller/customer distinction.

**Independent Test**: Can be tested by creating or updating user records with specified roles and status flags, verifying that only valid enum choices are permitted.

**Acceptance Scenarios**:

1. **Given** a user account, **When** role is specified as "customer", "seller", or "admin", **Then** the role is recorded accurately.
2. **Given** a user account, **When** status is updated to "suspended", **Then** the account state reflects the suspended status while preserving account history.
3. **Given** an account update with an invalid role or status value, **When** validation executes, **Then** the system rejects the invalid state.

---

### Edge Cases

- What happens when an email address has leading/trailing whitespace? The system MUST trim and normalize the email before validation and persistence.
- What happens when database-level race conditions occur with concurrent registrations of the same case-insensitive email? Database constraints MUST guarantee collision rejection at the database layer.
- How does the system handle superuser creation when role is not explicitly provided? The creation manager MUST default superuser roles to "admin".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST designate `email` as the primary unique username identifier (`USERNAME_FIELD`) and omit traditional `username`, `first_name`, and `last_name` fields.
- **FR-002**: System MUST enforce case-insensitive uniqueness on user email addresses at both model validation and database constraint levels (`DR-01`).
- **FR-003**: System MUST require a non-empty `name` field (maximum length 120 characters) for all user accounts.
- **FR-004**: System MUST classify users by a `role` field with allowed values restricted to `customer`, `seller`, and `admin`, defaulting to `customer` for standard users.
- **FR-005**: System MUST track account lifecycle via a `status` field with allowed values restricted to `active` and `suspended`, defaulting to `active`.
- **FR-006**: System MUST provide an email-keyed creation manager supporting standard user and superuser creation, ensuring superusers are automatically assigned staff status, superuser status, and the `admin` role.
- **FR-007**: System MUST securely hash passwords using PBKDF2 hashing before persistence and never return or log plain-text passwords.
- **FR-008**: System MUST configure the custom user model as the primary authentication user model (`AUTH_USER_MODEL`) prior to any foreign key dependencies being established by downstream apps.

### Key Entities *(include if feature involves data)*

- **User (`accounts.User`)**: The core identity entity representing any actor on the platform (Customer, Seller, Admin). Attributes include `id` (primary key), `email` (unique identifier, case-folded constraint), `name` (full display name), `role` (enum: customer, seller, admin), `status` (enum: active, suspended), `password` (hashed string), `date_joined`, and standard permission/group associations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user creations and lookups operate via `email` as the unique identifier without requiring a username.
- **SC-002**: 100% of duplicate email creation attempts across differing letter casing (e.g. `test@example.com` vs `TEST@example.com`) are rejected with integrity/validation errors.
- **SC-003**: 100% of superuser accounts created via email-keyed creation methods have `is_staff=True`, `is_superuser=True`, and `role='admin'`.
- **SC-004**: Database migrations for the user model apply cleanly from a zero state without dependency conflicts or migration warnings.
- **SC-005**: 100% of automated unit tests covering user creation, normalization, constraint enforcement, and superuser generation pass.

## Assumptions

- Registration API endpoints, JWT token generation, and SellerProfile auto-creation are implemented in downstream tickets (TK-04, TK-05) and build directly upon this foundational user model.
- Password complexity validation rules leverage standard platform validators configured in project settings.
- The user model is defined early to satisfy framework requirements that the custom authentication model cannot be cleanly changed once foreign keys exist in subsequent migrations.
