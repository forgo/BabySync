# User

| Endpoint | Description |
| ---- | --------------- |
| [POST /api/v1/user/](#post-user) | Request new user
| [GET /api/v1/user/](#get-user-list) | Request user list |
| [GET /api/v1/user/:id](#get-user-by-id) | Request user with id |
| [PUT /api/v1/user/](#put-user-batch) | Request bulk user update  |
| [PUT /api/v1/user/:id](#put-user-by-id) | Request user edit with id |
| [DELETE /api/v1/user/](#delete-user-batch) | Request bulk user delete |
| [DELETE /api/v1/user/:id](#delete-user-by-id) | Request user delete with id |


### POST User

#### Request Example
```json
{
	"username": "test_user",
	"password": "test_user_password1",
	"firstname": "Test",
	"lastname": "User",
	"email": "test_user@digeocache.com",
	"birthday": "1969-12-31T06:00:00.000Z",
	"phone": "5558675309"
}
```

#### Success Response Example
```json
{
    "data": {
        "id": 89,
        "username": "test_user",
        "firstname": "Test",
        "lastname": "User",
        "email": "test_user@digeocache.com",
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
        "username": "test_user",
        "firstname": "Test",
        "lastname": "User",
        "email": "test_user@digeocache.com",
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

### GET User List

#### Success Response Example
```json
{
    "data": [
        {
            "id": 76,
            "username": "test_get_user1",
            "firstname": "TestGet",
            "lastname": "User1",
            "email": "test_get_user1@gmail.com",
            "birthday": "1969-12-31T06:00:00.000Z",
            "phone": "5558675309",
            "created_on": "2015-05-28T17:36:54.652Z",
            "updated_on": "2015-05-28T17:36:54.652Z",
            "login_on": "2015-05-28T17:36:55.544Z"
        },
        {
            "id": 77,
            "username": "test_get_user2",
            "firstname": "TestGet",
            "lastname": "User2",
            "email": "test_get_user2@gmail.com",
            "birthday": "1969-12-31T06:00:00.000Z",
            "phone": "5558675309",
            "created_on": "2015-05-28T17:36:54.745Z",
            "updated_on": "2015-05-28T17:36:54.745Z",
            "login_on": ""
        },
        {
            "id": 78,
            "username": "test_get_user3",
            "firstname": "TestGet",
            "lastname": "User3",
            "email": "test_get_user3@gmail.com",
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

### GET User By ID



#### Success Response Example
##### /api/v1/user/76
```json
{
    "data": {
        "id": 76,
        "username": "test_get_user1",
        "firstname": "TestGet",
        "lastname": "User1",
        "email": "test_get_user1@gmail.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309",
        "created_on": "2015-05-28T17:36:54.652Z",
        "updated_on": "2015-05-28T17:36:54.652Z",
        "login_on": "2015-05-28T17:36:55.544Z"
    }
}
```

##### /api/v1/user/test_get_user2
```json
{
    "data": {
        "id": 77,
        "username": "test_get_user2",
        "firstname": "TestGet",
        "lastname": "User2",
        "email": "test_get_user2@gmail.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309",
        "created_on": "2015-05-28T17:36:54.745Z",
        "updated_on": "2015-05-28T17:36:54.745Z",
        "login_on": ""
    }
}
```

##### /api/v1/user/test_get_user3@gmail.com
```json
{
    "data": {
        "id": 78,
        "username": "test_get_user3",
        "firstname": "TestGet",
        "lastname": "User3",
        "email": "test_get_user3@gmail.com",
        "birthday": "1969-12-31T06:00:00.000Z",
        "phone": "5558675309",
        "created_on": "2015-05-28T17:36:54.884Z",
        "updated_on": "2015-05-28T17:36:54.884Z",
        "login_on": "2015-05-28T17:58:18.319Z"
    }
}
```

#### Failed Response Example
##### /api/v1/user/&
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

### PUT User Batch

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

### PUT User By ID

#### Request Example
##### /api/v1/user/76
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
        "username": "test_get_user1",
        "firstname": "TestGet",
        "lastname": "User1",
        "email": "test_get_user1@gmail.com",
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

### DELETE User Batch

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

### DELETE User By ID

#### Success Response Example
##### /api/v1/user/76
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
##### /api/v1/user/76
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