from rest_framework import serializers
from .models import NiceTable, Chart


class NiceTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = NiceTable
        fields = ['id', 'domain', 'table_id', 'columns_conf']


class ChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chart
        fields = ['id', 'nice_table', 'chart_type', 'data']