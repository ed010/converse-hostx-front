# Request Logs API — FE Integration Guide

Read-only endpoints for browsing what the backend exchanged with **ARCA / EPG** (outbound) and what external
systems sent us (**HostX** `ecommerce.php` / `pos_api/*` and **Apple Pay** callbacks — inbound).

Two log tables back these endpoints:

| Table | What's in it | Endpoint |
|---|---|---|
| `arca_request_logs` | Every HTTP call the backend makes to ARCA / EPG: URL, request body, response body, status code, exception, duration | `GET /api/Logs/arca` |
| `hostx_request_logs` | Every inbound request from HostX / Apple Pay: method, path, body, response, status code, exception, duration, client IP | `GET /api/Logs/hostx` |

Every row carries correlation columns — **`merchantId`**, **`transactionId`**, **`pxNumber`** (hash order id),
`orderNumber`, `arcaOrderId` — so both tables can be filtered by the same identifiers. Rows produced while
serving one inbound request share a **`correlationId`** (also returned to the caller in the
`X-Correlation-Id` response header).

Secrets are already masked before storage: passwords in ARCA URLs, `token` / `paymentData` / `paymentToken`
in bodies are stored as `***`. Bodies longer than 64 KB are truncated with a `…[truncated N chars]` marker.

## Auth

All endpoints require a JWT with the **Admin** role:

```
Authorization: Bearer <token>
```

Get the token from `POST /api/Login/LoginAdmin` as usual. `401` = missing/expired token, `403` = not Admin.

---

## 1. List ARCA / EPG calls

```
GET /api/Logs/arca
```

Query parameters (all optional, combined with AND):

| Param | Type | Meaning |
|---|---|---|
| `merchantId` | int | Internal merchant id |
| `transactionId` | int | Internal transaction id |
| `pxNumber` | string | Transaction hash order id (HostX `pxNumber`) |
| `orderNumber` | string | Merchant order number as registered with ARCA |
| `arcaOrderId` | string | ARCA order id (`mdOrder`) |
| `apiType` | string | ARCA operation, contains-match: `register.do`, `getOrderStatusExtended.do`, `reverse.do`, `refund.do`, `applepay/payment/encrypted`, … |
| `correlationId` | string | Rows of one inbound request |
| `from` / `to` | ISO 8601 UTC | `createdAt >= from`, `createdAt < to` |
| `isSuccess` | bool | `false` → only failed calls |
| `statusCode` | int | HTTP status returned by ARCA |
| `search` | string | Contains-search in request/response body, URL, exception |
| `page` | int | 1-based, default 1 |
| `pageSize` | int | default 50, max 500 |

Example — everything ARCA-related for one transaction:

```
GET /api/Logs/arca?transactionId=1234&page=1&pageSize=20
GET /api/Logs/arca?pxNumber=d41d8cd98f00b204e9800998ecf8427e
GET /api/Logs/arca?merchantId=42&from=2026-08-01T00:00:00Z&isSuccess=false
```

Response `200`:

```json
{
  "items": [
    {
      "id": 118,
      "createdAt": "2026-08-23T14:03:22.51",
      "apiType": "register.do",
      "httpMethod": "POST",
      "requestUrl": "https://epg.arca.am/payment/rest/register.do?userName=27530052_token&password=***&amount=100000&...",
      "requestBody": null,
      "responseStatusCode": 200,
      "responseBody": "{\"orderId\":\"f3b2c6e1-...\",\"formUrl\":\"...\"}",
      "isSuccess": true,
      "exceptionMessage": null,
      "durationMs": 412,
      "correlationId": "0af7651916cd43dd8448eb211c80319c",
      "merchantId": 42,
      "transactionId": 1234,
      "pxNumber": "d41d8cd98f00b204e9800998ecf8427e",
      "arcaOrderId": "f3b2c6e1-...",
      "orderNumber": "1234ConverseBank"
    }
  ],
  "totalCount": 7,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

`GET /api/Logs/arca/{id}` returns a single row (same shape as one item), `404` with
`{"success":false,"errorCode":"LOG_NOT_FOUND",...}` when it doesn't exist.

---

## 2. List inbound HostX / Apple Pay requests

```
GET /api/Logs/hostx
```

Same common parameters as above (`merchantId`, `transactionId`, `pxNumber`, `orderNumber`, `correlationId`,
`from`, `to`, `isSuccess`, `statusCode`, `search`, `page`, `pageSize`) plus:

| Param | Type | Meaning |
|---|---|---|
| `action` | string | Logical operation, contains-match: `register`, `check_status`, `HostX/Reverse`, `HostX/Refund`, `Payment/ProcessApplepayTransaction`, `Payment/GetSessionInfo` |
| `path` | string | Path prefix, e.g. `/pos_api/` |

Examples:

```
GET /api/Logs/hostx?pxNumber=d41d8cd98f00b204e9800998ecf8427e
GET /api/Logs/hostx?merchantId=42&action=check_status&from=2026-08-20T00:00:00Z
GET /api/Logs/hostx?isSuccess=false&page=1&pageSize=50
```

Response `200`:

```json
{
  "items": [
    {
      "id": 57,
      "createdAt": "2026-08-23T14:03:22.29",
      "httpMethod": "POST",
      "path": "/ecommerce.php",
      "queryString": "?c=register",
      "action": "register",
      "requestBody": "{\"merchant_id\":42,\"amount\":1000,\"orderNumber\":\"ORD-1\",\"token\":\"***\",...}",
      "responseStatusCode": 200,
      "responseBody": "{\"success\":1,\"content\":{\"formUrl\":\"...\",\"pxNumber\":\"d41d8...\"}}",
      "isSuccess": true,
      "exceptionMessage": null,
      "durationMs": 693,
      "correlationId": "0af7651916cd43dd8448eb211c80319c",
      "clientIp": "10.1.2.3",
      "merchantId": 42,
      "transactionId": 1234,
      "pxNumber": "d41d8cd98f00b204e9800998ecf8427e",
      "orderNumber": "ORD-1"
    }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 50,
  "totalPages": 1
}
```

`GET /api/Logs/hostx/{id}` → single row / `404`.

Failed requests: `isSuccess` is `false` when the status code is ≥ 400 **or** an exception was raised;
`exceptionMessage` then carries the message (e.g. `INVALID_MERCHANT_TOKEN`). Note the HostX `check_status`
contract returns HTTP 200 with `success: 0` on business failures — such rows have `isSuccess: true` at HTTP
level, look at `responseBody` for the business outcome.

---

## 3. Trace one request end-to-end

```
GET /api/Logs/trace/{correlationId}
```

Returns the inbound request(s) and every ARCA call made while serving it:

```json
{
  "correlationId": "0af7651916cd43dd8448eb211c80319c",
  "inboundRequests": [ { ...hostx row... } ],
  "arcaRequests": [ { ...arca row (register.do)... }, { ...arca row (getOrderStatusExtended.do)... } ]
}
```

Useful UI pattern: on any log row, "show full trace" → this endpoint with the row's `correlationId`.

---

## 4. Full history of a transaction

```
GET /api/Logs/transaction?transactionId=1234
GET /api/Logs/transaction?pxNumber=d41d8cd98f00b204e9800998ecf8427e
```

One of the two parameters is required (`400` `INVALID_PARAMETERS` otherwise). Returns an **array of traces**
(same shape as §3), one per inbound request, ordered chronologically — i.e. the transaction's whole life:
registration, payment, status checks, refund…  ARCA calls made outside a logged inbound request (e.g. from
the merchant cabinet UI) appear as traces with an empty `inboundRequests` array.

---

## Errors

Errors use the standard envelope produced by the backend middleware:

```json
{ "success": false, "errorCode": "LOG_NOT_FOUND", "errorMessage": "LOG_NOT_FOUND", "validationErrors": null }
```

| Code | HTTP | When |
|---|---|---|
| `LOG_NOT_FOUND` | 404 | `arca/{id}` / `hostx/{id}` id doesn't exist |
| `INVALID_PARAMETERS` | 400 | `trace`/`transaction` called without the required identifier |

## Notes for the FE

- Timestamps (`createdAt`) are **UTC**.
- Bodies are raw strings (JSON as sent/received) — pretty-print with `JSON.parse` inside a try/catch, since
  bodies may be truncated or non-JSON.
- Default sort is newest-first; there is no client-side sort parameter.
- Logging can be turned off per direction in backend config (`RequestLogging` section); the endpoints keep
  working, they just return what was captured.
