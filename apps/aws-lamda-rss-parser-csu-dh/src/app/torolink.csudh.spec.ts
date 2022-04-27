import { GetAllRssFeedsOfTorolink } from './torolink.csudh.rss';

test('Fetchind Data From Torolink And Mapping Data', async () => {
  const datematchregex = /^20[02-9][0-9]-[0-1][0-9]-[0-3][0-9]$/;
  const idmathcing = /^torocsudh[0-9]*$/;
  (
    await GetAllRssFeedsOfTorolink({
      limit_records: 10,
    })
  ).forEach((a) => {
    expect(a).toMatchSnapshot({
      END_DATE: expect.stringMatching(datematchregex),
      START_DATE: expect.stringMatching(datematchregex),
      ENTITY_NAME: expect.any(String),
      id: expect.stringMatching(idmathcing),
    });
  });
});
