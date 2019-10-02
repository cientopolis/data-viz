import json

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import TablePersistence, ChartPersistence
from .serializers import TableSerializer, ChartSerializer, ColumnSerializer

@csrf_exempt
@transaction.atomic
def table(request):
    """
    Get table, or create a new table.
    """
    if request.method == 'GET':
        # import ipdb; ipdb.set_trace()
        domain = request.GET.get('domain')
        identificator = request.GET.get('identificator')
        if domain and identificator:
            try:
                table = TablePersistence.objects.get(identificator=identificator, domain=domain)
                serializer = TableSerializer(table)
                return JsonResponse(serializer.data, safe=False)
            except ObjectDoesNotExist:
                return JsonResponse({}, status=400)
        return JsonResponse(status=400)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        domain = data['domain']
        identificator = data['identificator']
        columns_data = json.loads(data['columns'])
        try:
            # already exists, only update columns
            table = TablePersistence.objects.get(identificator=identificator, domain=domain)
            table.columns.all().delete()
            table_serializer = TableSerializer(table)
            table_id = table.id
        except ObjectDoesNotExist:
            # create
            serializer_data = {
                'domain': domain,
                'identificator': identificator
            }
            table_serializer = TableSerializer(data=serializer_data)
            if table_serializer.is_valid():
                table_serializer.save()
                table_id = table_serializer.data['id']
            else:
                return JsonResponse(table_serializer.errors, status=400)
        for column in columns_data:
            column_data = {
                'table': table_id,
                'index': column['dataIndex'],
                'title': column['title'],
                'column_type': column['type'],
                'visible': column['visible']
            }
            column_serializer = ColumnSerializer(data=column_data)
            if column_serializer.is_valid():
                column_serializer.save()
            else:
                return JsonResponse(column_serializer.errors, status=400)
        return JsonResponse(table_serializer.data, status=201)


class TableDetail(APIView):
    """
    Table detail
    """
    def get_object(self, pk):
        try:
            return TablePersistence.objects.get(pk=pk)
        except TablePersistence.DoesNotExist:
            raise Http404

    def delete(self, request, pk, format=None):
        table = self.get_object(pk)
        table.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # def post(self, request, pk, format=None):
    #     table = self.get_object(pk)
    #     data = JSONParser().parse(request)
    #     serializer = TableSerializer(table, conf={'conf': data['conf']}, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def chart(request):
    """
    List all tables, or create a new table.
    """
    if request.method == 'GET':
        domain = request.GET.get('domain')
        identificator = request.GET.get('identificator')
        if domain and identificator:
            try:
                table = TablePersistence.objects.get(domain=domain, identificator=identificator)
            except TablePersistence.DoesNotExist:
                raise Http404
            charts = ChartPersistence.objects.filter(table=table)
            serializer = ChartSerializer(charts, many=True)
            return JsonResponse(serializer.data, safe=False)
        return JsonResponse({'msg': 'Missing params'}, status=400)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        domain = data['domain']
        identificator = data['identificator']
        table = TablePersistence.objects.get(identificator=identificator, domain=domain)
        data['table'] = table.id
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
            return ChartPersistence.objects.get(pk=pk)
        except ChartPersistence.DoesNotExist:
            raise Http404

    def delete(self, request, pk, format=None):
        chart = self.get_object(pk)
        chart.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request, pk, format=None):
        chart = self.get_object(pk)
        data = JSONParser().parse(request)
        serializer = ChartSerializer(chart, data={'data': data['data']}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def try_domain(request):
    return HttpResponse('backend installed!', status=200)