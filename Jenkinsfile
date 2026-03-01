pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKER_IMAGE = 'code-colab/code-colab:latest'
    }

    stages {

        stage('Clone') {
            steps {
                echo 'Cloning repository...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                dir('backend') {
                    bat 'npm install'
                }
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

       stage('Docker Build & Push') {
    steps {
        echo 'Building Docker image...'

        withCredentials([usernamePassword(
            credentialsId: 'dockerhub',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {

            bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
            bat "docker build -t mahinth/occ-project:latest ."
            bat "docker push mahinth/occ-project:latest"
        }
    }
}
    }

    post {
        always {
            echo 'Cleaning up...'
            bat 'docker system prune -f'
        }
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}