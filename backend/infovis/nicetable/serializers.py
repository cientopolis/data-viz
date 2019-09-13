from rest_framework import serializers
from .models import NiceTable, Column, Chart


class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ['id', 'nice_table', 'index', 'title', 'column_type']


class NiceTableSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)
    class Meta:
        model = NiceTable
        fields = ['id', 'domain', 'table_id', 'columns']


class ChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chart
        fields = ['id', 'nice_table', 'chart_type', 'data']