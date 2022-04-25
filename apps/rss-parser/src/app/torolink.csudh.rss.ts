import * as ax from 'axios';
import {
  ElasticsearchPushObjectRef,
  torolinkReqHeaders,
  TorolinkRSSResponse,
  TorolinkRSSResponseValue,
} from './interfaces';

// Image Path
// url("https://se-images.campuslabs.com/clink/images/39691ac0-024c-47a4-bbba-67f2cf38c7047d5e164d-b738-44d7-bdc1-8e07bb1c3029.png?preset=med-w")
export async function GetAllRssFeedsOfTorolink(): Promise<
  ElasticsearchPushObjectRef[]
> {
  const d = new Date().toISOString().split('.')[0] + '+05:30';
  const first = await ToroLinkReq({
    endsAfter: d,
    orderByDirection: 'ascending',
    orderByField: 'endsOn',
    status: 'Approved',
  });
  const TotalData = first['@odata.count'];
  let CurrentDataCount = 0;
  const prommises = [];
  let result: TorolinkRSSResponseValue[] = [];
  while (CurrentDataCount < TotalData) {
    CurrentDataCount += 30;
    prommises.push(
      ToroLinkReq({
        endsAfter: d,
        orderByDirection: 'ascending',
        orderByField: 'endsOn',
        status: 'Approved',
        skip: CurrentDataCount,
        take: 30,
      }).then((a) => (result = result.concat(a.value)))
    );
  }

  await Promise.all(prommises);
  const isoTimetamp = new Date().toISOString();
  return result.map((a) => {
    let keywords: string[] = a.location.split(' ');
    if (a.benefitNames && Array.isArray(a.benefitNames)) {
      keywords = keywords.concat(a.benefitNames);
    }
    const EndsOnDateObj = CSUDHToroTimeStampStringTpDateObj(a.endsOn);
    const StartsOnDateObj = CSUDHToroTimeStampStringTpDateObj(a.startsOn);
    return {
      type: 'campus_event_test',
      '@timestamp': isoTimetamp,
      '@version': '1',
      COPIED_FROM: 'torolink.csudh.edu',
      DESCRIPTION: a.description,
      EMAIL: '',
      END_DATE: `${EndsOnDateObj.getUTCFullYear()}-${
        EndsOnDateObj.getUTCMonth() + 1
      }-${EndsOnDateObj.getUTCDate()}`,
      END_TIME: `${EndsOnDateObj.getUTCHours()}:${EndsOnDateObj.getUTCMinutes()}:${EndsOnDateObj.getUTCSeconds()}`,
      ENTITY_NAME: a.name,
      EXCEPTION_TEXT: '',
      LAT_LON: {
        lat:  a.latitude && +a.latitude !== 0 ? +a.latitude : null,
        lon: a.longitude && +a.longitude !== 0 ? +a.longitude : null,
      },
      LOCATION: a.location,
      KEYWORD: keywords.join(','),
      LANGUAGES: '',
      REF_URL: '',
      SECONDARY_ENTITY_NAME: '',
      START_DATE:  `${StartsOnDateObj.getUTCFullYear()}-${
        StartsOnDateObj.getUTCMonth() + 1
      }-${StartsOnDateObj.getUTCDate()}`,
      START_TIME: `${StartsOnDateObj.getUTCHours()}:${StartsOnDateObj.getUTCMinutes()}:${StartsOnDateObj.getUTCSeconds()}`,
    };
  });
}
function CSUDHToroTimeStampStringTpDateObj(date_string: string): Date {
  const StartDateObj = new Date();
  const dateUTC = date_string.split('T')[0].split('-');
  const timeUtc = date_string.split('T')[1].split('+')[0].split(':');
  StartDateObj.setUTCFullYear(+dateUTC[0], +dateUTC[1], +dateUTC[2]);
  StartDateObj.setUTCHours(+timeUtc[0], +timeUtc[1], +timeUtc[2]);
  StartDateObj.setUTCHours(StartDateObj.getHours() - 8);
  return StartDateObj;
}
export function GenerateLangNode(
  name: string,
  location: string,
  start: Date,
  end: Date
) {
  // Open Mic Night event is happening at Loker Student Union on 24th September from 4 PM to 6 PM
  const str = `${name} event is happening at ${location} on `
}
function NumbeToNumberString(numbertoProcess:number){
  let ext = 'th';
  const checkNumber = numbertoProcess % 10;
}
export function ToroLinkReq(queryParams: torolinkReqHeaders) {
  // console.log();

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
