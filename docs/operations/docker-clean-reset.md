# Docker cleanup and reset

## Project-only cleanup (dev + prod)

Use this when you want to remove Docker resources for this project only.
Preferred command:

```bash
make reset-dev
```

Equivalent raw commands:

```bash
docker compose down -v --rmi all --remove-orphans
docker compose -f docker/app/prod/compose.yml down -v --rmi all --remove-orphans
```

This removes project containers, project images, and project volumes for both dev and prod stacks.

## System-wide cleanup

Use this only when you want to clean unused Docker resources on your whole machine.

```bash
docker system prune -a --volumes
```

## Reset to dev environment (preferred)

To tear down prod and dev stacks while keeping the workflow focused on development:

```bash
make reset-dev
```

Then start dev:

```bash
docker compose up
```
