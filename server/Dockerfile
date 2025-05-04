FROM denoland/deno:alpine-1.37.1

WORKDIR /app

COPY . .

RUN deno cache app-run.js

CMD ["task", "dev"]