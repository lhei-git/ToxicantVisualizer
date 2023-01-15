# ToxicantVisualizer
![Build Status](https://github.com/lhei-git/ToxicantVisualizer/actions/workflows/deploy.yml/badge.svg)

Fall 2020 Capstone Project

## Contributing
1. Select an issue to write code for. If no issue exists for the addition you would like to make, create one. 
2. Create a feature branch off of `master` with the format `feature/*` (ex. `feature/maps`). Keep branch names short: the suffix should be a one or two-word descriptor for the feature you are writing.
3. Make incremental commits to this branch. Smaller, more frequent commits are recommended. 
4. Create a Pull Request into `master` once your work is completed. PR candidate code must run without errors.
    4.1. Add at least one reviewer to your PR. Anyone can review, but a PR requires at least one approval before it can be merged. 
5. Once a PR is approved, either the approving reviewer or the creator of the PR can merge it into `master`. 

## Development

### Requirements
- Docker
- Docker-compose
- `.env` file in frontend/ ([see frontend/README.md](frontend/README.md))
- pg_dump file of VET postgres database in backend/pg_dump/

### Docker

Docker is a container runtime that allows fine control over the development and production environment. We will use it to run the frontend, backend, and sql database in unison to match the remote environment.

https://www.docker.com/products/docker-desktop
https://docs.docker.com/compose/ 

The [docker-compose.yml](docker-compose.yml) file includes services for the React.js frontend development server, the Django backend development server, a Postgres database, and an Nginx server hosting the static files created by a production build of the frontend (for presentations). 

After installation of Docker and Docker-compose, the application can be run by calling `docker-compose up` at the root of the directory. 
