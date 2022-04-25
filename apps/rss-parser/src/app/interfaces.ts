const HtmlReplacerRegex = /<[^>]+>/gim;
export function HtmlStringToPlainString(d: string): string {
  return d.replace(HtmlReplacerRegex, '');
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
  EMAIL: string;
  // format: 'yyyy-MM-dd';
  END_DATE: string;
  // format: 'HH:mm:ss';
  END_TIME: string;
  ENTITY_NAME: string;
  EXCEPTION_TEXT: string;
  KEYWORD: string;
  LANGUAGES: string;
  LAT_LON: {
    lat: number | null;
    lon: number | null;
  };
  //Place Name
  LOCATION: string;
  // url
  MEDIA?: string;
  OCCURANCE?: string;
  PHONE?: string;
  PRESENTER?: string;
  PROCESS_AGENT_ID?: string;
  PROCESS_ID?: string;
  // Event Url
  REF_URL: string;
  // format: 'HH:mm:ss';
  SECONDARY_ENTITY_NAME: string;
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
  type: 'campus_event_test';
}
