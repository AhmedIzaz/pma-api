type TEnvironmentVariables = {
  SERVER_PORT: number;
  MODE: 'DEVELOPMENT' | 'PRODUCTION';
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  JWT_SECRET: string;
};
