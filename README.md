Hamok
---
Example short NodeJs testapp for hamok.

```
npm i
tsc
```

in one terminal:
```shell
node ./lib/main.js --port=5252 --peers=localhost:5151 --run=server_2
```

in another:
```shell
node ./lib/main.js --port=5151 --peers=localhost:5252 --run=server_1
```

the above example load `/src/scenarios/myScenario.ts and executes the corresponded action.