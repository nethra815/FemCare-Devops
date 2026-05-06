pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        COMPOSE_FILE = "${WORKSPACE}/docker-compose.yml"
    }

    stages {

        stage('Install & Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test -- --forceExit'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                    sonar-scanner \
                        -Dsonar.projectKey=femcare \
                        -Dsonar.projectName="FemCare Healthcare App" \
                        -Dsonar.sources=backend/src,frontend/src \
                        -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.js \
                        -Dsonar.host.url=http://sonarqube:9000 \
                        -Dsonar.token=$SONAR_TOKEN
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose -f $COMPOSE_FILE build backend frontend'
            }
        }

        stage('Deploy') {
            steps {
                // Ensure prometheus.yml exists in workspace
                sh '''
                    if [ ! -f prometheus.yml ]; then
                        cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: femcare-backend
    static_configs:
      - targets: ['backend:5000']
    metrics_path: /metrics
EOF
                    fi
                '''
                // Stop and remove existing app containers to free ports
                sh 'docker compose -f $COMPOSE_FILE stop backend frontend || true'
                sh 'docker compose -f $COMPOSE_FILE rm -f backend frontend || true'
                // Start infra services only if not already running
                sh 'docker compose -f $COMPOSE_FILE up -d --no-recreate mongo prometheus grafana sonarqube || true'
                // Deploy fresh app containers
                sh 'docker compose -f $COMPOSE_FILE up -d --no-deps backend frontend'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for backend to be ready..."
                    for i in $(seq 1 12); do
                        if curl -sf http://localhost:5000/api/health; then
                            echo "Backend is healthy"
                            exit 0
                        fi
                        echo "Attempt $i/12 - waiting 5s..."
                        sleep 5
                    done
                    echo "Backend health check failed"
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "=========================================="
            echo "Pipeline PASSED"
            echo "App:        http://localhost:5173"
            echo "Grafana:    http://localhost:3000  (admin/admin)"
            echo "Prometheus: http://localhost:9090"
            echo "SonarQube:  http://localhost:9000"
            echo "=========================================="
        }
        failure {
            echo "Pipeline FAILED - check logs above"
            sh 'docker compose -f $COMPOSE_FILE logs --tail=30 backend || true'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
