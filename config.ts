export const SOCKET_PORT = 3000;
export const HTTP_PORT = 8000;
export const DATABASE_URL = "mongodb://database:27017";
export const CLIENT_ID =
  "545923615446-59db1eujj2cj2cacq3fe6cptdrpg6i1m.apps.googleusercontent.com";

// lifetime of json web token (s)
export const TOKEN_LIFETIME = 30 * 24 * 60 * 60;

// max time between http request and socket connection (ms)
export const CONNECTION_TIMEOUT = 5000;

export const PING_TIMEOUT = 10000;
export const PING_INTERVAL = 3000;
