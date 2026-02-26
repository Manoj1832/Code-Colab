pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        AWS_CREDENTIALS = credentials('aws-ec2')
        DOCKER_IMAGE = 'code-collab/code-collab:latest'
        EC2_HOST = credentials('ec2-host')
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
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                echo 'Building Docker image...'
                sh 'docker login -u ${DOCKERHUB_CREDENTIALS_USR} -p ${DOCKERHUB_CREDENTIALS_PSW}'
                sh 'docker build -t ${DOCKER_IMAGE} .'
                sh 'docker push ${DOCKER_IMAGE}'
            }
        }

        stage('AWS EC2 Deploy') {
            steps {
                echo 'Deploying to AWS EC2...'
                sh '''
                    ssh -o StrictHostKeyChecking=no -i $AWS_KEY_FILE $EC2_HOST << 'EOF'
                        docker pull ${DOCKER_IMAGE}
                        docker stop code-collab || true
                        docker rm code-collab || true
                        docker run -d --name code-collab -p 80:80 ${DOCKER_IMAGE}
                        docker system prune -f
                    EOF
                '''
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker system prune -f'
        }
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
