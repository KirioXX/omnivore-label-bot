FROM ghcr.io/railwayapp/nixpacks:ubuntu-1725321821

ENTRYPOINT ["/bin/bash", "-l", "-c"]
WORKDIR /app/


COPY .nixpacks/nixpkgs-e05605ec414618eab4a7a6aea8b38f6fbbcc8f08.nix .nixpacks/nixpkgs-e05605ec414618eab4a7a6aea8b38f6fbbcc8f08.nix
RUN nix-env -if .nixpacks/nixpkgs-e05605ec414618eab4a7a6aea8b38f6fbbcc8f08.nix && nix-collect-garbage -d
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0 libxshmfence1 libglu1

ARG CI NIXPACKS_METADATA NODE_ENV NPM_CONFIG_PRODUCTION
ENV CI=$CI NIXPACKS_METADATA=$NIXPACKS_METADATA NODE_ENV=$NODE_ENV NPM_CONFIG_PRODUCTION=$NPM_CONFIG_PRODUCTION

# setup phase
# noop

# install phase
ENV NIXPACKS_PATH /app/node_modules/.bin:$NIXPACKS_PATH
COPY . /app/.
RUN --mount=type=cache,id=guOwMYxZEYI-/root/local/share/pnpm/store/v3,target=/root/.local/share/pnpm/store/v3 pnpm i --frozen-lockfile

# build phase
COPY . /app/.
RUN --mount=type=cache,id=guOwMYxZEYI-node_modules/cache,target=/app/node_modules/.cache pnpm run build


RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile


# start
COPY . /app
CMD ["pnpm run start"]

