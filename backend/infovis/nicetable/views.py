from django.http import HttpResponse, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import NiceTable
from .serializers import NiceTableSerializer

@csrf_exempt
def nice_table(request):
    """
    List all tables, or create a new table.
    """
    if request.method == 'GET':
        table_id = request.GET.get('table_id')
        domain = request.GET.get('domain')
        if table_id and domain:
            nice_tables = NiceTable.objects.all()
            serializer = NiceTableSerializer(nice_tables, many=True)
            return JsonResponse(serializer.data, safe=False)
        return JsonResponse({'msg': 'Missing params'}, status=400)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = NiceTableSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)


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