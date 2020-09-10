#!/usr/bin/bash
now=`date`
sed -i -E "s/\"version\": \"(.*)\"/\"version\": \"$now\"/g" ./src/data/appData.json
