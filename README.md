# iPix Open

An experimental iPix workspace built from [OpenBot](https://github.com/CopilotKit/OpenBot), an open-source, self-hostable AI Bot platform.

**Goal:** Connect iPix fashion-production workflows to a conversational workspace, starting with the existing Production Planner. This is a project direction, **not** a claim that the integration is already complete.

## What it includes

- **Bots and agents:** chat with built-in Bots or connect external agents through AG-UI.
- **Interactive work:** streaming responses, tool use, review and approval surfaces.
- **Developer guidance:** OpenBot's existing skills plus adapted iPix skills in [`.claude/skills/`](.claude/skills/).
- **Extensible stack:** React/Vite, Bun, CopilotKit/AG-UI, a server API, and PostgreSQL.

The iPix Production Planner, Supabase business data, and Cloudinary assets remain owned by the [iPix application](https://github.com/amoai-tech/ipixai). The developer skills do not automatically enable those runtime integrations.

## Run locally

**Requirements:** Docker, Bun 1.4+, Node/npx, a model API key, and a CopilotKit Intelligence project.

```bash
git clone https://github.com/amoai-tech/ipix-open.git
cd ipix-open
cp .env.example .env
bun install
```

Configure CopilotKit Intelligence and your model key using the [development guide](docs/development.md#setup), then start:

```bash
bash scripts/start.sh
```

Open **http://localhost:3010**. The example configuration uses single-user local mode; configure authentication before exposing it to others.

## Documentation

| Topic | Guide |
| --- | --- |
| Setup and development | [Development](docs/development.md) |
| Architecture and services | [Architecture](docs/architecture.md) |
| Environment and authentication | [Configuration](docs/configuration.md) |
| Deployment | [Deployment](docs/deployment.md) |
| Bots and external agents | [Bots](docs/coworkers.md) |
| API contracts | [API](api/README.md) |
| Adapted iPix developer skills | [Skills directory](.claude/skills/) |

## Licensing and upstream

The OpenBot application code is [MIT licensed](LICENSE). CopilotKit Intelligence is separately licensed; check its terms before self-hosting or production deployment. See [upstream OpenBot](https://github.com/CopilotKit/OpenBot) for original releases, product information, and support.

Contributions: [CONTRIBUTING.md](CONTRIBUTING.md).
