from protos import data_pb2_grpc, data_pb2

class DataService(data_pb2_grpc.DataServiceServicer):
    def GetServerStats(self, request, context):
        # Implementa la lógica para obtener las estadísticas del servidor
        free_memory = "1024MB"
        total_memory = "2048MB"
        disk_usage = "50%"
        return data_pb2.ServerStatsResponse(
            free_memory=free_memory,
            total_memory=total_memory,
            disk_usage=disk_usage
        )