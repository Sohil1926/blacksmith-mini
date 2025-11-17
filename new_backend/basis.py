from new_backend.new_config import *
import requests_unixsocket
 
github_token = GITHUB_TOKEN
url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs"

#GET request using the GitHub REST API
def get_jobs(github_token: str):
    workflow_runs = response.json().get('workflow_runs', [])

    # Get jobs for each workflow run
    all_jobs = []
    for run in workflow_runs:
        jobs_url = run['jobs_url']
        jobs_response = requests.get(jobs_url, headers=headers, timeout=10)
        if jobs_response.status_code == 200:
            jobs = jobs_response.json().get('jobs', [])
            all_jobs.extend(jobs)

    # Sort by created_at timestamp to get chronological queue order
    all_jobs.sort(key=lambda job: job['created_at'])

    return all_jobs

def create_vm():
    pass


