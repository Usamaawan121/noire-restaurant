# NOIRÉ REST API

All paths below are relative to `/api`. JSON responses wrap success in `{"data": ...}` and errors in `{"error":"message"}`. Protected endpoints require `Authorization: Bearer <token>`. Write requests send `Content-Type: application/json`.

| Method and path | Purpose |
| --- | --- |
| GET /health | Application status and restaurant timezone |
| GET /menu | Dishes, prices and current availability |
| GET /availability?date=YYYY-MM-DD&time=17:00&guests=2 | Tables with enough seats and no overlapping active booking |
| POST /reservations | Create pending reservation and return reference |
| POST /messages | Store a contact message |
| POST /auth/login | Exchange admin credentials for a two-hour JWT |
| GET /admin/dashboard | Counts, seven-day trend and recent activity |
| GET /admin/reservations | List bookings with table details |
| PATCH /admin/reservations/:id | Update date, time, guests, table, notes or status |
| GET /admin/tables | List current tables |
| POST /admin/tables | Create table |
| PATCH /admin/tables/:id | Edit table properties |
| DELETE /admin/tables/:id | Archive table |
| GET /admin/menu | List dishes |
| POST /admin/menu | Create dish |
| PATCH /admin/menu/:id | Edit dish |
| DELETE /admin/menu/:id | Remove dish |
| GET /admin/customers | List customer profiles |
| GET /admin/customers/:id | Profile and booking history |
| GET /admin/messages | List inbox |
| PATCH /admin/messages/:id | Set read status |
| DELETE /admin/messages/:id | Remove message |

## Example request bodies

Choose a date in the next 180 days and substitute a table ID returned by availability.

```json
{"name":"Demo Guest","email":"guest@example.com","phone":"+92 300 1234567","date":"2026-12-01","time":"19:00","guests":2,"table":"0123456789abcdef01234567","notes":"Window seat if possible"}
```

Login: `{"email":"admin@example.com","password":"your seeded password"}`

Reservation update: `{"status":"confirmed"}`. Valid statuses are pending, confirmed, rejected, completed and cancelled.

Table: `{"number":"07","capacity":4,"category":"Window","available":true}`

Dish: `{"name":"Ribeye","category":"Mains","description":"Cooked over charcoal","price":5400,"image":"/photos/1546833999-b9f581a1996d.jpg","available":true}`

Contact: `{"name":"Demo Guest","email":"guest@example.com","subject":"Private dining","message":"Can you accommodate a group of eight?"}`

Inbox update: `{"read":true}`

New records return 201. Invalid credentials or missing tokens return 401, unauthorized roles return 403, missing records return 404, conflicts return 409, validation errors return 422 and throttled requests return 429.
