pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                echo "Checking workspace files..."
                ls -la
                '''
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                docker compose -f $COMPOSE_FILE build backend
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                docker compose -f $COMPOSE_FILE build frontend
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                docker run --rm \
                  --network host \
                  -v $(pwd):/usr/src \
                  sonarsource/sonar-scanner-cli \
                  -Dsonar.projectKey=mern-app \
                  -Dsonar.sources=. \
                  -Dsonar.host.url=http://localhost:9000
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                docker compose -f $COMPOSE_FILE up -d --force-recreate \
                mongo backend frontend prometheus grafana sonarqube
                '''
            }
        }

        stage('Check Running Containers') {
            steps {
                sh '''
                docker ps
                '''
            }
        }
    }

    post {

        success {
            echo 'Pipeline executed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}