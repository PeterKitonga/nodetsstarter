import chai from 'chai';
import sinon from 'sinon';
import express from 'express';
import request from 'supertest';
import sinonChai from 'sinon-chai';

import configs from '../../../src/configs';
import { publicPath } from '../../../src/utils/path';
import ExpressApp from '../../../src/loaders/express';
import WinstonLogger from '../../../src/loaders/winston';
import MongooseConnect from '../../../src/loaders/mongoose';

const { expect } = chai;

chai.use(sinonChai);

const sandbox = sinon.createSandbox();

describe('src/loaders/express: class ExpressApp', () => {
  afterEach(() => {
    sandbox.restore();
    ExpressApp['app'] = express();
  });

  context('init()', () => {
    let listenStub: sinon.SinonStub;
    let corsMiddlewareStub: sinon.SinonStub;
    let homeRouteStub: sinon.SinonStub;
    let appRoutesStub: sinon.SinonStub;
    let nonExistentRouteStub: sinon.SinonStub;
    let errorHandlingMiddlewareStub: sinon.SinonStub;
    let databaseConnectionStub: sinon.SinonStub;
    let staticFilesStub: sinon.SinonStub;
    let bodyParserStub: sinon.SinonStub;

    beforeEach(() => {
      listenStub = sandbox.stub(ExpressApp, 'listen');
      corsMiddlewareStub = sandbox.stub(ExpressApp, 'setupCors');
      homeRouteStub = sandbox.stub(ExpressApp, 'handleHomeRoute');
      appRoutesStub = sandbox.stub(ExpressApp, 'handleAppRoutes');
      nonExistentRouteStub = sandbox.stub(ExpressApp, 'handleNonExistingRoute');
      errorHandlingMiddlewareStub = sandbox.stub(ExpressApp, 'handleErrorMiddleware');
      databaseConnectionStub = sandbox.stub(ExpressApp, 'connectDatabase');
      staticFilesStub = sandbox.stub(ExpressApp, 'serveStaticFiles');
      bodyParserStub = sandbox.stub(ExpressApp, 'setupBodyParser');
    });

    it('should initialize server correctly', async () => {
      await ExpressApp.init();

      expect(listenStub).to.be.calledOnce;
    });

    it('should load the cors middleware', async () => {
      await ExpressApp.init();

      expect(corsMiddlewareStub).to.be.calledOnce;
    });

    it('should register the home route middleware', async () => {
      await ExpressApp.init();

      expect(homeRouteStub).to.be.calledOnce;
    });

    it('should register app routes middleware', async () => {
      await ExpressApp.init();

      expect(appRoutesStub).to.be.calledOnce;
    });

    it('should register middleware for non existing routes', async () => {
      await ExpressApp.init();

      expect(nonExistentRouteStub).to.be.calledOnce;
    });

    it('should attach an error handling middleware', async () => {
      await ExpressApp.init();

      expect(errorHandlingMiddlewareStub).to.be.calledOnce;
    });

    it('should load database connection functions', async () => {
      await ExpressApp.init();

      expect(databaseConnectionStub).to.be.calledOnce;
    });

    it('should register middleware for serving static files', async () => {
      await ExpressApp.init();

      expect(staticFilesStub).to.be.calledOnce;
    });

    it('should register the body parser middleware', async () => {
      await ExpressApp.init();

      expect(bodyParserStub).to.be.calledOnce;
    });
  });

  context('listen()', () => {
    let serverListenStub: sinon.SinonStub;
    let winstonLoggerInfoStub: sinon.SinonStub;

    beforeEach(() => {
      winstonLoggerInfoStub = sandbox.stub(WinstonLogger, 'info');
      serverListenStub = sandbox.stub(ExpressApp['app'], 'listen');
    });

    it('should spin up a server on configured port', () => {
      const portValue = 8000;
      sandbox.stub(configs.app, 'port').value(portValue);

      ExpressApp.listen();

      expect(serverListenStub).to.have.been.calledOnceWith(portValue);
      expect(winstonLoggerInfoStub).to.have.been.calledOnce;
    });

    it('should handle graceful shutdown', () => {
      const processOnStub = sandbox.stub(process, 'on');

      ExpressApp.listen();

      expect(processOnStub).to.have.been.calledTwice;
      expect(winstonLoggerInfoStub).to.have.been.calledOnce;
    });
  });

  context('connectDatabase()', () => {
    let mongooseConnectStub: sinon.SinonStub;
    let winstonLoggerInfoStub: sinon.SinonStub;
    let winstonLoggerErrorStub: sinon.SinonStub;

    beforeEach(() => {
      mongooseConnectStub = sandbox.stub(MongooseConnect, 'connect');
      winstonLoggerInfoStub = sandbox.stub(WinstonLogger, 'info');
      winstonLoggerErrorStub = sandbox.stub(WinstonLogger, 'error');
    });

    it('should connect to database and log status', async () => {
      const successMessage = 'MONGO CONNECTED';
      mongooseConnectStub.resolves({ status: 'success', message: successMessage });

      await ExpressApp.connectDatabase();

      expect(mongooseConnectStub).to.be.calledOnce;
      expect(winstonLoggerInfoStub).to.be.calledOnce;
      expect(winstonLoggerInfoStub).to.be.calledWith(successMessage);
    });

    it('should catch errors from database', async () => {
      const errorMessage = 'MONGO ERROR';
      mongooseConnectStub.rejects({ status: 'error', message: errorMessage });

      await ExpressApp.connectDatabase();

      expect(mongooseConnectStub).to.be.calledOnce;
      expect(winstonLoggerErrorStub).to.be.calledOnceWith(errorMessage);
    });
  });

  context('serveStaticFiles()', () => {
    it('should configure the static express middleware to use the public path', () => {
      const appUseStub = sandbox.stub(ExpressApp['app'], 'use');
      const expressStaticStub = sandbox.stub(express, 'static');

      ExpressApp.serveStaticFiles();

      expect(appUseStub).to.have.been.calledOnce;
      expect(expressStaticStub).to.have.been.calledOnceWith(publicPath());
    });
  });

  context('setupCors()', () => {
    it('should configure the cors middleware', () => {
      const appUseStub = sandbox.stub(ExpressApp['app'], 'use');

      ExpressApp.setupCors();

      const lastArgument = appUseStub.getCall(0).args[0];

      expect(appUseStub).to.have.been.calledOnce;
      expect(lastArgument).to.exist.and.be.an.instanceOf(Function);
    });
  });

  context('setupHelmet()', () => {
    it('should configure the helmet middleware', () => {
      const appUseStub = sandbox.stub(ExpressApp['app'], 'use');

      ExpressApp.setupHelmet();

      const lastArgument = appUseStub.getCall(0).args[0];

      expect(appUseStub).to.have.been.calledOnce;
      expect(lastArgument).to.exist.and.be.an.instanceOf(Function);
    });
  });

  context('setupBodyParser()', () => {
    it('should configure the body parser middleware with limit', () => {
      const bodyLimit = '10mb';
      const bodyLimitStub = sandbox.stub(configs.filesystems, 'limit').value(bodyLimit);
      const appUseStub = sandbox.stub(ExpressApp['app'], 'use');
      const expressJsonStub = sandbox.stub(express, 'json');

      ExpressApp.setupBodyParser();

      expect(appUseStub).to.have.been.calledOnce;
      expect(expressJsonStub).to.have.been.calledOnceWith({ limit: bodyLimit });
    });
  });

  context('handleHomeRoute()', () => {
    it('should configure a get route for "/"', () => {
      const appUseStub = sandbox.stub(ExpressApp['app'], 'get');

      ExpressApp.handleHomeRoute();

      const lastArgument = appUseStub.getCall(0).args[1];

      expect(appUseStub).to.have.been.calledOnceWith('/');
      expect(lastArgument).to.exist.and.be.an.instanceOf(Function);
    });

    it('should configure route "/" that returns welcome message', async () => {
      ExpressApp.setupBodyParser();
      ExpressApp.handleHomeRoute();

      const res = await request(ExpressApp['app']).get('/');
      expect(res.status).to.equal(200);
      expect(res.body.message).to.match(/Hello There! Welcome to/);
    });
  });

  context('handleAppRoutes()', () => {
    it('should configure all app routes', () => {
      const appUseStub = sandbox.stub(ExpressApp['app'], 'use');

      ExpressApp.handleAppRoutes();

      const argumentsArray = appUseStub.getCall(0).args;

      expect(appUseStub).to.have.been.calledOnce;
      expect(argumentsArray).to.exist.and.have.a.lengthOf(2);
    });
  });

  context('handleNonExistingRoute()', () => {
    it('should configure a catch all middleware for non existing routes', () => {
      const appUseStub = sandbox.stub(ExpressApp['app'], 'use');

      ExpressApp.handleNonExistingRoute();

      const lastArgument = appUseStub.getCall(0).args[0];

      expect(appUseStub).to.have.been.calledOnce;
      expect(lastArgument).to.exist.and.be.an.instanceOf(Function);
    });

    it('should catch non existing routes and return a 404 error', async () => {
      ExpressApp.setupBodyParser();
      ExpressApp.handleNonExistingRoute();
      const nonExistingRoute = '/non/existing/route';
      const regex = new RegExp(`Route: '${nonExistingRoute}' not found`);

      const res = await request(ExpressApp['app']).get(nonExistingRoute);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.match(regex);
    });
  });

  context('handleErrorMiddleware()', () => {
    it('should configure a middleware for error handling', () => {
      const appUseStub = sandbox.stub(ExpressApp['app'], 'use');

      ExpressApp.handleErrorMiddleware();

      const lastArgument = appUseStub.getCall(0).args[0];

      expect(appUseStub).to.have.been.calledOnce;
      expect(lastArgument).to.exist.and.be.an.instanceOf(Function);
    });

    it('should catch any error from app routes and return error message', async () => {
      sandbox.stub(configs.app.api, 'prefix').returns('/api/v2');
      const winstonLoggerErrorStub = sandbox.stub(WinstonLogger, 'error');

      ExpressApp.setupBodyParser();
      ExpressApp.handleAppRoutes();
      ExpressApp.handleErrorMiddleware();

      const res = await request(ExpressApp['app']).post('/api/v2/auth/login').send({ email: 'disdegnosi@dunsoi.com' });
      expect(res.status).to.equal(422);
      expect(res.body.message).to.be.a('string');
      expect(winstonLoggerErrorStub).to.have.been.calledOnce;
    });
  });
});
