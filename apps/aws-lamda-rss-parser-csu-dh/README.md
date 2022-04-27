# Rss Parser For CSUDH

#### Links as As Below

| Name | Link |
| ------ | ------ |
| ToroLink | [https://torolink.csudh.edu/event][PlDb] |
| EMS | [https://ems.csudh.edu/MasterCalendar/MasterCalendar.aspx][PlGh] |

## Build And Test
Rss Parser For CSUDH [Node.js](https://nodejs.org/) v14+ to run.
Install the dependencies and devDependencies and start.
- 1:) Make sure to create `.env` file in src folder of app.
- 2:) add variable *`ELASTICURL`* as your uplink elastic 
- ex: `ELASTICURL="https://uname:password@domain:port/index"`

### To Test
```sh
npx nx run aws-lamda-rss-parser-csu-dh:test --parallel
```

### To Build For production environments

```sh
npx nx run aws-lamda-rss-parser-csu-dh:build:production
```