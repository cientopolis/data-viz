from django.db import models
from django.contrib.postgres.fields import JSONField

# Create your models here.
class TablePersistence(models.Model):
    domain = models.CharField(max_length=100)
    identificator = models.CharField(max_length=100)

    class Meta:
        unique_together = ('domain', 'identificator')

    def __str__(self):
        return '{}: {}'.format(self.domain, self.identificator)


class ColumnPersistence(models.Model):
    table = models.ForeignKey(TablePersistence, on_delete=models.CASCADE, related_name='columns')
    index = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    column_type = models.CharField(max_length=100)
    visible = models.BooleanField(default=True)


class ChartPersistence(models.Model):
    table = models.ForeignKey(TablePersistence, on_delete=models.CASCADE, related_name='charts')
    chart_type = models.CharField(max_length=30)
    conf = JSONField()

    def __str__(self):
        return '{} - {}'.format(self.table, self.chart_type)