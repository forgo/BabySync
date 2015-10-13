# Authentication

| Endpoint | Description |
| ---- | --------------- |
| [POST /api/v1/auth/admin/](#post-admin-login) | Request new admin
| [POST /api/v1/auth/user/](#post-user-login) | Request admin list |
| [GET /api/v1/auth/logout/](#get-logout) | Request bulk admin update  |

### POST Admin Login

#### Request Example
```json
{
	"username": "test_admin",
	"password": "test_admin_pasword1"
}
```

#### Success Response Example
```json
{
    "data": {
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJkaWdlb2NhY2hlIiwidXNlcm5hbWUiOiJ0ZXN0X3Bvc3RfZXhpc3RpbmdfYWRtaW4xIiwiYWRtaW4iOnRydWUsImlhdCI6MTQzMjgzNDUxMCwiZXhwIjoxNDMyODQxNzEwfQ.ETykiIdT0iLcjHtOSbUrAXgPf9RijMqB7_K-jlTCIDB5x9ii5y5Ei459ypDsV0rXaxU-uECpDYM9jeOdLsZWN2RosuXt98TmF1MqyUTohdS8CdA0ubbvIUWGG6hpuaRepNBpuYRWJU-Qij9mNl6-9ROoY8sPeF2aqPZ4M0lSHKc"
    }
}
```

#### Failed Response Example
```json
{
    "data": {
        "username": "test_admin"
    },
    "errors": [
        {
            "code": 3001,
            "message": "bad credentials"
        }
    ]
}
```

### POST User Login

#### Request Example
```json
{
	"username": "test_user",
	"password": "test_user_pasword1"
}
```

#### Success Response Example
```json
{
    "data": {
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJkaWdlb2NhY2hlIiwidXNlcm5hbWUiOiJ0ZXN0X3Bvc3RfZXhpc3RpbmdfYWRtaW4xIiwiYWRtaW4iOnRydWUsImlhdCI6MTQzMjgzNDUxMCwiZXhwIjoxNDMyODQxNzEwfQ.ETykiIdT0iLcjHtOSbUrAXgPf9RijMqB7_K-jlTCIDB5x9ii5y5Ei459ypDsV0rXaxU-uECpDYM9jeOdLsZWN2RosuXt98TmF1MqyUTohdS8CdA0ubbvIUWGG6hpuaRepNBpuYRWJU-Qij9mNl6-9ROoY8sPeF2aqPZ4M0lSHKc"
    }
}
```

#### Failed Response Example
```json
{
    "data": {
        "username": "test_admin"
    },
    "errors": [
        {
            "code": 3001,
            "message": "bad credentials"
        }
    ]
}
```

### GET Logout

#### Success Response Example
```json
{
    "data": {
        "redirect": "/go/here/after/logout"
    }
}
```

#### Failed Response Example
```json
{
    "data": {
        "redirect": "/go/here/after/failed/logout"
    },
    "errors": [
        {
            "code": 3002,
            "message": "logout failure"
        }
    ]
}
```