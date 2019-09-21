from rest_framework import serializers
from .models import TablePersistence, ColumnPersistence, ChartPersistence


class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColumnPersistence
        fields = ['id', 'table', 'index', 'title', 'column_type', 'visible']


class TableSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)
    class Meta:
        model = TablePersistence
        fields = ['id', 'domain', 'identificator', 'columns']


class ChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartPersistence
        fields = ['id', 'table', 'chart_type', 'conf']