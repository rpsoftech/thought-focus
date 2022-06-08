import { readFileSync } from 'fs';
import { join } from 'path';
import {
  GetEmsCookies,
  GetEmsCsudhRssFeed,
  GetLocationByLocationName,
} from './ems.csudh.rss';
import { LocationInterface } from './interfaces';

test('Get Array Of Cookies', async () => {
  (await GetEmsCookies()).forEach((a) =>
    expect(typeof a === 'string').toBeTruthy()
  );
}, 20000);
test('Get Location Data From Json', async () => {
  let LocationData: LocationInterface[] = [];
  try {
    LocationData = JSON.parse(
      readFileSync(join(__dirname, '..', 'assets', 'locations.json')).toString()
    );
  } catch (error) {
    console.log('Location File Not Found');
  }
  expect(GetLocationByLocationName('parkinglot4b', LocationData)).toEqual({
    lat: 33.859095,
    lon: -118.256217,
  });
  expect(GetLocationByLocationName('shcparking', LocationData)).toEqual({
    lat: 33.858981,
    lon: -118.258911,
  });
  expect(
    GetLocationByLocationName('informationbooth-lot4', LocationData)
  ).toEqual({
    lat: 33.859703,
    lon: -118.256628,
  });
  expect(
    GetLocationByLocationName('parkingpermitdispenser9', LocationData)
  ).toEqual({
    lat: 33.859814,
    lon: -118.256325,
  });
});
test('Fetchind Data From EmsCSUDH And Mapping Data', async () => {
  const datematchregex = /^20[02-9][0-9]-[0-1][0-9]-[0-3][0-9]$/;
  const idmathcing = /^torocsudh[0-9]*$/;
  const timeMathcing = /^[0-2][0-9](?::[0-6][0-9]){2}$/;
  const emailMatcher =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/gim;
  const records = await GetEmsCsudhRssFeed({
    limit_months: 3,
  });
  records.forEach((a) => {
    expect(
      typeof a.EMAIL === 'undefined' ||
        a.EMAIL === '' ||
        emailMatcher.test(a.EMAIL)
    ).toBeTruthy();
    expect(a).toMatchSnapshot({
      '@timestamp': expect.anything(),
      END_DATE: expect.stringMatching(datematchregex),
      END_TIME: expect.stringMatching(timeMathcing),
      START_TIME: expect.stringMatching(timeMathcing),
      START_DATE: expect.stringMatching(datematchregex),
      ENTITY_NAME: expect.any(String),
      '@version': expect.any(String),

      id: expect.stringMatching(idmathcing),
    });
  });
},30000);
