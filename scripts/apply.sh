#!/bin/bash

npm install
npx prisma generate
npx prisma migrate dev --name init
