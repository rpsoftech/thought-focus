import {
  CSUDHToroTimeStampStringTpDateObj,
  GetAllRssFeedsOfTorolink,
  ToroLinkReq,
} from './torolink.csudh.rss';
test('Fetchind Data From Torolink And Mapping Data', async () => {
  const datematchregex = /^20[02-9][0-9]-[0-1][0-9]-[0-3][0-9]$/;
  const idmathcing = /^torocsudh[0-9]*$/;
  const timeMathcing = /^[0-2][0-9](?::[0-6][0-9]){2}$/;
  const emailMatcher =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/gim;
  const records = await GetAllRssFeedsOfTorolink({
    limit_records: 10,

  });
  expect(records.length).toBe(10)
  records.forEach((a) => {
    expect(
      typeof a.EMAIL === 'undefined' ||
        a.EMAIL === '' ||
        emailMatcher.test(a.EMAIL)
    ).toBeTruthy();
    expect(a).toMatchSnapshot({
      "@timestamp":expect.anything(),
      END_DATE: expect.stringMatching(datematchregex),
      END_TIME: expect.stringMatching(timeMathcing),
      START_TIME: expect.stringMatching(timeMathcing),
      START_DATE: expect.stringMatching(datematchregex),
      ENTITY_NAME: expect.any(String),
      "@version":expect.any(String),
      
      id: expect.stringMatching(idmathcing),
    });
  });
});
test('Fetchind Data From Torolink', async () => {
  const emailMatcher =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/gim;
  expect(emailMatcher.test('keyurshah3939@gmail.com')).toBeTruthy();
  const d = new Date().toISOString().split('.')[0] + '+05:30';
  const records = await ToroLinkReq({
    endsAfter: d,
    orderByDirection: 'ascending',
    orderByField: 'endsOn',
    status: 'Approved',
  });
  // expect(records.length).toBe(10)
  records.value.forEach((a) => {
    expect(isNaN(+a.id)).toBeFalsy();
    expect(typeof a.institutionId === 'number').toBeTruthy();
    expect(a.latitude === null || (typeof a.latitude === 'string' && isNaN(+a.latitude)===false)).toBeTruthy();
    expect(a.longitude === null || (typeof a.longitude === 'string' && isNaN(+a.longitude)===false)).toBeTruthy();
    expect(
      a.institutionId === null || typeof a.institutionId === 'number'
    ).toBeTruthy();
    expect(CSUDHToroTimeStampStringTpDateObj(a.endsOn)).toBeInstanceOf(Date);
    expect(CSUDHToroTimeStampStringTpDateObj(a.startsOn)).toBeInstanceOf(Date);
    expect(a).toMatchSnapshot({
      name: expect.any(String),
    });
  });
});
