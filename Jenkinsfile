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
                        -Dsonar.host.url=http://femcare-sonarqube:9000 \
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
                // Remove any container using our ports (from any previous run)
                sh '''
                    for PORT in 5000 5173 27017 9000 9090 3000; do
                        CID=$(docker ps -q --filter "publish=$PORT")
                        if [ -n "$CID" ]; then
                            echo "Removing container on port $PORT"
                            docker rm -f $CID || true
                        fi
                    done
                '''
                // Deploy all services fresh
                sh 'docker compose -f $COMPOSE_FILE up -d --force-recreate'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for backend..."
                    for i in $(seq 1 15); do
                        if curl -sf http://localhost:5000/api/health; then
                            echo "Backend is healthy"
                            exit 0
                        fi
                        echo "Attempt $i/15 - retrying in 5s..."
                        sleep 5
                    done
                    echo "Health check failed"
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline PASSED"
            echo "App:        http://localhost:5173"
            echo "Grafana:    http://localhost:3000"
            echo "Prometheus: http://localhost:9090"
            echo "SonarQube:  http://localhost:9000"
        }
        failure {
            echo "Pipeline FAILED"
            sh 'docker compose -f $COMPOSE_FILE logs --tail=20 backend || true'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
