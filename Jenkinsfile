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
                sh 'docker compose -f $COMPOSE_FILE up -d --remove-orphans'
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
