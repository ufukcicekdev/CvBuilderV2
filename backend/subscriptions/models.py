from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class PaymentGateway(models.Model):
    """Model for payment gateways"""
    GATEWAY_TYPE_CHOICES = (
        ('paddle', _('Paddle')),
        ('paytr', _('PayTR Virtual POS')),
    )

    name = models.CharField(max_length=100)
    gateway_type = models.CharField(max_length=20, choices=GATEWAY_TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Payment Gateway')
        verbose_name_plural = _('Payment Gateways')
        ordering = ['position']
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Ensure only one default gateway"""
        if self.is_default:
            # Set all other gateways is_default to False
            PaymentGateway.objects.exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

class SubscriptionPlan(models.Model):
    """Model for subscription plans"""
    PLAN_TYPE_CHOICES = (
        ('free', _('Free')),
        ('jobseeker', _('Job Seeker')),
        ('premium', _('Premium')),
    )

    plan_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES)
    currency = models.CharField(max_length=3, default='USD')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    paddle_price_id = models.CharField(max_length=100, blank=True, null=True)
    paddle_product_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Store features as JSON
    features = models.JSONField(default=dict)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Subscription Plan')
        verbose_name_plural = _('Subscription Plans')


class UserSubscription(models.Model):
    """Model for user subscriptions"""
    STATUS_CHOICES = (
        ('active', _('Active')),
        ('canceled', _('Canceled')),
        ('expired', _('Expired')),
        ('trial', _('Trial')),
        ('pending', _('Pending')),
        ('past_due', _('Past Due')),
        ('paused', _('Paused')),
    )

    PERIOD_CHOICES = (
        ('monthly', _('Monthly')),
        ('yearly', _('Yearly')),
    )

    PAYMENT_PROVIDER_CHOICES = (
        ('paddle', _('Paddle')),
        ('paytr', _('PayTR Virtual POS')),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='monthly')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    trial_end_date = models.DateTimeField(null=True, blank=True)
    
    # Billing and payment flags
    is_active = models.BooleanField(default=True)
    cancel_at_period_end = models.BooleanField(default=False)
    payment_provider = models.CharField(max_length=20, choices=PAYMENT_PROVIDER_CHOICES, default='paddle')
    next_payment_date = models.DateTimeField(null=True, blank=True)
    
    # Paddle specific fields
    paddle_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    paddle_customer_id = models.CharField(max_length=100, blank=True, null=True)
    paddle_plan_id = models.CharField(max_length=100, blank=True, null=True)
    paddle_update_url = models.CharField(max_length=255, blank=True, null=True)
    paddle_cancel_url = models.CharField(max_length=255, blank=True, null=True)
    paddle_checkout_id = models.CharField(max_length=100, blank=True, null=True)
    paddle_last_payment_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.status})"
    
    class Meta:
        verbose_name = _('User Subscription')
        verbose_name_plural = _('User Subscriptions')


class SubscriptionPaymentHistory(models.Model):
    """Model for subscription payment history"""
    STATUS_CHOICES = (
        ('success', _('Success')),
        ('failed', _('Failed')),
        ('pending', _('Pending')),
    )

    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE, related_name='payments')
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_provider = models.CharField(max_length=20, choices=UserSubscription.PAYMENT_PROVIDER_CHOICES, default='paddle')
    
    # Paddle specific fields
    paddle_payment_id = models.CharField(max_length=100, blank=True, null=True)
    paddle_checkout_id = models.CharField(max_length=100, blank=True, null=True)
    
    # PayTR specific fields
    paytr_merchant_oid = models.CharField(max_length=100, blank=True, null=True)
    paytr_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    paytr_payment_id = models.CharField(max_length=100, blank=True, null=True)
    paytr_hash = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.subscription.user.email} - {self.amount} {self.currency} ({self.status})"
    
    class Meta:
        verbose_name = _('Subscription Payment History')
        verbose_name_plural = _('Subscription Payment Histories')
