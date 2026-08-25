from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.functions import Lower


class UserManager(BaseUserManager):
    """Email-keyed manager — there is no username field (DR-01)."""

    use_in_migrations = True

    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('Email is required.')
        extra.setdefault('role', User.Role.CUSTOMER)
        user = self.model(email=self.normalize_email(email), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True, role=User.Role.ADMIN)
        return self.create_user(email, password, **extra)


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'customer'
        SELLER = 'seller'
        ADMIN = 'admin'

    class Status(models.TextChoices):
        ACTIVE = 'active'
        SUSPENDED = 'suspended'

    username = None
    first_name = None
    last_name = None

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.CUSTOMER)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    class Meta:
        constraints = [
            # DR-01: exact-match unique=True above and this case-folded index are
            # complementary — neither answers the other's predicate.
            models.UniqueConstraint(Lower('email'), name='uniq_email_ci'),
        ]

    def __str__(self):
        return self.email
