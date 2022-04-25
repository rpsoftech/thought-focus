// import { cwd, env } from 'process';
// import { config } from 'dotenv';
// import { join } from 'path';
// import { environment } from './environments/environment';
// import {
//   ElasticsearchServiceClient,
//   AcceptInboundCrossClusterSearchConnectionCommand,
// } from '@aws-sdk/client-elasticsearch-service';
// config({
//   path: join(environment.production ? cwd() : __dirname, '.env'),
// });
// const ConnectionUrl = env.ELASTICURL;

import { GetAllRssFeedsOfTorolink } from "./app/torolink.csudh.rss";

GetAllRssFeedsOfTorolink().then(console.log);
