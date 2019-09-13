from django.db import models
from django_mysql.models import JSONField

# Create your models here.
class NiceTable(models.Model):
    domain = models.CharField(max_length=100)
    table_id = models.CharField(max_length=100)

class Column(models.Model):
    nice_table = models.ForeignKey(NiceTable, on_delete=models.CASCADE, related_name='columns')
    index = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    column_type = models.CharField(max_length=100)

class Chart(models.Model):
    nice_table = models.ForeignKey(NiceTable, on_delete=models.CASCADE)
    chart_type = models.CharField(max_length=30)
    data = JSONField()