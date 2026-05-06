pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        DOCKER_IMAGE_BACKEND  = "nethra0810/femcare-backend"
        DOCKER_IMAGE_FRONTEND = "nethra0810/femcare-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test'
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
                sh "docker-compose build"
            }
        }

        stage('Deploy') {
            steps {
                sh "docker-compose up -d"
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for services to start..."
                    sleep 15
                    curl -f http://localhost:5000/api/health || exit 1
                    echo "Backend is healthy"
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded. App running at http://localhost:5173"
            echo "Grafana:    http://localhost:3000  (admin/admin)"
            echo "Prometheus: http://localhost:9090"
            echo "SonarQube:  http://localhost:9000"
        }
        failure {
            echo "Pipeline failed. Check logs above."
            sh "docker-compose logs --tail=50"
        }
        always {
            sh "docker system prune -f || true"
        }
    }
}
