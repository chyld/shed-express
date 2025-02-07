#!/bin/bash

rm ./public/css/*
npx tailwindcss -i ./app/tailwind/admin.css        -o ./public/css/admin.css
npx tailwindcss -i ./app/tailwind/template.css     -o ./public/css/template.css
npx tailwindcss -i ./app/tailwind/generic.css      -o ./public/css/generic.css
npx tailwindcss -i ./app/tailwind/shed-trailer.css -o ./public/css/shed-trailer.css
