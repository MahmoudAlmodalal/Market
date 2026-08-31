# Technical Research: Custom User Model and Email Authentication (TK-03)

## Research Findings & Architectural Decisions

### 1. Custom User Model Architecture (`AbstractUser` vs `AbstractBaseUser`)
- **Decision**: Subclass `django.contrib.auth.models.AbstractUser`, remove unused fields (`username = None`, `first_name = None`, `last_name = None`), designate `USERNAME_FIELD = 'email'`, and set `REQUIRED_FIELDS = ['name']`.
- **Rationale**: `AbstractUser` supplies full built-in permission/group machinery, `is_staff`, `is_superuser`, `is_active`, `last_login`, and `date_joined` handling without boilerplate, while allowing clean excision of unwanted fields.
- **Alternatives Considered**:
  - `AbstractBaseUser` + `PermissionsMixin`: Rejected because it requires manually re-implementing `is_staff`, `is_active`, `date_joined`, and standard administrative attributes.
  - Retaining `username` and setting it equal to email: Rejected because it creates dual-field synchronization bugs, redundant storage, and violates FR-001.

### 2. Case-Insensitive Email Uniqueness (DR-01)
- **Decision**: Multi-layered enforcement:
  1. Model layer: `email = models.EmailField(unique=True)` and `UserManager.normalize_email()`.
  2. Database layer: `models.UniqueConstraint(Lower('email'), name='uniq_email_ci')` in `Meta.constraints`.
- **Rationale**: Standard `unique=True` ensures standard unique B-Tree indexing, while `UniqueConstraint(Lower('email'))` compiles to a PostgreSQL functional index that guarantees zero case collisions under concurrent database transactions.
- **Alternatives Considered**:
  - PostgreSQL `citext` extension: Rejected to avoid external extension dependencies and migration complexities.
  - Python-only `save()` normalization: Rejected because it does not protect against concurrent registration race conditions at the database level.

### 3. Custom Manager Contract (`UserManager`)
- **Decision**: Subclass `BaseUserManager` with `use_in_migrations = True`. Implement `create_user(email, password=None, **extra)` and `create_superuser(email, password=None, **extra)` ensuring superuser creation forces `is_staff=True`, `is_superuser=True`, and `role=User.Role.ADMIN`.
- **Rationale**: Complies with Django's authentication contract and allows CLI `python manage.py createsuperuser` to prompt for `email`, `name`, and `password` seamlessly.
- **Alternatives Considered**:
  - Default Django `UserManager`: Incompatible due to mandatory `username` parameter expectations.

### 4. Role and Status Enumerations
- **Decision**: Define `Role` (`customer`, `seller`, `admin`) and `Status` (`active`, `suspended`) using `models.TextChoices`.
- **Rationale**: Provides type safety, readable database rows, zero join overhead, and clean integration with DRF serializers and serializers/token claims.
- **Alternatives Considered**:
  - Integer enum / Bitmask: Rejected for low readability in SQL queries and logs.
  - Role tables / RBAC foreign keys: Rejected as speculative complexity (YAGNI) for MVP requirements.

### 5. Migration Strategy and Zero-State Foundation
- **Decision**: Define migration `0001_initial` in `accounts` as the first migration depending only on `auth.0012_alter_user_first_name_max_length`, configured in `souqi/settings.py` via `AUTH_USER_MODEL = 'accounts.User'`.
- **Rationale**: Django requires `AUTH_USER_MODEL` to be established prior to any other app establishing foreign keys to the user model.
- **Alternatives Considered**:
  - Retrofitting custom user model after initial app models: Prohibited by Django architecture.
