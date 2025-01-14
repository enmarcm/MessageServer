# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: mail.proto
# Protobuf Python Version: 5.29.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    29,
    0,
    '',
    'mail.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\nmail.proto\x12\x04mail\"8\n\x0bMailRequest\x12\n\n\x02to\x18\x01 \x01(\t\x12\x0f\n\x07subject\x18\x02 \x01(\t\x12\x0c\n\x04\x62ody\x18\x03 \x01(\t\"\x1e\n\x0cMailResponse\x12\x0e\n\x06status\x18\x01 \x01(\t\"-\n\nSMSRequest\x12\x0e\n\x06number\x18\x01 \x01(\t\x12\x0f\n\x07message\x18\x02 \x01(\t\"\x1d\n\x0bSMSResponse\x12\x0e\n\x06status\x18\x01 \x01(\t\"\x19\n\nLogRequest\x12\x0b\n\x03log\x18\x01 \x01(\t\"\x1d\n\x0bLogResponse\x12\x0e\n\x06status\x18\x01 \x01(\t2B\n\x0bMailService\x12\x33\n\x08SendMail\x12\x11.mail.MailRequest\x1a\x12.mail.MailResponse\"\x00\x32>\n\nSMSService\x12\x30\n\x07SendSMS\x12\x10.mail.SMSRequest\x1a\x11.mail.SMSResponse\"\x00\x32?\n\nLogService\x12\x31\n\x08SendLogs\x12\x10.mail.LogRequest\x1a\x11.mail.LogResponse\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'mail_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_MAILREQUEST']._serialized_start=20
  _globals['_MAILREQUEST']._serialized_end=76
  _globals['_MAILRESPONSE']._serialized_start=78
  _globals['_MAILRESPONSE']._serialized_end=108
  _globals['_SMSREQUEST']._serialized_start=110
  _globals['_SMSREQUEST']._serialized_end=155
  _globals['_SMSRESPONSE']._serialized_start=157
  _globals['_SMSRESPONSE']._serialized_end=186
  _globals['_LOGREQUEST']._serialized_start=188
  _globals['_LOGREQUEST']._serialized_end=213
  _globals['_LOGRESPONSE']._serialized_start=215
  _globals['_LOGRESPONSE']._serialized_end=244
  _globals['_MAILSERVICE']._serialized_start=246
  _globals['_MAILSERVICE']._serialized_end=312
  _globals['_SMSSERVICE']._serialized_start=314
  _globals['_SMSSERVICE']._serialized_end=376
  _globals['_LOGSERVICE']._serialized_start=378
  _globals['_LOGSERVICE']._serialized_end=441
# @@protoc_insertion_point(module_scope)
