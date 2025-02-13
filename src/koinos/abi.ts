export default {
  "methods": {
    "get_my_value": {
      "argument": "",
      "return": "common.str",
      "description": "Get my value",
      "entry_point": 2082118110,
      "read_only": true,
      "entry-point": "0x7c1a99de",
      "read-only": true
    },
    "data_of": {
      "argument": "common.address",
      "return": "pools.userdata",
      "description": "Get user data",
      "entry_point": 2729921907,
      "read_only": true,
      "entry-point": "0xa2b74d73",
      "read-only": true
    },
    "set_my_value": {
      "argument": "common.str",
      "return": "",
      "description": "Set my value",
      "entry_point": 2016693507,
      "read_only": false,
      "entry-point": "0x78344d03",
      "read-only": false
    },
    "set_data_of": {
      "argument": "pools.userdata_args",
      "return": "",
      "description": "Set user data",
      "entry_point": 2537533306,
      "read_only": false,
      "entry-point": "0x973faf7a",
      "read-only": false
    }
  },
  "types": "CoQDCidrb2lub3Nib3gtcHJvdG8vbWFuYXNoYXJlci9jb21tb24ucHJvdG8SBmNvbW1vbhoUa29pbm9zL29wdGlvbnMucHJvdG8iGwoDc3RyEhQKBXZhbHVlGAEgASgJUgV2YWx1ZSIeCgZ1aW50MzISFAoFdmFsdWUYASABKA1SBXZhbHVlIiIKBnVpbnQ2NBIYCgV2YWx1ZRgBIAEoBEICMAFSBXZhbHVlIh0KBWJvb2xlEhQKBXZhbHVlGAEgASgIUgV2YWx1ZSIlCgdhZGRyZXNzEhoKBXZhbHVlGAEgASgMQgSAtRgGUgV2YWx1ZSJdCglsaXN0X2FyZ3MSGgoFc3RhcnQYASABKAxCBIC1GAZSBXN0YXJ0EhQKBWxpbWl0GAIgASgFUgVsaW1pdBIeCgpkZXNjZW5kaW5nGAMgASgIUgpkZXNjZW5kaW5nIi0KCWFkZHJlc3NlcxIgCghhY2NvdW50cxgBIAMoDEIEgLUYBlIIYWNjb3VudHNiBnByb3RvMwq+AQoLcG9vbHMucHJvdG8SBXBvb2xzGhRrb2lub3Mvb3B0aW9ucy5wcm90byI0Cgh1c2VyZGF0YRISCgRuYW1lGAEgASgJUgRuYW1lEhQKBXZhbHVlGAIgASgEUgV2YWx1ZSJUCg11c2VyZGF0YV9hcmdzEh4KB2FjY291bnQYASABKAxCBIC1GAZSB2FjY291bnQSIwoEZGF0YRgCIAEoCzIPLnBvb2xzLnVzZXJkYXRhUgRkYXRhYgZwcm90bzMKHAoLZW1wdHkucHJvdG8SBWVtcHR5YgZwcm90bzM=",
  "koilib_types": {
    "nested": {
      "common": {
        "nested": {
          "str": {
            "fields": {
              "value": {
                "type": "string",
                "id": 1
              }
            }
          },
          "uint32": {
            "fields": {
              "value": {
                "type": "uint32",
                "id": 1
              }
            }
          },
          "uint64": {
            "fields": {
              "value": {
                "type": "uint64",
                "id": 1,
                "options": {
                  "jstype": "JS_STRING"
                }
              }
            }
          },
          "boole": {
            "fields": {
              "value": {
                "type": "bool",
                "id": 1
              }
            }
          },
          "address": {
            "fields": {
              "value": {
                "type": "bytes",
                "id": 1,
                "options": {
                  "(koinos.btype)": "ADDRESS"
                }
              }
            }
          },
          "list_args": {
            "fields": {
              "start": {
                "type": "bytes",
                "id": 1,
                "options": {
                  "(koinos.btype)": "ADDRESS"
                }
              },
              "limit": {
                "type": "int32",
                "id": 2
              },
              "descending": {
                "type": "bool",
                "id": 3
              }
            }
          },
          "addresses": {
            "fields": {
              "accounts": {
                "rule": "repeated",
                "type": "bytes",
                "id": 1,
                "options": {
                  "(koinos.btype)": "ADDRESS"
                }
              }
            }
          }
        }
      },
      "koinos": {
        "options": {
          "go_package": "github.com/koinos/koinos-proto-golang/koinos"
        },
        "nested": {
          "bytes_type": {
            "values": {
              "BASE64": 0,
              "BASE58": 1,
              "HEX": 2,
              "BLOCK_ID": 3,
              "TRANSACTION_ID": 4,
              "CONTRACT_ID": 5,
              "ADDRESS": 6
            }
          },
          "_btype": {
            "oneof": [
              "btype"
            ]
          },
          "btype": {
            "type": "bytes_type",
            "id": 50000,
            "extend": "google.protobuf.FieldOptions",
            "options": {
              "proto3_optional": true
            }
          }
        }
      },
      "pools": {
        "nested": {
          "userdata": {
            "fields": {
              "name": {
                "type": "string",
                "id": 1
              },
              "value": {
                "type": "uint64",
                "id": 2
              }
            }
          },
          "userdata_args": {
            "fields": {
              "account": {
                "type": "bytes",
                "id": 1,
                "options": {
                  "(koinos.btype)": "ADDRESS"
                }
              },
              "data": {
                "type": "userdata",
                "id": 2
              }
            }
          }
        }
      },
      "empty": {}
    }
  },
  "events": {
    "my_value_event": {
      "type": "common.str",
      "argument": "common.str"
    },
    "data_updated": {
      "type": "userdata_args",
      "argument": "userdata_args"
    }
  }
}