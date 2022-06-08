const HtmlReplacerRegex = /<[^>]+>/g;
const BreaklineReplacer = /(?:\r\n|\r|\n)/g;
const ExtraThingsReplacer = /(&nbsp;)/g;
export function HtmlStringToPlainString(d: string): string {
  return d
    .replace(HtmlReplacerRegex, '')
    .replace(BreaklineReplacer, '\n')
    .replace(ExtraThingsReplacer, '');
}
export interface torolinkReqHeaders {
  endsAfter: string;
  orderByField: 'endsOn';
  orderByDirection: 'ascending';
  status: 'Approved';
  take?: number;
  query?: any;
  skip?: number;
}

export interface TorolinkRSSResponse {
  '@odata.count': number;
  '@search.coverage': null;
  '@search.facets': TorolinkRSSResponseSearchFacets;
  value: TorolinkRSSResponseValue[];
}
export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export interface TorolinkRSSResponseSearchFacets {
  BenefitNames: TorolinkRSSResponseBenefitName[];
  Theme: TorolinkRSSResponseBenefitName[];
  CategoryIds: TorolinkRSSResponseBenefitName[];
  BranchId: TorolinkRSSResponseBranchID[];
}

export interface TorolinkRSSResponseBenefitName {
  type: number;
  from: null;
  to: null;
  value: string;
  count: number;
}

export interface TorolinkRSSResponseBranchID {
  type: number;
  from: null;
  to: null;
  value: number;
  count: number;
}

export interface TorolinkRSSResponseValue {
  id: string;
  institutionId: number;
  organizationId: number;
  organizationIds: string[];
  branchId: number;
  branchIds: string[];
  organizationName: string;
  organizationProfilePicture: null | string;
  organizationNames: string[];
  name: string;
  description: string;
  location: string;
  startsOn: string;
  endsOn: string;
  imagePath: null | string;
  theme: string;
  categoryIds: string[];
  categoryNames: string[];
  benefitNames: string[];
  visibility: Visibility;
  status: Status;
  latitude: null | string;
  longitude: null | string;
  '@search.score': number;
}

export enum Status {
  Approved = 'Approved',
}

export enum Visibility {
  Public = 'Public',
}

export interface EmsCsudhReqObject {
  // {startDate :'25/04/2022', displayView : '2', displayFormat : '0', eventTypeIds : '', locationIds : '', sublocationIds : '', departmentIds : '',TZOffset:'0',TZAbbr:'', TZID: '0', keyword : ''}
  startDate: string;
  displayView: string;
  displayFormat: string;
  eventTypeIds: string;
  locationIds: string;
  sublocationIds: string;
  departmentIds: string;
  TZOffset: '0';
  TZAbbr: string;
  TZID: '0';
  keyword: string;
}

export interface EmsRssResponse {
  d: string;
  listData: EMSRSSResponseListObject[];
  params: EMSRSSRespoParamsObj[];
  specialData: EMSRSSRespoSpecialObject[];
}
export interface EMSRSSResponseListObject {
  Id: number;
  EventId: number;
  Title: string;
  Notes: null;
  Description: string;
  EventImageURL: string;
  ALTText: string;
  isAllDay: boolean;
  NoEndTime: boolean;
  isSpecial: boolean;
  Priority: number;
  EventTypeColor: string;
  EventTypeName: string;
  EventType: null;
  AllowEdit: boolean;
  Cancel: boolean;
  CalendarName: string;
  EventDateTime: EMSRSSResponseListObjectEventDateTime;
  Location: EMSRSSResponseListObjectLocation;
  UDFs: null;
  EventKeyWords: null;
  Icon1: null;
  Icon2: null;
  SelectedTZBias: number;
}

export interface EMSRSSResponseListObjectEventDateTime {
  EventDateTime: string;
  EventDuaration: number;
  EventTimeZone: string;
  DefaultUTCOffset: number;
  BaseDate: string;
}

export interface EMSRSSResponseListObjectLocation {
  Id: number;
  Name: string;
  Address: string;
}

export interface EMSRSSRespoParamsObj {
  PageCount: number;
  Dates: string;
}
export interface EMSRSSRespoSpecialObject {
  day: string;
  SpecialDates: EMSRSSRespoSpecialObjectSpecialDate[];
}

export interface EMSRSSRespoSpecialObjectSpecialDate {
  Id: number;
  EventDate: string;
  Title: string;
  Notes: string;
  CalendarName: null;
  EventDateTime: null;
}

export interface ElasticsearchPushObjectRef {
  // date Object
  '@timestamp': string;
  '@version': string;
  COPIED_FROM: string;
  DESCRIPTION: string;
  EMAIL?: string;
  // format: 'yyyy-MM-dd';
  END_DATE: string;
  // format: 'HH:mm:ss';
  END_TIME: string;
  ENTITY_NAME: string;
  EXCEPTION_TEXT?: string;
  KEYWORD: string;
  LANGUAGES: string;
  LAT_LON?: {
    lat: number | null;
    lon: number | null;
  };
  //Place Name
  LOCATION: string;
  // url
  MEDIA?: string[];
  OCCURANCE?: string;
  PHONE?: string;
  PRESENTER?: string;
  PROCESS_AGENT_ID?: string;
  PROCESS_ID?: string;
  // Event Url
  REF_URL: string;
  SECONDARY_ENTITY_NAME?: string;
  // format: 'yyyy-MM-dd';
  START_DATE: string;
  // format: 'HH:mm:ss';
  START_TIME: string;
  // format: 'HH:mm:ss';
  MON_END_TIME?: string;
  // format: 'HH:mm:ss';
  MON_START_TIME?: string;
  //  format : HH:mm:ss
  FRI_END_TIME?: string;
  //  format : HH:mm:ss
  FRI_START_TIME?: string;
  //  format : HH:mm:ss
  SAT_END_TIME?: string;
  //  format : HH:mm:ss
  SAT_START_TIME?: string;
  //  format : HH:mm:ss
  SUN_END_TIME?: string;
  //  format : HH:mm:ss
  SUN_START_TIME?: string;
  //  format : HH:mm:ss
  THU_END_TIME?: string;
  //  format : HH:mm:ss
  THU_START_TIME?: string;
  //  format : HH:mm:ss
  TUE_END_TIME?: string;
  //  format : HH:mm:ss
  TUE_START_TIME?: string;
  //  format : HH:mm:ss
  WED_END_TIME?: string;
  //  format : HH:mm:ss
  WED_START_TIME?: string;
  //  format : HH:mm:ss
  WEEKDAY_END_TIME?: string;
  //  format : HH:mm:ss
  WEEKDAY_START_TIME?: string;
  //  format : HH:mm:ss
  WEEKEND_END_TIME?: string;
  //  format : HH:mm:ss
  WEEKEND_START_TIME?: string;
  media?: string;
  type: string;
}
export interface LocationInterface {
  ENTITY_NAME: string;
  LATITUDE: number;
  LONGITUDE: number;
  MAP_URL: null | string;
  SHORT_URL: null | string;
}

export function GenerateLangNode(
  name: string,
  location: string,
  start: Date,
  end: Date,
  return_only_string = false
) {
  const sameDate =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
      ? ''
      : `${NumbeToNumberString(end.getUTCDate())} ${months[end.getUTCMonth()]}`;
  // Open Mic Night event is happening at Loker Student Union on 24th September from 4 PM to 6 PM
  const str = `${name} event is happening at ${location} on ${NumbeToNumberString(
    start.getUTCDate()
  )} ${months[start.getUTCMonth()]} from ${TimeToAmPM(
    start.getUTCHours()
  )} to ${sameDate} ${TimeToAmPM(end.getUTCHours())}.`;
  if (return_only_string === true) {
    return str;
  }
  return JSON.stringify({
    EN: {
      TEXT: str,
      VOICE: str,
      VOICE_ONLY: str,
    },
  });
}
export function TimeToAmPM(numbertoProcess: number) {
  return numbertoProcess > 12
    ? `${numbertoProcess - 12} PM`
    : `${numbertoProcess - 12} AM`;
}
export function NumbeToNumberString(numbertoProcess: number) {
  let ext = 'th';
  const checkNumber = numbertoProcess % 10;
  if ([11, 12, 13].includes(numbertoProcess)) {
    ext = 'th';
  } else if (checkNumber === 1) {
    ext = 'st';
  } else if (checkNumber === 2) {
    ext = 'nd';
  } else if (checkNumber === 3) {
    ext = 'rd';
  }
  return `${numbertoProcess}${ext}`;
}
export function TimeParser(dateObje: Date) {
  return `${dateObje.getUTCHours().toString().padStart(2, '0')}:${dateObje
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}:${dateObje.getUTCSeconds().toString().padStart(2, '0')}`;
}
export function DateParser(dateObje: Date) {
  return `${dateObje.getUTCFullYear()}-${(dateObje.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-${dateObje.getUTCDate().toString().padStart(2, '0')}`;
}
export const RSSPARSED_DATA_TYPE = process.env.PARSED_DATA_TYPE || 'campus_event_test'