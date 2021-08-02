import path from 'path';
import { access, constants } from 'fs';

import app from './app';
import mail from './mail';
import logging from './logging';
import database from './database';
import filesystems from './filesystems';

const envPath = path.join(__dirname, '../../.env');
access(envPath, constants.F_OK, (err) => {
  if (err) {
    throw new Error('Could not find .env file');
  }
});

export default {
  app,
  mail,
  logging,
  database,
  filesystems,
};
