#!/usr/bin/env python3
"""Test the auto-scaffolding feature"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://localhost:8000/api/sprint"

# Test 1: Initialize sprint
print("=" * 60)
print("TEST 1: Initialize Sprint")
print("=" * 60)

init_payload = {
    "monolithic_task": "Build a React todo list app",
    "tech_stack": ["React", "TypeScript", "Tailwind CSS"],
    "estimated_total_hours": 1,
    "task_type": "coding"
}

response = requests.post(f"{BASE_URL}/initialize", json=init_payload)
print(f"Status: {response.status_code}")
init_data = response.json()
sprint_id = init_data["sprint_id"]
print(f"Sprint ID: {sprint_id}")
print(f"Timeline tasks: {len(init_data['timeline'])}")
print(f"First scaffold boilerplate preview: {init_data['first_step_scaffold']['boilerplate_code'][:100]}...")
print()

# Test 2: Materialize scaffold (this triggers auto-scaffolding)
print("=" * 60)
print("TEST 2: Materialize Scaffold (Auto-Scaffolding)")
print("=" * 60)

scaffold = init_data['first_step_scaffold']
materialize_payload = {
    "sprint_id": sprint_id,
    "task_title": "Initial Project Setup",
    "task_type": "coding",
    "scaffold": scaffold,
    "preferred_app": "vscode",
    "open_app": False  # Don't try to open VS Code
}

print(f"Terminal commands to execute: {scaffold['terminal_commands']}")
print()

response = requests.post(f"{BASE_URL}/materialize-scaffold", json=materialize_payload)
print(f"Status: {response.status_code}")
result = response.json()
print(f"Message: {result['message']}")
print(f"Workspace path: {result['workspace_path']}")
print(f"Materialized file path: {result['materialized_path']}")
print()

# Test 3: Check if the project structure was created
print("=" * 60)
print("TEST 3: Verify Project Structure")
print("=" * 60)

workspace = Path(result['workspace_path'])
print(f"Workspace exists: {workspace.exists()}")
print(f"Workspace path: {workspace}")

if workspace.exists():
    print(f"\nDirectory listing:")
    for item in workspace.rglob('*'):
        rel_path = item.relative_to(workspace)
        if item.is_file():
            print(f"  📄 {rel_path}")
        else:
            print(f"  📁 {rel_path}/")
    
    # Check for key files
    print(f"\nKey files check:")
    print(f"  package.json exists: {(workspace / 'package.json').exists()}")
    print(f"  src/components/MicroTaskStarter.tsx exists: {(workspace / 'src' / 'components' / 'MicroTaskStarter.tsx').exists()}")
    print(f"  node_modules exists: {(workspace / 'node_modules').exists()}")
else:
    print("❌ Workspace directory was not created!")

print("\n" + "=" * 60)
print("Test completed!")
print("=" * 60)
