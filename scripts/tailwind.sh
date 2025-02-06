#!/bin/bash

rm ./public/css/*
npx tailwindcss -i ./app/tailwind/admin.css  -o ./public/css/admin.css
npx tailwindcss -i ./app/tailwind/public.css -o ./public/css/public.css

