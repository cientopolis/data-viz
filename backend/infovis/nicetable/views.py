import json

from django.db import transaction
from django.http import HttpResponse, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import NiceTable, Chart
from .serializers import NiceTableSerializer, ChartSerializer, ColumnSerializer

@csrf_exempt
@transaction.atomic
def nice_table(request):
    """
    List all tables, or create a new table.
    """
    if request.method == 'GET':
        domain = request.GET.get('domain')
        table_id = request.GET.get('table_id')
        if domain and table_id:
            nice_tables = NiceTable.objects.filter(table_id=table_id, domain=domain)
            serializer = NiceTableSerializer(nice_tables, many=True)
            return JsonResponse(serializer.data, safe=False)
        return JsonResponse({'msg': 'Missing params'}, status=400)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        columns_data = json.loads(data['columns'])
        serializer_data = {
            'domain': data['domain'],
            'table_id': data['table_id']
        }
        table_serializer = NiceTableSerializer(data=serializer_data)
        if table_serializer.is_valid():
            table_serializer.save()
            for column in columns_data:
                column_data = {
                    'nice_table': table_serializer.data['id'],
                    'index': column['dataIndex'],
                    'title': column['title'],
                    'column_type': column['type']
                }
                column_serializer = ColumnSerializer(data=column_data)
                if column_serializer.is_valid():
                    column_serializer.save()
                else:
                    return JsonResponse(column_serializer.errors, status=400)
            return JsonResponse(table_serializer.data, status=201)
        return JsonResponse(table_serializer.errors, status=400)


class NiceTableDetail(APIView):
    """
    Delete a table
    """
    def get_object(self, pk):
        try:
            return NiceTable.objects.get(pk=pk)
        except NiceTable.DoesNotExist:
            raise Http404

    def delete(self, request, pk, format=None):
        nice_table = self.get_object(pk)
        nice_table.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@csrf_exempt
def chart(request):
    """
    List all tables, or create a new table.
    """
    if request.method == 'GET':
        domain = request.GET.get('domain')
        nice_table = request.GET.get('nice_table')
        if domain and nice_table:
            charts = Chart.objects.filter(nice_table=nice_table)
            serializer = ChartSerializer(charts, many=True)
            return JsonResponse(serializer.data, safe=False)
        return JsonResponse({'msg': 'Missing params'}, status=400)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = ChartSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)


class ChartDetail(APIView):
    """
    Delete a chart
    """
    def get_object(self, pk):
        try:
            return Chart.objects.get(pk=pk)
        except Chart.DoesNotExist:
            raise Http404

    def delete(self, request, pk, format=None):
        chart = self.get_object(pk)
        chart.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)