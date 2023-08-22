FROM node:18

# https://github.com/nestjs/nest-cli/issues/484
RUN apt-get update \
    && apt-get install --no-install-recommends -y procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
