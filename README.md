# Campus Events Calendar

A small bulletin-board-style web app where you can **add and remove campus events**.
Built as the ITM 350 final project to demonstrate DevOps principles end to end:
version control, automated testing, containerization, CI/CD pipelines, and
Infrastructure as Code — deployed to AWS **without logging into AWS**.

![Node.js](https://img.shields.io/badge/node-20-green)
![Tests](https://img.shields.io/badge/tests-jest-red)
![Docker](https://img.shields.io/badge/docker-ready-blue)

---

## What it does

- **Add an event** with a title, date, optional location, and description.
- **See upcoming events** sorted by date.
- **Delete events** you no longer need.

The backend is a small Express REST API; the frontend is plain HTML/CSS/JS
served as static files. Data is kept in an in-memory store (no database needed
for this exercise).

## Project structure

```
hunter-evans-final/
├── backend/
│   ├── app.js          # Express app + REST routes (exported for testing)
│   ├── server.js       # Entry point that starts the server
│   └── eventStore.js   # Framework-free data logic (unit tested)
├── public/             # Static frontend (index.html, styles.css, app.js)
├── tests/
│   ├── unit/           # Unit tests for the event store
│   └── integration/    # API integration tests (supertest)
├── terraform/          # Infrastructure as Code (EC2 + security group)
├── .github/workflows/
│   ├── build.yml       # Build pipeline: test + build/push Docker image
│   └── release.yml     # Release pipeline: Terraform provisions EC2
├── Dockerfile
└── package.json
```

## API

| Method | Route              | Description                       |
| ------ | ------------------ | --------------------------------- |
| GET    | `/api/health`      | Health check                      |
| GET    | `/api/events`      | List all events (sorted by date)  |
| POST   | `/api/events`      | Create an event                   |
| DELETE | `/api/events/:id`  | Delete an event                   |

## Run locally

```bash
npm install
npm start
# open http://localhost:8080
```

## Run the tests

```bash
npm test              # unit + integration
npm run test:unit
npm run test:integration
```

## Run with Docker

```bash
docker build -t hunterevans0/hunter-evnas-final .
docker run -p 8080:8080 hunterevans0/hunter-evnas-final
# open http://localhost:8080
```

---

## DevOps / CI-CD

### Build pipeline — `.github/workflows/build.yml`
Triggered when a pull request is **merged into `main`**. It:
1. Installs dependencies with `npm ci`
2. Runs the unit and integration tests
3. Builds the Docker image and pushes it to Docker Hub
   (`hunterevans0/hunter-evnas-final:latest` and `:<git-sha>`)

### Release pipeline — `.github/workflows/release.yml`
Runs automatically **after the build pipeline succeeds**. It uses **Terraform**
to provision an EC2 instance whose `user_data` installs Docker, pulls the image,
and runs the container on port 80. The public URL is printed in the workflow
summary.

### Required GitHub Actions secrets
Set these under **Settings → Secrets and variables → Actions**:

| Secret                  | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `DOCKERHUB_USERNAME`    | Docker Hub username (`hunterevans0`)             |
| `DOCKERHUB_TOKEN`       | Docker Hub access token                          |
| `AWS_ACCESS_KEY_ID`     | AWS access key                                   |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key                                   |
| `AWS_SESSION_TOKEN`     | AWS session token (only if using a temp/lab key) |

## Infrastructure as Code — `terraform/`

Provisions, in the default VPC:
- A **security group** exposing port **80** (HTTP) and 22 (SSH)
- An **EC2 instance** (Amazon Linux 2023, looked up via SSM so no AMI is
  hard-coded) that installs Docker and runs the container

Run it manually if you like:

```bash
cd terraform
terraform init
terraform apply -var="docker_image=hunterevans0/hunter-evnas-final:latest"
terraform output application_url
```

---

## Submission links

- **Code base:** https://github.com/byui-itm350-a2s26/hunter-evans-final
- **Docker image:** https://hub.docker.com/r/hunterevans0/hunter-evnas-final
- **Live EC2 URL:** _printed by the release pipeline after it runs_

_ITM 350 Final Project · Hunter Evans_
