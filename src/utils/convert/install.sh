#!/bin/sh
npm run unpack "$1" $2
npm run convert music 128 32
npm run convert video $2
npm run convert voice 64
npm run convert samples 32
