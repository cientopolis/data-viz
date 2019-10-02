from django.contrib import admin
from . import models

# Register your models here.
class ColumnInline(admin.TabularInline):
    model = models.ColumnPersistence


class TablePersistenceAdmin(admin.ModelAdmin):
    inlines = (ColumnInline,)


admin.site.register(models.TablePersistence, TablePersistenceAdmin)
admin.site.register(models.ChartPersistence)
