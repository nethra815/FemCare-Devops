pipeline {
    agent any

    stages {
        stage('Build Containers') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Deploy using Ansible') {
            steps {
                sh 'ansible-playbook ansible/deploy.yml'
            }
        }
    }
}