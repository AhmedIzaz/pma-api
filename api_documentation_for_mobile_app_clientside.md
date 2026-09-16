# API Documentation

This document lists the APIs for Users, Prompts, and Payments modules, including their request bodies, parameters, headers, queries, and responses.

## Base URL

Assuming the base URL of the application.

---

## 1. Users Module ( `/users` )

### 1.1 User Registration

- **Endpoint:** `POST /users/registration`
- **Description:** Register a new user with email and password.
- **Headers:** None
- **Params:** None
- **Query:** None
- **Request Body (`UserRegistrationDTO`):**
    ```json
    {
        "userName": "string (4-50 chars)",
        "userEmail": "string (valid email)",
        "userPassword": "string (4-50 chars)"
    }
    ```
- **Response (`UserRegistrationResponseDTO`):**
    ```json
    {
        "userId": "number",
        "userName": "string",
        "userEmail": "string"
    }
    ```

### 1.2 User Login

- **Endpoint:** `POST /users/login`
- **Description:** Login with email and password.
- **Headers:** None
- **Params:** None
- **Query:** None
- **Request Body (`UserLoginDTO`):**
    ```json
    {
        "userEmail": "string (valid email)",
        "userPassword": "string (4-50 chars, optional depending on flow)"
    }
    ```
- **Response (`UserLoginResponseDTO`):**
    ```json
    {
        "user": {
            "userId": "number",
            "userName": "string",
            "userEmail": "string"
        },
        "accessToken": "string (JWT)"
    }
    ```

### 1.3 Google OAuth Login

- **Endpoint:** `POST /users/google-oauth`
- **Description:** Login or register via Google OAuth.
- **Headers:** None
- **Params:** None
- **Query:** None
- **Request Body (`GoogleOAuthDTO`):**
    ```json
    {
        "idToken": "string (Google ID token from mobile SDK)"
    }
    ```
- **Response (`UserLoginResponseDTO`):** (Same as Login)

### 1.4 List Doctors

- **Endpoint:** `GET /users/doctors`
- **Description:** List all doctors and their services.
- **Headers:** None
- **Params:** None
- **Query:** None
- **Request Body:** None
- **Response:** List of doctors with their services.

### 1.5 Book Appointment

- **Endpoint:** `POST /users/appointments`
- **Description:** Book an appointment with a doctor.
- **Headers:**
    - `Authorization: Bearer <token>`
- **Params:** None
- **Query:** None
- **Request Body (`BookAppointmentDTO`):**
    ```json
    {
        "doctorId": "number",
        "serviceId": "number (optional)",
        "startTime": "string (ISO Date)",
        "requestedDurationHours": "number (optional)"
    }
    ```
- **Response:** Consultation creation details.

### 1.6 List User Appointments

- **Endpoint:** `GET /users/appointments`
- **Description:** List all appointments taken by the logged-in user.
- **Headers:**
    - `Authorization: Bearer <token>`
- **Params:** None
- **Query:** None
- **Request Body:** None
- **Response (`UsersAppointmentListDTO` array):**
    ```json
    [
        {
            "consultationId": "number",
            "doctor": {
                "doctorId": "number",
                "doctorName": "string",
                "doctorEmail": "string",
                "specialization": "string (optional)",
                "qualifications": "string (optional)",
                "phoneNumber": "string (optional)",
                "bio": "string (optional)"
            },
            "service": {
                "serviceId": "number",
                "serviceName": "string",
                "costPerHour": "number",
                "durationHours": "number",
                "totalCost": "number",
                "isActive": "boolean",
                "doctorId": "number"
            }
        }
    ]
    ```

### 1.7 Get Consultation Prescriptions

- **Endpoint:** `GET /users/consultations/:id/prescriptions`
- **Description:** Get prescriptions for a specific consultation.
- **Headers:**
    - `Authorization: Bearer <token>`
- **Params:**
    - `id` (number) - Consultation ID
- **Query:** None
- **Request Body:** None
- **Response (`PrescriptionResponseDTO` array):**
    ```json
    [
        {
            "prescriptionId": "number",
            "consultationId": "number",
            "fileRef": "string",
            "fileName": "string",
            "dateInfo": {
                "createdAt": "string (ISO Date)",
                "updatedAt": "string (ISO Date)"
            }
        }
    ]
    ```

### 1.8 Verify Prescription

- **Endpoint:** `POST /users/prescriptions/:id/verify`
- **Description:** Verify a prescription file against DB and Blockchain.
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: multipart/form-data`
- **Params:**
    - `id` (string) - Prescription ID
- **Query:** None
- **Request Body:**
    - `file` (Express.Multer.File)
- **Response (`VerifyPrescriptionResponseDTO`):**
    ```json
    {
        "isDbMatch": "boolean",
        "isBlockchainMatch": "boolean",
        "fileHash": "string",
        "storedHash": "string",
        "blockchainTxHash": "string (optional)",
        "blockchainId": "number (optional)"
    }
    ```

### 1.9 Get Consultation Conference

- **Endpoint:** `GET /users/consultations/:id/conference`
- **Description:** Get conference credentials (Zego app configuration and consultation details) for a specific consultation.
- **Headers:**
    - `Authorization: Bearer <token>`
- **Params:**
    - `id` (string) - Consultation ID
- **Query:** None
- **Request Body:** None
- **Response (`UserConferenceResponseDTO`):**
    ```json
    {
        "appId": "string", (actual value: Buffer.from(base64AppId, 'base64').toString('utf-8'))
        "serverSecret": "string", (actual value: Buffer.from(base64ServerSecret, 'base64').toString('utf-8'))
        "consultationId": "string",
        "userId": "number",
        "userName": "string"
    }
    ```

---

## 2. Prompts Module ( `/prompt` )

### 2.1 Get Prompts

- **Endpoint:** `GET /prompt/get-prompts`
- **Description:** Retrieve prompts associated with the logged-in user with pagination.
- **Headers:**
    - `Authorization: Bearer <token>`
- **Params:** None
- **Query (`GetPromptQueryDTO`):**
    - `afterCursor`: string (optional)
    - `limit`: number (max 1,000,000)
- **Request Body:** None
- **Response (`GetPromptsResponseDTO`):**
    ```json
    {
        "data": [
            {
                "id": "string",
                "generatedBy": "USER | SYSTEM",
                "text": "string (optional)",
                "triageLevel": "HIGH | MEDIUM | LOW (optional)",
                "firstAidString": "string (optional)",
                "hospitalLookupNeeded": "boolean (optional)",
                "dateInfo": "any"
            }
        ],
        "nextCursor": "string (optional)"
    }
    ```

### 2.2 Health Progress

- **Endpoint:** `GET /prompt/health-progress`
- **Description:** Health progress summary for graph visualization.
- **Headers:**
    - `Authorization: Bearer <token>`
- **Params:** None
- **Query (`HealthProgressQueryDTO`):**
    - `period`: "daily" | "weekly" | "monthly" (optional)
    - `from`: string (ISO Date, optional)
    - `to`: string (ISO Date, optional)
- **Request Body:** None
- **Response (`HealthProgressResponseDTO`):**
    ```json
    {
        "summary": {
            "totalInteractions": "number",
            "averageSeverity": "HIGH | MEDIUM | LOW",
            "overallDelta": "IMPROVING | WORSENING | STABLE",
            "periodStart": "string (optional)",
            "periodEnd": "string (optional)"
        },
        "timeline": [
            {
                "date": "string",
                "severityScore": "number",
                "triageCounts": {
                    "HIGH": "number",
                    "MEDIUM": "number",
                    "LOW": "number"
                },
                "totalPrompts": "number",
                "hospitalLookupCount": "number",
                "delta": {
                    "direction": "IMPROVING | WORSENING | STABLE",
                    "change": "number"
                }
            }
        ],
        "frequencyMap": {
            "HIGH": "number",
            "MEDIUM": "number",
            "LOW": "number"
        }
    }
    ```

### 2.3 Create Prompt

- **Endpoint:** `POST /prompt/create-backup`
- **Description:** Create a new prompt .
- **Headers:**
    - `Authorization: Bearer <token>`
- **Params:** None
- **Query:** None
- **Request Body (`CreatePromptDTO`):**
    ```json
    {
        "text": "string",
        "generatedBy": "USER | SYSTEM (optional)"
    }
    ```
- **Response (`CreatePromptBackupResponseDTO`):**
    ```json
    {
        "generatedBy": "USER | SYSTEM",
        "triageLevel": "HIGH | MEDIUM | LOW",
        "firstAid": {
            "code": "string",
            "description": {
                "title": "string",
                "steps": ["string"]
            }
        },
        "hospitalLookupNeeded": "boolean",
        "message": "string (optional)"
    }
    ```

---

## 3. Payments Module ( `/doctor/payments` )

_Note: The routes are prefixed with `/doctor/payments`._

### 3.1 Initiate Payment

- **Endpoint:** `POST /doctor/payments/initiate`
- **Description:** Initiate a payment process.
- **Headers:** None specific required by the controller (assumed open or handled by service)
- **Params:** None
- **Query:** None
- **Request Body (`InitiatePaymentDto`):**
    ```json
    {
        "amount": "number",
        "userId": "number",
        "consultationId": "number"
    }
    ```
- **Response:** Payment initiation details (e.g., gateway URL, transaction ID).

### 3.2 Payment Success

- **Endpoint:** `POST /doctor/payments/success`
- **Description:** Callback for payment success.
- **Headers:** None
- **Params:** None
- **Query:** None
- **Request Body:** `any` (Typically Gateway form data)
- **Response:** Success confirmation / redirection.
