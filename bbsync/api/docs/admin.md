# Admin

| Endpoint | Description |
| ---- | --------------- |
| [POST /api/v1/admins/](#post-admin) | Request new admin
| [GET /api/v1/admins/](#get-admin-list) | Request admin list |
| [GET /api/v1/admins/:id](#get-admin-by-id) | Request admin with id |
| [PUT /api/v1/admins/](#put-admin-batch) | Request bulk admin update  |
| [PUT /api/v1/admins/:id](#put-admin-by-id) | Request admin edit with id |
| [DELETE /api/v1/admins/](#delete-admin-batch) | Request bulk admin delete |
| [DELETE /api/v1/admins/:id](#delete-admin-by-id) | Request admin delete with id |

### POST Admin

#### Request Example
```json
{
	"username": "test_admin",
	"password": "test_admin_password1",
	"firstname": "Test",
	"lastname": "Admin",
	"email": "test_admin@digeocache.com",
	"birthday": "1969-12-31T06:00:00.000Z",
	"phone": "5558675309"
}
```

#### Success Response Example
```json
{
    "data": {
        "id": 89,
        "username": "test_admin",
        "firstname": "Test",
        "lastname": "Admin",
        "email": "test_admin@digeocache.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309",
        "created_on": "2015-05-28T17:58:37.525Z",
        "updated_on": "2015-05-28T17:58:37.525Z",
        "login_on": ""
    }
}
```

#### Failed Response Example
```json
{
    "data": {
        "username": "test_admin",
        "firstname": "Test",
        "lastname": "Admin",
        "email": "test_admin@digeocache.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309"
    },
    "errors": [
        {
            "code": 3006,
            "attribute": "username",
            "message": "username taken"
        },
        {
            "code": 3007,
            "attribute": "email",
            "message": "email taken"
        }
    ]
}
```

### GET Admin List

#### Success Response Example
```json
{
    "data": [
        {
            "id": 76,
            "username": "test_get_admin1",
            "firstname": "TestGet",
            "lastname": "Admin1",
            "email": "test_get_admin1@gmail.com",
            "birthday": "1969-12-31T06:00:00.000Z",
            "phone": "5558675309",
            "created_on": "2015-05-28T17:36:54.652Z",
            "updated_on": "2015-05-28T17:36:54.652Z",
            "login_on": "2015-05-28T17:36:55.544Z"
        },
        {
            "id": 77,
            "username": "test_get_admin2",
            "firstname": "TestGet",
            "lastname": "Admin2",
            "email": "test_get_admin2@gmail.com",
            "birthday": "1969-12-31T06:00:00.000Z",
            "phone": "5558675309",
            "created_on": "2015-05-28T17:36:54.745Z",
            "updated_on": "2015-05-28T17:36:54.745Z",
            "login_on": ""
        },
        {
            "id": 78,
            "username": "test_get_admin3",
            "firstname": "TestGet",
            "lastname": "Admin3",
            "email": "test_get_admin3@gmail.com",
            "birthday": "1969-12-31T06:00:00.000Z",
            "phone": "5558675309",
            "created_on": "2015-05-28T17:36:54.884Z",
            "updated_on": "2015-05-28T17:36:54.884Z",
            "login_on": "2015-05-28T17:58:18.319Z"
        }
    ]
}
```

#### Failed Response Example
```json
{
    "errors": [
        {
            "code": 1001,
            "message": "Unauthorized to view this resource."
        }
    ]
}
```

### GET Admin By ID



#### Success Response Example
##### /api/v1/admin/76
```json
{
    "data": {
        "id": 76,
        "username": "test_get_admin1",
        "firstname": "TestGet",
        "lastname": "Admin1",
        "email": "test_get_admin1@gmail.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309",
        "created_on": "2015-05-28T17:36:54.652Z",
        "updated_on": "2015-05-28T17:36:54.652Z",
        "login_on": "2015-05-28T17:36:55.544Z"
    }
}
```

##### /api/v1/admin/test_get_admin2
```json
{
    "data": {
        "id": 77,
        "username": "test_get_admin2",
        "firstname": "TestGet",
        "lastname": "Admin2",
        "email": "test_get_admin2@gmail.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309",
        "created_on": "2015-05-28T17:36:54.745Z",
        "updated_on": "2015-05-28T17:36:54.745Z",
        "login_on": ""
    }
}
```

##### /api/v1/admin/test_get_admin3@gmail.com
```json
{
    "data": {
        "id": 78,
        "username": "test_get_admin3",
        "firstname": "TestGet",
        "lastname": "Admin3",
        "email": "test_get_admin3@gmail.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309",
        "created_on": "2015-05-28T17:36:54.884Z",
        "updated_on": "2015-05-28T17:36:54.884Z",
        "login_on": "2015-05-28T17:58:18.319Z"
    }
}
```

#### Failed Response Example
##### /api/v1/admin/&
```json
{
    "errors": [
        {
            "code": 3002,
            "message": "unidentifiable from: &"
        }
    ]
}
```

### PUT Admin Batch

* This functionality is not yet implemented

#### Failed Response Example
```json
{
    "data": {
        "phone": "8675308"
    },
    "errors": [
        {
            "code": 1003,
            "message": "Unsupported API operation."
        }
    ]
}
```

### PUT Admin By ID

#### Request Example
##### /api/v1/admin/76
```json
{
	"phone": "8675308"
}
```

#### Success Response Example
```json
{
    "data": {
        "id": 76,
        "username": "test_get_admin1",
        "firstname": "TestGet",
        "lastname": "Admin1",
        "email": "test_get_admin1@gmail.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "8675308",
        "created_on": "2015-05-28T17:36:54.652Z",
        "updated_on": "2015-05-28T18:12:58.912Z",
        "login_on": "2015-05-28T17:36:55.544Z"
    }
}
```

#### Failed Response Example
```json
{
    "data": {
        "dne": "8675308"
    },
    "errors": [
        {
            "code": 3005,
            "attribute": "dne",
            "message": "dne invalid"
        }
    ]
}
```

### DELETE Admin Batch

* This functionality is not yet implemented

#### Failed Response Example
```json
{
    "data": {
        "phone": "8675308"
    },
    "errors": [
        {
            "code": 1003,
            "message": "Unsupported API operation."
        }
    ]
}
```

### DELETE Admin By ID

#### Success Response Example
##### /api/v1/admin/76
```json
{
    "data": {
        "affected": 1,
        "ids": [
            76
        ]
    }
}
```

#### Failed Response Example
##### /api/v1/admin/76
```json
{
    "data": {
        "false": ""
    },
    "errors": [
        {
            "code": 3002,
            "message": "unidentifiable from: 76"
        }
    ]
}
```