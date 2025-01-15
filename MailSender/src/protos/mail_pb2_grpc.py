# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc
import warnings

from protos import mail_pb2 as src_dot_protos_dot_mail__pb2

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
        + f' but the generated code in src/protos/mail_pb2_grpc.py depends on'
        + f' grpcio>={GRPC_GENERATED_VERSION}.'
        + f' Please upgrade your grpc module to grpcio>={GRPC_GENERATED_VERSION}'
        + f' or downgrade your generated code using grpcio-tools<={GRPC_VERSION}.'
    )


class MailServiceStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.SendMail = channel.unary_unary(
                '/mail.MailService/SendMail',
                request_serializer=src_dot_protos_dot_mail__pb2.MailRequest.SerializeToString,
                response_deserializer=src_dot_protos_dot_mail__pb2.MailResponse.FromString,
                _registered_method=True)


class MailServiceServicer(object):
    """Missing associated documentation comment in .proto file."""

    def SendMail(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_MailServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'SendMail': grpc.unary_unary_rpc_method_handler(
                    servicer.SendMail,
                    request_deserializer=src_dot_protos_dot_mail__pb2.MailRequest.FromString,
                    response_serializer=src_dot_protos_dot_mail__pb2.MailResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'mail.MailService', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('mail.MailService', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class MailService(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def SendMail(request,
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
            '/mail.MailService/SendMail',
            src_dot_protos_dot_mail__pb2.MailRequest.SerializeToString,
            src_dot_protos_dot_mail__pb2.MailResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)


class SMSServiceStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.SendSMS = channel.unary_unary(
                '/mail.SMSService/SendSMS',
                request_serializer=src_dot_protos_dot_mail__pb2.SMSRequest.SerializeToString,
                response_deserializer=src_dot_protos_dot_mail__pb2.SMSResponse.FromString,
                _registered_method=True)


class SMSServiceServicer(object):
    """Missing associated documentation comment in .proto file."""

    def SendSMS(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_SMSServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'SendSMS': grpc.unary_unary_rpc_method_handler(
                    servicer.SendSMS,
                    request_deserializer=src_dot_protos_dot_mail__pb2.SMSRequest.FromString,
                    response_serializer=src_dot_protos_dot_mail__pb2.SMSResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'mail.SMSService', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('mail.SMSService', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class SMSService(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def SendSMS(request,
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
            '/mail.SMSService/SendSMS',
            src_dot_protos_dot_mail__pb2.SMSRequest.SerializeToString,
            src_dot_protos_dot_mail__pb2.SMSResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)


class LogServiceStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.SendLogs = channel.unary_unary(
                '/mail.LogService/SendLogs',
                request_serializer=src_dot_protos_dot_mail__pb2.LogRequest.SerializeToString,
                response_deserializer=src_dot_protos_dot_mail__pb2.LogResponse.FromString,
                _registered_method=True)


class LogServiceServicer(object):
    """Missing associated documentation comment in .proto file."""

    def SendLogs(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_LogServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'SendLogs': grpc.unary_unary_rpc_method_handler(
                    servicer.SendLogs,
                    request_deserializer=src_dot_protos_dot_mail__pb2.LogRequest.FromString,
                    response_serializer=src_dot_protos_dot_mail__pb2.LogResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'mail.LogService', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('mail.LogService', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class LogService(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def SendLogs(request,
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
            '/mail.LogService/SendLogs',
            src_dot_protos_dot_mail__pb2.LogRequest.SerializeToString,
            src_dot_protos_dot_mail__pb2.LogResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)
