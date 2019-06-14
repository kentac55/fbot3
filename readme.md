# fbot 3rd edition

[![Build Status](https://kentac55.visualstudio.com/fbot3/_apis/build/status/kentac55.fbot3?branchName=master)](https://kentac55.visualstudio.com/fbot3/_build/latest?definitionId=1&branchName=master)

## usage

```bash
docker build . -t fbot3
docker run --rm -e SLACK_TOKEN=$SLACK_TOKEN -e SLACK_CHANNEL=$SLACK_CHANNEL fbot3
```
