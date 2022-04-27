import {
  DateParser,
  GenerateLangNode,
  HtmlStringToPlainString,
  NumbeToNumberString,
  TimeParser,
  TimeToAmPM,
} from './interfaces';

test('Date Should Be Formated According to Mapping', () => {
  const currentDate = new Date();
  expect(
    /^20[02-9][0-9]-[0-1][0-9]-[0-3][0-9]$/.test(DateParser(currentDate))
  ).toBeTruthy();
});
