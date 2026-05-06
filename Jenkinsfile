pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        COMPOSE_FILE = "${WORKSPACE}/docker-compose.yml"
        COMPOSE_PROJECT_NAME = "healthcare-mern"
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
                sh '''
                    # Get the ID of the Jenkins container running this pipeline
                    JENKINS_CID=$(cat /proc/1/cpuset | grep -o '[a-f0-9]\\{12,\\}' | head -1 || hostname)

                    # Stop and remove all compose service containers except Jenkins
                    for SVC in mongo backend frontend sonarqube; do
                        CID=$(docker compose -f $COMPOSE_FILE ps -q $SVC 2>/dev/null)
                        if [ -n "$CID" ]; then
                            echo "Removing $SVC container: $CID"
                            docker rm -f $CID || true
                        fi
                    done

                    # Also free ports in case containers from other runs are holding them
                    for PORT in 5000 5173 27017 9000; do
                        CID=$(docker ps -q --filter "publish=$PORT")
                        if [ -n "$CID" ]; then
                            echo "Freeing port $PORT from container $CID"
                            docker rm -f $CID || true
                        fi
                    done
                '''
                // Bring up app + sonarqube only (skip prometheus and grafana for now)
                sh 'docker compose -f $COMPOSE_FILE up -d mongo backend frontend sonarqube'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for backend..."

                    for i in $(seq 1 15); do
                        if curl -sf http://backend:5000/api/health; then
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
