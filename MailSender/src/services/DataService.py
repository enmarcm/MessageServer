import psutil
from protos import data_pb2_grpc
from protos import data_pb2

class DataService(data_pb2_grpc.DataServiceServicer):
    def GetServerStats(self, request, context):
        cpu_usage = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        disk_usage = psutil.disk_usage('/')

        return data_pb2.ServerStatsResponse(
            cpu_usage=f"{cpu_usage}%",
            free_memory=f"{memory_info.available / (1024 ** 2)} MB",
            total_memory=f"{memory_info.total / (1024 ** 2)} MB",
            disk_usage=f"{disk_usage.percent}%"
        )