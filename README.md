### To run

`deno task start`

### (Re)start docker container with

export MONGODB_VERSION=6.0-ubi8
docker run --name mongodb -d -p 27017:27017 -v $(pwd)/data:/data/db mongodb/mongodb-community-server:$MONGODB_VERSION
