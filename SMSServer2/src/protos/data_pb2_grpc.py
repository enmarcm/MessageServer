# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc
import warnings

from . import data_pb2 as data__pb2

GRPC_GENERATED_VERSION = '1.69.0'
GRPC_VERSION = grpc.__version__
_version_not_supported = False

try:
    from grpc._utilities import first_version_is_lower
    _version_not_supported = first_version_is_lower(GRPC_VERSION, GRPC_GENERATED_VERSION)
except ImportError:
    _version_not_supported = True

if _version_not_supported:
    raise RuntimeError(
        f'The grpc package installed is at version {GRPC_VERSION},'
        + f' but the generated code in data_pb2_grpc.py depends on'
        + f' grpcio>={GRPC_GENERATED_VERSION}.'
        + f' Please upgrade your grpc module to grpcio>={GRPC_GENERATED_VERSION}'
        + f' or downgrade your generated code using grpcio-tools<={GRPC_VERSION}.'
    )


class DataServiceStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.GetServerStats = channel.unary_unary(
                '/data.DataService/GetServerStats',
                request_serializer=data__pb2.ServerStatsRequest.SerializeToString,
                response_deserializer=data__pb2.ServerStatsResponse.FromString,
                _registered_method=True)


class DataServiceServicer(object):
    """Missing associated documentation comment in .proto file."""

    def GetServerStats(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_DataServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'GetServerStats': grpc.unary_unary_rpc_method_handler(
                    servicer.GetServerStats,
                    request_deserializer=data__pb2.ServerStatsRequest.FromString,
                    response_serializer=data__pb2.ServerStatsResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'data.DataService', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('data.DataService', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class DataService(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def GetServerStats(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/data.DataService/GetServerStats',
            data__pb2.ServerStatsRequest.SerializeToString,
            data__pb2.ServerStatsResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)
