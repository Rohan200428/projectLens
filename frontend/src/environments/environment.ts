export const environment = {
  production: false,
  // Empty string = requests go to /api on the same origin, which
  // proxy.conf.json forwards to the local Spring Boot backend.
  apiBaseUrl: ''
};
