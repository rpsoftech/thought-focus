import {
  DateParser,
  GenerateLangNode,
  HtmlStringToPlainString,
  NumbeToNumberString,
  TimeParser,
} from './interfaces';

test('Date Should Be Formated According to Mapping', () => {
  const currentDate = new Date();
  expect(
    /^20[02-9][0-9]-[0-1][0-9]-[0-3][0-9]$/.test(DateParser(currentDate))
  ).toBeTruthy();
});
test('LangMode Check', () => {
  const text = GenerateLangNode('Demo', 'Demo', new Date(), new Date(), true);
  expect(typeof text === 'string' && text.includes('Demo')).toBeTruthy();
});
test('HtmlStringToPlainString Check', () => {
  const text = HtmlStringToPlainString('<h1 poajs="poajsd">Demo</h1>');
  expect(text).toBe('Demo');
});
test('NumbeToNumberString Check', () => {
  expect(NumbeToNumberString(10)).toBe('10th');
  expect(NumbeToNumberString(11)).toBe('11th');
  expect(NumbeToNumberString(12)).toBe('12th');
  expect(NumbeToNumberString(13)).toBe('13th');
  expect(NumbeToNumberString(1)).toBe('1st');
  expect(NumbeToNumberString(21)).toBe('21st');
  expect(NumbeToNumberString(22)).toBe('22nd');
  expect(NumbeToNumberString(91)).toBe('91st');
  expect(NumbeToNumberString(93)).toBe('93rd');
});

test('Time Parser',()=>{
  const timeMathcing = /^[0-2][0-9](?::[0-6][0-9]){2}$/;
  expect(TimeParser(new Date())).toMatch(timeMathcing)
})
test('Date Parser',()=>{
  const datematchregex = /^20[02-9][0-9]-[0-1][0-9]-[0-3][0-9]$/;
  expect(DateParser(new Date())).toMatch(datematchregex);
})