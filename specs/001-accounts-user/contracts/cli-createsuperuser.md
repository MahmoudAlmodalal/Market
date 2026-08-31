# Interface Contract: CLI `createsuperuser` Management Command

## Overview
Django management command `python manage.py createsuperuser` configured to accept `email` and `name` inputs without requesting a username.

## Inputs
- **Interactive Prompts / Flags**:
  - `email` (`--email`): User's primary email address (e.g. `admin@souqi.com`).
  - `name` (`--name` or interactive prompt): User's full display name (e.g. `Administrator`).
  - `password`: Secure input prompted twice for confirmation.

## Execution Pre-conditions
- Database migrations up-to-date (`accounts.0001_initial` applied).
- Valid email format.

## Post-conditions & Side Effects
- Database record inserted into `accounts_user` with:
  - `email`: Normalized input email.
  - `name`: Given name string.
  - `password`: Hashed PBKDF2 string.
  - `is_staff`: `True`
  - `is_superuser`: `True`
  - `role`: `'admin'`
  - `status`: `'active'`
