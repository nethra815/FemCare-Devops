# FemCare DevOps Setup

Complete DevOps pipeline with Docker, Jenkins, SonarQube, Prometheus, and Grafana.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│   MongoDB   │
│  (React)    │     │  (Express)   │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           │ /metrics
                           ▼
                    ┌──────────────┐
                    │  Prometheus  │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Grafana    │
                    └──────────────┘
```

## Services

| Service | Port | Purpose | Credentials |
|---------|------|---------|-------------|
| Frontend | 5173 | React UI | - |
| Backend | 5000 | Express API | - |
| MongoDB | 27017 | Database | - |
| Jenkins | 8080 | CI/CD Pipeline | see setup |
| Prometheus | 9090 | Metrics Collection | - |
| Grafana | 3000 | Visualization | admin/admin |
| SonarQube | 9000 | Code Quality | admin/admin |

## Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

### 2. Access Services

- **App**: http://localhost:5173
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **SonarQube**: http://localhost:9000 (admin/admin)

### 3. Seed Database

```bash
docker-compose exec backend npm run seed:indian
```

## Jenkins Setup

### First Time Login

1. Start the stack: `docker-compose up -d`
2. Get the initial admin password:
   ```bash
   docker exec femcare-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Open http://localhost:8080 and paste the password
4. Install suggested plugins
5. Create your admin user

### Required Plugins

Install from **Manage Jenkins → Plugins**:
- Docker Pipeline
- SonarQube Scanner
- Git

### Configure SonarQube in Jenkins

1. **Manage Jenkins → System → SonarQube servers**
   - Name: `SonarQube`
   - URL: `http://sonarqube:9000`
   - Token: add your SonarQube token as a credential

2. **Manage Jenkins → Tools → SonarQube Scanner**
   - Name: `sonar-scanner`
   - Install automatically: ✅

### Add SonarQube Token Credential

1. **Manage Jenkins → Credentials → Global → Add Credential**
   - Kind: Secret text
   - ID: `sonar-token`
   - Secret: (token from SonarQube → My Account → Security)

### Create Pipeline Job

1. **New Item → Pipeline**
2. Pipeline → Definition: `Pipeline script from SCM`
3. SCM: Git → Repository URL: your repo
4. Script Path: `Jenkinsfile`
5. Save → Build Now

### Pipeline Stages

1. **Checkout** - Clone repository
2. **Install & Test** - Run Jest unit tests
3. **SonarQube Analysis** - Code quality scan
4. **Build Docker Images** - Build containers
5. **Deploy** - Start services with docker-compose
6. **Health Check** - Verify backend is running

## Monitoring with Prometheus & Grafana

### Prometheus Metrics

Backend exposes metrics at `http://localhost:5000/metrics`:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency
- `nodejs_*` - Node.js runtime metrics
- `process_*` - Process metrics

### Grafana Dashboards

1. Login to Grafana (admin/admin)
2. Go to Dashboards → Import
3. Import dashboard ID: `1860` (Node Exporter Full)
4. Select Prometheus datasource

### Custom Dashboard

Create a dashboard with:
- Request rate: `rate(http_requests_total[5m])`
- Error rate: `rate(http_requests_total{status=~"5.."}[5m])`
- Latency: `histogram_quantile(0.95, http_request_duration_seconds_bucket)`

## SonarQube Setup

### First Time Setup

1. Access http://localhost:9000
2. Login with admin/admin
3. Change password when prompted
4. Generate token: My Account → Security → Generate Token
5. Add token to Jenkins credentials as `sonar-token`

### Quality Gates

Default quality gate checks:
- Code coverage > 80%
- No critical bugs
- No security vulnerabilities
- Technical debt < 5%

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Clean up everything
docker-compose down -v
docker system prune -a
```

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://mongo:27017/femcare
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
NODE_ENV=production
```

### Frontend

```env
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### Backend won't start

```bash
docker-compose logs backend
docker-compose restart backend
```

### MongoDB connection failed

```bash
docker-compose logs mongo
docker-compose restart mongo
```

### Prometheus not scraping

Check `prometheus.yml` and verify backend is exposing `/metrics`

```bash
curl http://localhost:5000/metrics
```

### Grafana can't connect to Prometheus

Check datasource configuration:
- URL: `http://prometheus:9090`
- Access: Server (proxy)

## Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up backup for MongoDB
- [ ] Enable authentication for Prometheus/Grafana
- [ ] Use Docker secrets for sensitive data
- [ ] Set resource limits in docker-compose

### Resource Limits

Add to docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## CI/CD Flow

```
Code Push → Jenkins Trigger → Tests → SonarQube → Build → Deploy → Health Check
```

## Metrics to Monitor

1. **Application**
   - Request rate
   - Error rate
   - Response time
   - Active users

2. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

3. **Database**
   - Connection pool
   - Query performance
   - Storage usage

## Alerts (Optional)

Configure Prometheus alerts in `prometheus.yml`:

```yaml
rule_files:
  - 'alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

## Backup Strategy

```bash
# Backup MongoDB
docker-compose exec mongo mongodump --out /backup

# Backup Grafana dashboards
docker-compose exec grafana grafana-cli admin export-dashboard
```

## Support

For issues, check:
1. Service logs: `docker-compose logs [service]`
2. Health endpoints: `/api/health`, `/metrics`
3. Container status: `docker-compose ps`
