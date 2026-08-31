# Interface Contract: `accounts.User` Model & Manager

## 1. Manager Interface (`UserManager`)

The model manager attached to `User.objects` provides factory methods for creating standard and superuser accounts keyed by email.

### `create_user(email, password=None, **extra) -> User`

- **Parameters**:
  - `email` (`str`, required): The user's primary email address. Must be non-empty. Normalized via `normalize_email()`.
  - `password` (`str`, optional): Plain-text password to be securely hashed via PBKDF2.
  - `**extra` (`dict`, optional): Additional model fields (e.g., `name`, `role`, `status`).
- **Defaults Applied**:
  - `role`: Defaults to `User.Role.CUSTOMER` if not explicitly supplied.
  - `status`: Defaults to `User.Status.ACTIVE`.
- **Exceptions**:
  - `ValueError`: Raised if `email` is null or empty string (`"Email is required."`).
  - `django.db.IntegrityError`: Raised if `email` violates exact or case-insensitive uniqueness (`DR-01`).

### `create_superuser(email, password=None, **extra) -> User`

- **Parameters**:
  - Same as `create_user`.
- **Invariants Enforced**:
  - Sets `is_staff = True`
  - Sets `is_superuser = True`
  - Sets `role = User.Role.ADMIN`
- **Return**: Instantiated and persisted `User` record.

---

## 2. Model Contract (`accounts.User`)

### Identity & Authentication Properties
- `USERNAME_FIELD = 'email'`: Specifies that authentication uses `email` as the identifier.
- `REQUIRED_FIELDS = ['name']`: Required fields when creating a user via administrative CLI.
- `__str__() -> str`: Returns `self.email`.

### Standard Permission & Role Checks
- Standard Django auth methods (`has_perm`, `has_module_perms`, `is_authenticated`) operate seamlessly as inherited from `AbstractUser`.
