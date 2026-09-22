# ProjectLens Angular Frontend

Rebuilt Angular frontend for the ProjectLens Spring Boot backend.

## Stack

- Angular 22
- TypeScript 6
- RxJS 7.8
- Standalone components
- Angular Router
- Angular HttpClient
- Angular Forms

## Backend integration

The frontend uses relative `/api/...` URLs and the Angular development proxy.

Proxy target:

`http://localhost:8081`

Do not hardcode `localhost:8081` inside `ApiService`.

## Run

```cmd
npm install
npm start
```

Open:

`http://localhost:4200`

Make sure the Spring Boot backend is running on port `8081`.

## Important behavior

- Authentication token is stored in localStorage and attached to protected API calls.
- A 401 automatically clears the local session and redirects to login.
- Dashboard, submissions, reviews, notifications and criteria show explicit loading/error states.
- API failures are not converted into fake zero values.
- Pod Lead and Pod Member use `/api/pod-lead/dashboard`.
- Trainer uses `/api/trainer/dashboard`.
- Trainer submissions are intentionally limited by the backend to `PENDING_TRAINER_REVIEW`.
- Pod Lead submissions are loaded from `/api/submissions` for the logged-in Pod Lead.
- Submission creation/revision navigates to the submissions page only after the backend confirms success.
- Required submission fields are validated in the browser before sending the request.
