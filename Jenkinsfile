pipeline {

```
agent any

environment {
    IMAGE = "poll-frontend:${BUILD_NUMBER}"
    CONT  = "poll-frontend"
}

stages {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Install Dependencies') {
        steps {
            bat 'npm install'
        }
    }

    stage('Build Angular') {
        steps {
            bat 'ng build'
        }
    }

    stage('Create Dockerfile') {
        steps {
            script {
                writeFile file: 'Dockerfile', text: '''
```

FROM nginx:alpine

COPY dist/frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
'''
}
}
}

```
    stage('Build Docker Image') {
        steps {
            bat 'docker build -t %IMAGE% .'
        }
    }

    stage('Remove Existing Container') {
        steps {
            bat '''
```

docker rm -f %CONT%
exit /b 0
'''
}
}

```
    stage('Run Container') {
        steps {
            bat 'docker run -d --name %CONT% -p 4200:80 %IMAGE%'
        }
    }
}

post {
    success {
        echo 'Deployment successful'
    }
    failure {
        echo 'Deployment failed'
    }
}
```

}
