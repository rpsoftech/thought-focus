import { cwd, env } from 'process';
import { config } from 'dotenv';
import { join } from 'path';
import { environment } from './environments/environment';
// import {
//   ElasticsearchServiceClient,
//   AcceptInboundCrossClusterSearchConnectionCommand,
// } from '@aws-sdk/client-elasticsearch-service';
config({
  path: join(environment.production ? cwd() : __dirname, '.env'),
});
const ConnectionUrl = env.ELASTICURL;
console.log(ConnectionUrl);

import { GetEmsCsudhRssFeed } from './app/ems.csudh.rss';
import { GetAllRssFeedsOfTorolink } from './app/torolink.csudh.rss';
import axios from 'axios';

(async () => {
  function PostDataToElasticSearch(id: string, d: any) {
    return axios.post(`${ConnectionUrl}/${id}`, d).catch(console.log);
  }
  const [a, b] = await Promise.all([
    GetAllRssFeedsOfTorolink(),
    GetEmsCsudhRssFeed(),
  ]);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const all = a.concat(b);
  const keys = all.map((a1) => a1.id);
  const uniq = [...new Set(keys)];
  await Promise.all(
    all.map((a1) => {
      const id = a1.id;
      if (uniq.includes(id)) {
        uniq.splice(uniq.indexOf(id), 1);
        delete a1.id;
        return PostDataToElasticSearch(id, a1);
      } else {
        return Promise.resolve(true);
      }
    })
  );
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  process.exit(1);
})();
