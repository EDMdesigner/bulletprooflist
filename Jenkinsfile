pipeline {
	agent any
	tools {
		nodejs 'Node Argon [4.6.0] + mocha, gulp, grunt, jasmine'
	}
	stages {
		stage('build') {
			steps {
				sh 'npm install'
			}
		}
		stage('deploy and publish') {
			when {
				branch "master"
			}
			steps {
				withNPM(npmrcConfig:'npmrc-global') {
					sh 'npm publish'
				}
			}
		}
	}
	
	post {
		always {
			cleanWs()
		}
		failure {
			slackSend color: 'danger', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
		}
		success {
			slackSend color: 'good', message: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
		}
		unstable {
			slackSend color: 'warning', message: "UNSTABLE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
		}
	}
}