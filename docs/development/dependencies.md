# Dependency management and compatibility

## Use Make targets first

Prefer these commands:

```bash
make update
make sync-fastify
make versions
```

- `make update`: updates dependencies and syncs `fastify` with `@nestjs/platform-fastify`.
- `make sync-fastify`: only syncs `fastify`.
- `make versions`: prints installed versions for Fastify-related packages.

## Fastify compatibility

Check which Fastify version NestJS expects:

```bash
npm info @nestjs/platform-fastify dependencies.fastify
```

Example expected tree shape:

```text
caddie-backend-nest@0.2.0
├─┬ @nestjs/platform-fastify@11.1.6
│ └── fastify@5.4.0 deduped
└── fastify@5.4.0
```

## fastify-plugin and @fastify/cookie compatibility

Check compatibility:

```bash
npm info @fastify/cookie dependencies.fastify-plugin
npm ls fastify-plugin
```

Ensure installed versions satisfy what `@fastify/cookie` and Nest Fastify adapters require.
