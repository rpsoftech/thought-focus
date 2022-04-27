import * as ax from 'axios';
import {
  DateParser,
  ElasticsearchPushObjectRef,
  GenerateLangNode,
  HtmlStringToPlainString,
  TimeParser,
  torolinkReqHeaders,
  TorolinkRSSResponse,
  TorolinkRSSResponseValue,
} from './interfaces';

// Image Path
// url("https://se-images.campuslabs.com/clink/images/39691ac0-024c-47a4-bbba-67f2cf38c7047d5e164d-b738-44d7-bdc1-8e07bb1c3029.png?preset=med-w")
export async function GetAllRssFeedsOfTorolink(options: {
  // Only Fetch Limited Number Of Records
  limit_records?: number;
  // Only fetch till next number of months
  limit_months?: number;
}): Promise<(ElasticsearchPushObjectRef & { id: string })[]> {
  const d = new Date().toISOString().split('.')[0] + '+05:30';
  const first = await ToroLinkReq({
    endsAfter: d,
    orderByDirection: 'ascending',
    orderByField: 'endsOn',
    status: 'Approved',
  });
  const TotalData = options.limit_records || first['@odata.count'];
  let CurrentDataCount = 0;
  const prommises = [];
  let result: TorolinkRSSResponseValue[] = [];
  while (CurrentDataCount < TotalData) {
    const take = CurrentDataCount + 30 > TotalData ? TotalData - CurrentDataCount : 30
    prommises.push(
      ToroLinkReq({
        endsAfter: d,
        orderByDirection: 'ascending',
        orderByField: 'endsOn',
        status: 'Approved',
        skip: CurrentDataCount,
        take
      }).then((a) => (result = result.concat(a.value)))
    );
    CurrentDataCount += take;
  }
  await Promise.all(prommises);
  const isoTimetamp = new Date().toISOString();
  if (options.limit_months) {
    const CurrentMonth = new Date().getMonth();
    result = result.filter((a) => {
      const StartsOnDateObj = CSUDHToroTimeStampStringTpDateObj(a.startsOn);
      return StartsOnDateObj.getMonth() <= CurrentMonth + options.limit_months;
    });
  }
  return result.map((a) => {
    let keywords: string[] = a.location.split(' ');
    if (a.benefitNames && Array.isArray(a.benefitNames)) {
      keywords = keywords.concat(a.benefitNames);
    }
    const EndsOnDateObj = CSUDHToroTimeStampStringTpDateObj(a.endsOn);
    const StartsOnDateObj = CSUDHToroTimeStampStringTpDateObj(a.startsOn);
    const latlon = {
      lat: a.latitude && +a.latitude !== 0 ? +a.latitude : null,
      lon: a.longitude && +a.longitude !== 0 ? +a.longitude : null,
    };
    return {
      id: `torocsudh${a.id}`,
      type: 'campus_event_test',
      '@timestamp': isoTimetamp,
      '@version': '1',
      COPIED_FROM: 'torolink.csudh.edu',
      DESCRIPTION: HtmlStringToPlainString(a.description),
      EMAIL: '',
      END_DATE: DateParser(EndsOnDateObj),
      END_TIME: TimeParser(EndsOnDateObj),
      ENTITY_NAME: a.name,
      EXCEPTION_TEXT: '',
      LAT_LON: latlon.lat === null || latlon.lon === null ? undefined : latlon,
      LOCATION: a.location,
      KEYWORD: keywords.join(','),
      LANGUAGES: GenerateLangNode(
        a.name,
        a.location,
        StartsOnDateObj,
        EndsOnDateObj
      ),
      REF_URL: `https://torolink.csudh.edu/event/${a.id}`,
      SECONDARY_ENTITY_NAME: '',
      media: `https://se-images.campuslabs.com/clink/images/${a.imagePath}?preset=med-w`,
      MEDIA: `https://se-images.campuslabs.com/clink/images/${a.imagePath}?preset=med-w`,
      START_DATE: DateParser(StartsOnDateObj),
      START_TIME: TimeParser(StartsOnDateObj),
    };
  });
}

export function CSUDHToroTimeStampStringTpDateObj(date_string: string): Date {
  const StartDateObj = new Date();
  const dateUTC = date_string.split('T')[0].split('-');
  const timeUtc = date_string.split('T')[1].split('+')[0].split(':');
  StartDateObj.setUTCFullYear(+dateUTC[0], +dateUTC[1] - 1, +dateUTC[2]);
  StartDateObj.setUTCHours(+timeUtc[0], +timeUtc[1], +timeUtc[2]);
  StartDateObj.setUTCHours(StartDateObj.getUTCHours() - 8);
  return StartDateObj;
}

export function ToroLinkReq(queryParams: torolinkReqHeaders) {
  return ax.default
    .get<
      TorolinkRSSResponse,
      ax.AxiosResponse<TorolinkRSSResponse>,
      torolinkReqHeaders
    >('https://torolink.csudh.edu/api/discovery/event/search', {
      params: queryParams as any,
    })
    .then((a) => a.data);
}
