import axios, { AxiosResponse } from 'axios';
import { EmsCsudhReqObject, EmsRssResponse } from './interfaces';

export async function GetEmsCsudhRssFeed() {}

export function EmsReloadCalander(req: EmsCsudhReqObject) {
  return axios
    .post<EmsRssResponse, AxiosResponse<EmsRssResponse>, EmsCsudhReqObject>(
      'https://ems.csudh.edu/MasterCalendar/MasterCalendar.aspx/ReloadCalendar',
      req
    )
    .then((a) => a.data);
}
