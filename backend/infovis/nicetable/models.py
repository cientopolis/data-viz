from django.db import models
from django_mysql.models import JSONField

# Create your models here.
class NiceTable(models.Model):
    domain = models.CharField(max_length=100)
    table_id = models.IntegerField()
    columns_conf = JSONField()