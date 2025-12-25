# BACKEND:

ROUTE: `/auth` 

### **POST /register**

Create a new user account.

**Request (JSON)**

```json
{
"name":"John Doe",
"email":"john@example.com",
"password":"password123"
}

```

**Success (200)**

```json
{
"success":true,
"message":"User signed up"
}

```

**Failure**

```json
{"success":false,"message":"Missing details"}

```

```json
{"success":false,"message":"User already exists"}

```

---

### **POST /login**

Authenticate user and set JWT cookie.

**Request (JSON)**

```json
{
"email":"john@example.com",
"password":"password123"
}

```

**Success (200)**

```json
{
"success":true,
"message":"User logged in",
"user":{
"_id":"USER_ID",
"name":"John Doe",
"email":"john@example.com",
"isAccountVerified":false
}
}

```

**Failure**

```json
{"success":false,"message":"Email & Password are required"}

```

```json
{"success":false,"message":"User doesn't exist"}

```

```json
{"success":false,"message":"Password doesn't match"}

```

---

### **POST /logout**

Logs out the current user (clears JWT cookie).

**Request**

- No body required (uses cookie)

**Success**

```json
{
"success":true,
"message":"logged out"
}

```

---

### **POST /send-verify-otp**

Send email verification OTP.

**Request (JSON)**

```json
{
"userId":"USER_ID"
}

```

**Success**

```json
{
"success":true,
"message":"Verification OTP is sent"
}

```

**Failure**

```json
{"success":false,"message":"Account already verified"}

```

---

### **POST /verify-account**

Verify email using OTP.

**Request (JSON)**

```json
{
"otp":"123456"
}

```

**Success**

```json
{
"success":true,
"message":"Email veirified"
}

```

**Failure**

```json
{"success":false,"message":"Missing Details"}

```

```json
{"success":false,"message":"Invalid OTP"}

```

```json
{"success":false,"message":"Expired"}

```

---

### **POST /is-auth**

Check if user is logged in.

**Success**

```json
{
"success":true
}

```

---

### **POST /send-reset-otp**

Send password reset OTP.

**Request (JSON)**

```json
{
"email":"john@example.com"
}

```

**Success**

```json
{
"success":true,
"message":"Reset OTP is sent"
}

```

**Failure**

```json
{"success":false,"message":"Empty Email"}

```

```json
{"success":false,"message":"user doesn't exist"}

```

---

### **POST /reset-password**

Reset password using OTP.

**Request (JSON)**

```json
{
"email":"john@example.com",
"otp":"123456",
"newPassword":"newPassword123"
}

```

**Success**

```json
{
"success":true,
"message":"password has been reset"
}

```

**Failure**

```json
{"success":false,"message":"Invalid OTP"}

```

```json
{"success":false,"message":"Expired"}

```

---

### **POST /get-api-key**

Retrieve existing API key.

**Request (JSON)**

```json
{
"userId":"USER_ID",
"password":"password123"
}

```

**Success**

```json
{
"success":true,
"apiKey":"API_KEY"
}

```

**Failure**

```json
{"success":false,"message":"Password doesn't match"}

```

---

### **POST /request-new-api-key**

Regenerate API key.

**Request (JSON)**

```json
{
"userId":"USER_ID",
"password":"password123"
}

```

**Success**

```json
{
"success":true,
"apiKey":"NEW_API_KEY"
}

```

ROUTE: `/info/user`

### **POST /data**

Fetch logged-in user details.

> This endpoint expects userId to already be injected into req.body (typically via auth middleware not from frontend).
> 

**Request (JSON)**

```json
{
"userId":"USER_ID" 
}

```

---

**Success (200)**

```json
{
		"success":true,
		"user":{
				"_id":"USER_ID",
				"name":"John Doe",
				"email":"john@example.com",
				"isAccountVerified":true,
				"apiKey":"API_KEY"
		}
}

```

---

**Failure Responses**

**Missing userId**

```json
{
"success":false,
"message":"User ID not found"
}

```

**User not found**

```json
{
"success":false,
"message":"User not found"
}

```

**Server error**

```json
{
"success":false,
"message":"Error message"
}

```

ROUTE: `/api`

### **GET /data**

Access protected data using a valid API key.

> This endpoint is intended for external users and must be accessed with a valid API key (typically validated via middleware).
> 

---

**Request Headers**

```
x-api-key: YOUR_API_KEY

```

*(No request body required)*

---

**Success (200)**

```json
{
"success":true,
"data":{
"message":"This is some protected data accessible with a valid API key."
}
}

```

---

**Failure Responses**

**Missing or invalid API key**

```json
{
"success":false,
"message":"Invalid or missing API key"
}

```

**Server error**

```json
{
"success":false,
"message":"Internal server error"
}

```

### **GET /frontend/data/**

Fetch demand data for a given region and timeframe.

> Frontend note: Parameters must be passed via the query string.
> 

---

**Query Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `region` | string | ✅ |  |
| `timeframe` | string | ✅ |  |

**Example Request**

```
GET /get-data?region=CA&timeframe=hourly

```

---

**Success (200)**

```json
{
"success":true,
"data":"Sample data for region: CA and timeframe: hourly"
}

```

---

**Failure Responses**

**Missing query parameters (400)**

```json
{
"success":false,
"message":"region and timeframe are required"
}

```

**Server error (500)**

```json
{
"success":false,
"error":"Error message"
}

```