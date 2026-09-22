# ProjectLens API

## Public
- `POST /api/auth/login` — email/password -> JWT + user
- `GET /api/health` — health check

## Authenticated
- `GET /api/auth/me`
- `GET /api/criteria`
- `GET /api/submissions` — trainer gets qualified review queue; pod users get their pod history
- `GET /api/submissions/{id}`
- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`

## Pod Lead
- `GET /api/pod-lead/dashboard`
- `POST /api/submissions`
- `PUT /api/submissions/{id}`

## Trainer
- `GET /api/trainer/dashboard`
- `POST /api/submissions/{id}/decision`

Authentication uses `Authorization: Bearer <JWT>`.
