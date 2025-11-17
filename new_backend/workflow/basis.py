from dotenv import load_dotenv
import os
load_dotenv()

import requests
import requests_unixsocket

github_token = os.getenv('GITHUB_TOKEN')
repo_owner = os.getenv('REPO_OWNER')
repo_name = os.getenv('REPO_NAME')
url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/actions/runs"

#GET request using the GitHub REST API
def get_workflow_runs(github_token: str):
    headers = {"Authorization": f"token {github_token}"}
    response = requests.get(url, headers=headers, timeout=10)
    if response.status_code == 200:
        workflow_runs = response.json().get('workflow_runs', [])
        return workflow_runs
    else:
        return None

def get_jobs_from_workflow_run(workflow_run: dict, github_token: str):
    jobs_url = workflow_run['jobs_url']
    headers = {"Authorization": f"token {github_token}"}   
    jobs_response = requests.get(jobs_url, headers=headers, timeout=10)
    if jobs_response.status_code == 200:
        jobs = jobs_response.json().get('jobs', [])
        return jobs
    else:
        return None

def create_vm(job: dict):
    pass
