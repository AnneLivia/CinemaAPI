import dotenv from 'dotenv';

dotenv.config();

/* It's important to have a config file so that we can change some configuration variables
accordingly to the NODE_ENV = https://codingsans.com/blog/node-config-best-practices, such as
the database used. It's good to use a different database for test, production and development */

// Setting the NODE_ENV to 'dev' enviroment by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const env = process.env.NODE_ENV;

// configuration variables for dev env
const development = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

// configuration variables for test env
const test = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL_TEST,
  JWT_SECRET: process.env.JWT_SECRET,
};

// config with all configuration.
const config = {
  development, // same as development: development
  test,
};

// exporting the exactly configuration based on the env variable
export default config[env];
