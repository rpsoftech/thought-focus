import { cwd, env } from 'process';
import { config } from 'dotenv';
import { join } from 'path';
import { environment } from './environments/environment';
import { GetEmsCsudhRssFeed } from './app/ems.csudh.rss';
import { GetAllRssFeedsOfTorolink } from './app/torolink.csudh.rss';
import axios from 'axios';


// Loading .env File From Path
config({
  path: join(environment.production ? cwd() : __dirname, '.env'),
});
// Elastic Search Url
const ConnectionUrl = env.ELASTICURL;
//TO Limit Number of records to be fetched from APIS
const LimitedRecords = env.LIMITRECORDS;
const limit_months = env.LIMITMONTHS;
// Main Executor Functions
export const main = async () => {
  async function PostDataToElasticSearch(id: string, d: any) {
    try {
      return await axios.post(`${ConnectionUrl}/${id}`, d);
    } catch (message) {
      return console.log(message);
    }
  }
  const [a, b] = await Promise.all([
    GetAllRssFeedsOfTorolink({
      limit_records: LimitedRecords ? +LimitedRecords : undefined,
      limit_months: limit_months ? +limit_months : undefined,
    }),
    GetEmsCsudhRssFeed({
      // limit_records: LimitedRecords ? +LimitedRecords : undefined,
      limit_months: limit_months ? +limit_months : undefined,
    }),
  ]);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const all = a.concat(b);
  console.log(all.length);

  const keys = all.map((a1) => a1.id);
  const uniq = [...new Set(keys)];
  console.log(uniq.length);
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
};
// main();
