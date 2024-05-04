#!/bin/bash
docker-compose -f ./config/prod/docker-compose.yml build
docker-compose -f ./config/prod/docker-compose.yml up