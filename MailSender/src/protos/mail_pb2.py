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




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\nmail.proto\x12\x04mail\"F\n\x0bMailRequest\x12\x0c\n\x04\x66rom\x18\x01 \x01(\t\x12\n\n\x02to\x18\x02 \x01(\t\x12\x0f\n\x07subject\x18\x03 \x01(\t\x12\x0c\n\x04\x62ody\x18\x04 \x01(\t\"\x1e\n\x0cMailResponse\x12\x0e\n\x06status\x18\x01 \x01(\t\"<\n\rBounceRequest\x12\x0c\n\x04\x66rom\x18\x01 \x01(\t\x12\n\n\x02to\x18\x02 \x01(\t\x12\x11\n\tsent_time\x18\x03 \x01(\t\"0\n\x0e\x42ounceResponse\x12\x0e\n\x06status\x18\x01 \x01(\t\x12\x0e\n\x06reason\x18\x02 \x01(\t2\x84\x01\n\x0bMailService\x12\x33\n\x08SendMail\x12\x11.mail.MailRequest\x1a\x12.mail.MailResponse\"\x00\x12@\n\x11\x43heckBounceStatus\x12\x13.mail.BounceRequest\x1a\x14.mail.BounceResponse\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'mail_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_MAILREQUEST']._serialized_start=20
  _globals['_MAILREQUEST']._serialized_end=90
  _globals['_MAILRESPONSE']._serialized_start=92
  _globals['_MAILRESPONSE']._serialized_end=122
  _globals['_BOUNCEREQUEST']._serialized_start=124
  _globals['_BOUNCEREQUEST']._serialized_end=184
  _globals['_BOUNCERESPONSE']._serialized_start=186
  _globals['_BOUNCERESPONSE']._serialized_end=234
  _globals['_MAILSERVICE']._serialized_start=237
  _globals['_MAILSERVICE']._serialized_end=369
# @@protoc_insertion_point(module_scope)
