#!/usr/bin/env python3
import subprocess
import requests
import json
import logging
from typing import List, Optional, Tuple

API_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2:72b-instruct"
HEADERS = {"Content-Type": "application/json"}

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def get_changed_files() -> Tuple[List[str], List[str]]:
    """
    Retrieves the list of staged and unstaged files using git diff commands.

    Returns:
        A tuple containing two lists:
        - List of staged file paths.
        - List of unstaged file paths.
    """
    try:
        staged_result = subprocess.run(
            ["git", "diff", "--cached", "--name-status"],
            capture_output=True,
            text=True,
            check=True,
        )

        unstaged_result = subprocess.run(
            ["git", "diff", "--name-only"], capture_output=True, text=True, check=True
        )

        staged_files = [line.split("\t")[1] for line in staged_result.stdout.splitlines() if line.startswith("M")]
        unstaged_files = unstaged_result.stdout.strip().split("\n")

        return staged_files, unstaged_files
    except subprocess.CalledProcessError:
        logging.error("Error running git diff commands")
        return [], []


def get_file_diff(file: str, staged: bool = False) -> str | None:
    """
    Retrieves the git diff for a specific file.

    Args:
        file: The file path to retrieve the diff for.
        staged: Boolean indicating whether to get the diff of staged changes.

    Returns:
        The git diff as a string, or None if there was an error.
    """
    try:
        diff_command = (
            ["git", "diff", file] if not staged else ["git", "diff", "--cached", file]
        )
        result = subprocess.run(
            diff_command, capture_output=True, text=True, check=True
        )
        logging.info(f"Got diff for file: {file}")
        return result.stdout
    except subprocess.CalledProcessError:
        logging.error(f"Error running git diff for {file}")
        return None


def create_json_payload(diff: str) -> str:
    """
    Creates the JSON payload for the API request.

    Args:
        diff: The git diff to include in the payload.

    Returns:
        A JSON string representing the payload.
    """
    prompt = (
        "You are a helpful coding assistant. Based on the following git diff, write a concise and informative git commit "
        "message that clearly explains the changes made. Your response must be in JSON format, following this schema: "
        '{"commit_message": "your commit message", "explanation": "your explanation"}\n\nExample diff:\n'
        '```diff\n- old_algo()\n+ new_algo()\n```\nExample commit message: "Updated function to use new algorithm for '
        'better performance."\n\nActual diff:\n```diff\n' + diff + "\n```"
    )
    return json.dumps(
        {"model": MODEL, "prompt": prompt, "stream": False, "format": "json"}
    )


def make_request(payload: str) -> Optional[dict]:
    """
    Makes the API request with the given payload.

    Args:
        payload: The JSON payload to send in the request.

    Returns:
        The JSON response as a dictionary, or None if there was an error.
    """
    try:
        response = requests.post(API_URL, headers=HEADERS, data=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Error making request: {e}")
        return None


def process_response(response: dict) -> str:
    """
    Processes the API response to extract the commit message.

    Args:
        response: The JSON response from the API.

    Returns:
        The commit message as a string.
    """
    try:
        logging.info(response)
        return json.loads(response.get("response", "{}")).get(
            "commit_message", "No commit message found"
        )
    except json.JSONDecodeError:
        logging.error("Error decoding JSON response")
        return "No commit message found"


def create_final_payload(commit_messages: List[str]) -> str:
    """
    Creates the final JSON payload to combine commit messages.

    Args:
        commit_messages: A list of individual commit messages.

    Returns:
        A JSON string representing the payload.
    """
    messages = "\n".join(f"- {msg}" for msg in commit_messages)
    prompt = (
        "You are a helpful assistant. Based on the following individual commit messages, combine them into one concise "
        "and cohesive commit message that clearly explains the overall changes made. Your response must be in JSON "
        'format, following this schema: {"commit_message": "your commit message", "explanation": "your explanation"}\n\n'
        f"Individual commit messages:\n{messages}"
    )
    return json.dumps(
        {"model": MODEL, "prompt": prompt, "stream": False, "format": "json"}
    )


def main():
    staged_files, unstaged_files = get_changed_files()

    if not staged_files and not unstaged_files:
        logging.info("No changed files")
        return

    commit_messages = []
    print(staged_files)
    print(unstaged_files)

    for file in staged_files:
        diff = get_file_diff(file, staged=True)
        if not diff:
            continue

        payload = create_json_payload(diff)
        response = make_request(payload)
        if response:
            commit_message = process_response(response)
            logging.info(f"Commit message for staged file {file}:\n{commit_message}\n")
            commit_messages.append(commit_message)

    for file in unstaged_files:
        diff = get_file_diff(file)
        if not diff:
            continue

        payload = create_json_payload(diff)
        response = make_request(payload)
        if response:
            commit_message = process_response(response)
            logging.info(
                f"Commit message for unstaged file {file}:\n{commit_message}\n"
            )
            commit_messages.append(commit_message)

    if commit_messages:
        final_payload = create_final_payload(commit_messages)
        final_response = make_request(final_payload)
        if final_response:
            final_commit_message = process_response(final_response)
            logging.info(f"Final cohesive commit message:\n{final_commit_message}")


if __name__ == "__main__":
    main()
