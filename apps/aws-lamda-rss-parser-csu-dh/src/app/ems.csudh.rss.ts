import axios, { AxiosResponse } from 'axios';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  DateParser,
  ElasticsearchPushObjectRef,
  EmsCsudhReqObject,
  EmsRssResponse,
  EMSRSSResponseListObject,
  GenerateLangNode,
  LocationInterface,
  TimeParser,
} from './interfaces';

let LocationData: LocationInterface[] = [];
try {
  LocationData = JSON.parse(
    readFileSync(join(__dirname, 'assets', 'locations.json')).toString()
  );
} catch (error) {
  console.log('Location File Not Found');
}

export async function GetEmsCsudhRssFeed(options: {
  // Only Fetch Limited Number Of Records
  // limit_records?: number;
  // Only fetch till next number of months
  limit_months?: number;
}): Promise<(ElasticsearchPushObjectRef & { id: string })[]> {
  let startLoop = true;
  let currentoccurance = 0;
  //Load Location JSON File

  let RR: EMSRSSResponseListObject[] = [];
  const cookie = (await GetEmsCookies()).reduce((a, v) => {
    return a + ';' + v.split(';')[0];
  }, '');
  const Promised = [];

  while (startLoop) {
    const d = new Date();
    d.setMonth(d.getMonth() + currentoccurance);
    currentoccurance++;
    const r = await EmsReloadCalander(
      {
        startDate: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
        displayView: '2',
        displayFormat: '0',
        eventTypeIds: '',
        locationIds: '',
        sublocationIds: '',
        departmentIds: '',
        TZOffset: '0',
        TZAbbr: '',
        TZID: '0',
        keyword: '',
      },
      cookie
    );
    RR = RR.concat(r.listData);
    if (options.limit_months) {
      if (currentoccurance + 1 >= options.limit_months) {
        startLoop = false;
        continue;
      }
    }
    if (r.listData.length === 0) {
      startLoop = false;
      continue;
    }
    let pageindex = r.params[0].PageCount;
    while (pageindex > 0) {
      Promised.push(
        GetMorePageIndexData(
          {
            pageIndex: pageindex.toString(),
            startDate: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
            displayView: '2',
            displayFormat: '0',
            eventTypeIds: '',
            locationIds: '',
            sublocationIds: '',
            departmentIds: '',
            TZOffset: '0',
            TZAbbr: '',
            TZID: '0',
            keyword: '',
          },
          cookie
        ).then((a) => (RR = RR.concat(a.listData)))
      );
      pageindex--;
    }
  }
  await Promise.all(Promised);
  const isoTimetamp = new Date().toISOString();
  return RR.map((a) => {
    let keywords: string[] = a.Location.Name.split(' ');
    if (a.EventKeyWords) {
      if (typeof a.EventKeyWords === 'string') {
        keywords.push(a.EventKeyWords);
      } else if (Array.isArray(a.EventKeyWords)) {
        keywords = keywords.concat(a.EventKeyWords);
      }
    }
    if (a.CalendarName) {
      keywords.push(a.CalendarName);
    }

    const EndsOnDateObj = CSUDHEmsTimeStampStringTpDateObj(
      a.EventDateTime.EventDateTime
    );
    EndsOnDateObj.setUTCMinutes(
      EndsOnDateObj.getUTCMinutes() + a.EventDateTime.EventDuaration
    );
    const StartsOnDateObj = CSUDHEmsTimeStampStringTpDateObj(
      a.EventDateTime.EventDateTime
    );

    return {
      id: `torocsudh${a.Id}`,
      type: 'campus_event_test',
      '@timestamp': isoTimetamp,
      '@version': '1',
      COPIED_FROM: 'ems.csudh.edu',
      DESCRIPTION: a.Description,
      END_DATE: DateParser(EndsOnDateObj),
      END_TIME: TimeParser(EndsOnDateObj),
      ENTITY_NAME: a.Title,
      LOCATION: a.Location.Name,
      LAT_LON: GetLocationByLocationName(a.Location.Name),
      KEYWORD: keywords.join(','),
      LANGUAGES: GenerateLangNode(
        a.Title,
        a.Location.Name,
        StartsOnDateObj,
        EndsOnDateObj
      ),
      REF_URL: `https://ems.csudh.edu/MasterCalendar/EventDetails.aspx?EventDetailId=${a.Id}`,
      SECONDARY_ENTITY_NAME: '',
      media: a.EventImageURL,
      MEDIA: a.EventImageURL,
      START_DATE: DateParser(StartsOnDateObj),
      START_TIME: TimeParser(StartsOnDateObj),
    };
  });
}
function CSUDHEmsTimeStampStringTpDateObj(date_string: string): Date {
  const StartDateObj = new Date();
  const dateUTC = date_string.split(' ')[0].split('/');
  const timeUtc = date_string.split(' ')[1].split(':');
  StartDateObj.setUTCFullYear(+dateUTC[2], +dateUTC[0] - 1, +dateUTC[1]);
  StartDateObj.setUTCHours(+timeUtc[0], +timeUtc[1], +timeUtc[2]);
  // StartDateObj.setUTCHours(StartDateObj.getUTCHours() - 8);
  return StartDateObj;
}
export function GetLocationByLocationName(
  location: string,
  locs: LocationInterface[] = LocationData
):
  | {
      lat: number | null;
      lon: number | null;
    }
  | undefined {
  if (locs.length === 0) {
    return;
  } else {
    const spaceRegex = /\s/gm;
    location = location.replace(spaceRegex, '');
    for (const l of locs) {
      if (l.ENTITY_NAME === location) {
        console.log(l);
        return {
          lat: l.LATITUDE,
          lon: l.LONGITUDE,
        };
      }
    }
    return 'asdhasdjapsoidasjdpojop' as any;
  }
}
export function GetMorePageIndexData(
  req: EmsCsudhReqObject & {
    pageIndex: string;
  },
  cookie: string
): Promise<EmsRssResponse> {
  // https://ems.csudh.edu/MasterCalendar/MasterCalendar.aspx/GetMoreData
  return axios
    .post<EmsRssResponse, AxiosResponse<EmsRssResponse>, EmsCsudhReqObject>(
      'https://ems.csudh.edu/MasterCalendar/MasterCalendar.aspx/ReloadCalendar',
      req,
      {
        headers: {
          authority: 'ems.csudh.edu',
          'accept-language': 'en-GB,en;q=0.9',
          cookie,
        },
      }
    )
    .then((a) => JSON.parse(a.data.d));
}
export function GetEmsCookies() {
  return axios
    .get('https://ems.csudh.edu/MasterCalendar/MasterCalendar.aspx')
    .then((a) => {
      return a.headers['set-cookie'];
    });
}

export function EmsReloadCalander(
  req: EmsCsudhReqObject,
  cookie: string
): Promise<EmsRssResponse> {
  return axios
    .post<EmsRssResponse, AxiosResponse<EmsRssResponse>, EmsCsudhReqObject>(
      'https://ems.csudh.edu/MasterCalendar/MasterCalendar.aspx/ReloadCalendar',
      req,
      {
        headers: {
          authority: 'ems.csudh.edu',
          'accept-language': 'en-GB,en;q=0.9',
          cookie,
        },
      }
    )
    .then((a) => JSON.parse(a.data.d));
}
