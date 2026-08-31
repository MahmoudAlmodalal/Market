# Quickstart & Validation Guide: Custom User Model and Email Authentication (TK-03)

## Prerequisites
- PostgreSQL service running (e.g., via `docker compose up -d db`).
- Virtual environment with dependencies installed (`pip install -r api/requirements.txt`).
- `DATABASE_URL` configured pointing to PostgreSQL.

---

## 1. Apply Database Migrations

Run database migrations to initialize the `accounts_user` table and its unique constraints:

```bash
docker compose run --rm api python manage.py migrate accounts
```

**Expected Outcome**:
- `Applying accounts.0001_initial... OK`
- Database table `accounts_user` created with `uniq_email_ci` constraint.

---

## 2. Automated Test Execution

Run the test suite verifying user model creation, normalization, constraint enforcement, and superuser generation:

```bash
docker compose run --rm api pytest api/tests/test_accounts.py -v
```

**Expected Outcome**:
- All test scenarios pass (100% success rate).

---

## 3. Manual Validation Scenarios via Django Shell

Launch Django shell:
```bash
docker compose run --rm api python manage.py shell
```

### Scenario A: Standard User Creation
```python
from accounts.models import User

# 1. Create standard customer user
user = User.objects.create_user(
    email="customer@example.com",
    name="Test Customer",
    password="securepassword123"
)
assert user.email == "customer@example.com"
assert user.role == User.Role.CUSTOMER
assert user.status == User.Status.ACTIVE
assert user.is_staff is False
assert user.is_superuser is False
assert user.check_password("securepassword123") is True
print("Standard user creation: OK")
```

### Scenario B: Case-Insensitive Email Uniqueness (DR-01)
```python
from django.db import IntegrityError
from accounts.models import User

# Attempt creating duplicate with different casing
try:
    User.objects.create_user(
        email="CUSTOMER@EXAMPLE.COM",
        name="Duplicate Customer",
        password="anotherpassword123"
    )
    assert False, "Should have raised IntegrityError"
except IntegrityError:
    print("Case-insensitive duplicate rejection: OK")
```

### Scenario C: Superuser Creation and Elevated Role
```python
from accounts.models import User

admin = User.objects.create_superuser(
    email="admin@example.com",
    name="Super Admin",
    password="adminpassword123"
)
assert admin.role == User.Role.ADMIN
assert admin.is_staff is True
assert admin.is_superuser is True
print("Superuser creation and admin role: OK")
```
