# NodeTS Starter

This starter was created to serve as a starting template for a Node.js API built with Express and TypeScript.

## Features

- [TypeScript](https://www.typescriptlang.org/) - for type safety and other awesome features not native to vanilla JavaScript.
- [Express](https://expressjs.com/) - Micro-framework for setting up routes, middlewares, controllers.
- [Nodemailer](https://nodemailer.com/) - For all your mailing needs.
- [Mongoose](https://mongoosejs.com/) - ODM for connection to and querying of [MongoDB](https://www.mongodb.com/) collections.

## Roadmap

- [x] Database connection with mongoose
- [x] Linting with eslint and prettier
- [x] Mailing service with node mailer
- [x] Error handling
- [x] Logging for errors
- [x] Handle graceful shutdown of server
- [ ] Dependency injection for the service layer
- [x] API validation logic (joi)
- [ ] Unit tests with mocha, chai
- [ ] Continuous integration with TravisCI
- [ ] Docker setup with docker-compose

## Environment Variables

To begin using the starter project, first copy the example variables into a .env file `cp .env.example .env`. You will need to modify the following environment variables in your .env file for your app to run:

`APP_PORT`

`APP_BASE_URL`

`APP_LOG_LEVEL`

`APP_LOCALE`

`APP_TIMEZONE`

`MONGO_PROVIDER` - local or atlas([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

`MONGO_HOST` - if atlas, pass the domain provided after the `@` symbol when you click on `connect` > `Connect your application`

`CLIENT_BASE_URL` - base url for the front-end client application

Other configurations to change are all listed in the created .env file.

## Run Locally

Clone the project

```bash
  git clone https://github.com/PeterKitonga/nodetsstarter
```

Go to the project directory

```bash
  cd nodetsstarter
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run serve
```

## Deployment

Install dependencies first

```bash
  npm install
```

To deploy this project in production, run

```bash
  npm run build
```

## Running Tests

Tests are written in Mocha, Chai under the `tests` directory and uses `istanbul` for coverage reports. To run tests, run the following command

```bash
  npm run test
```

## Authors

[@PeterKitonga](https://www.github.com/PeterKitonga)
