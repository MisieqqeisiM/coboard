FROM denoland/deno:1.43.1
EXPOSE 8000 3000
WORKDIR /app

COPY ./deno.json .
COPY ./deps.ts .
COPY ./deps_client.ts .
RUN deno cache deps.ts deps_client.ts

COPY . .

CMD ["task", "preview"]