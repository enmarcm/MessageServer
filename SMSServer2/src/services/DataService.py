import psutil
from protos import data_pb2_grpc, data_pb2

class DataService(data_pb2_grpc.DataServiceServicer):
    def GetServerStats(self, request, context):
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        free_memory = f"{memory.available // (1024 * 1024)}MB"
        total_memory = f"{memory.total // (1024 * 1024)}MB"
        disk_usage = f"{disk.percent}%"
        
        return data_pb2.ServerStatsResponse(
            free_memory=free_memory,
            total_memory=total_memory,
            disk_usage=disk_usage
        )