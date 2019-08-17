from rest_framework import serializers
from .models import NiceTable


class NiceTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = NiceTable
        fields = ['id', 'domain', 'table_id', 'columns_conf']