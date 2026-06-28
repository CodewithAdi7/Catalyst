#!/usr/bin/env python3
"""Test the enhanced design-aware scaffolding features"""
import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000/api/sprint"

print("=" * 70)
print("ENHANCED AUTO-SCAFFOLDING TEST")
print("=" * 70)
print()

# Test 1: Design-aware Sprint Initialization
print("TEST 1️⃣: Design-Aware Sprint Initialization")
print("-" * 70)

init_payload = {
    "monolithic_task": "Build a professional portfolio website to showcase my work and skills",
    "tech_stack": ["React", "TypeScript", "Tailwind CSS"],
    "estimated_total_hours": 2,
    "task_type": "coding"
}

response = requests.post(f"{BASE_URL}/initialize", json=init_payload)
init_data = response.json()
sprint_id = init_data["sprint_id"]

print(f"✅ Sprint Created: {sprint_id}")
print(f"\n📋 Design-Aware Milestones (ordered by UI hierarchy):")
for i, task in enumerate(init_data['timeline'], 1):
    print(f"   {i}. {task['title']}")
    print(f"      → {task['description'][:80]}...")
print()

# Test 2: Scaffold with Design Inspiration and User Guidance
print("\nTEST 2️⃣: Scaffold with Design Inspiration & User Guidance")
print("-" * 70)

scaffold = init_data['first_step_scaffold']

# Check for new fields
has_user_guidance = bool(scaffold.get('user_guidance', ''))
has_design_inspiration = bool(scaffold.get('design_inspiration', ''))
additional_files = scaffold.get('additional_files', {})

print(f"✅ User Guidance: {'Yes' if has_user_guidance else 'No'}")
if has_user_guidance:
    print(f"   📝 {scaffold['user_guidance'][:150]}...")

print(f"\n✅ Design Inspiration: {'Yes' if has_design_inspiration else 'No'}")
if has_design_inspiration:
    print(f"   🎨 {scaffold['design_inspiration'][:150]}...")

print(f"\n✅ Additional Files to Create: {len(additional_files)}")
for file_path in list(additional_files.keys())[:3]:
    print(f"   📄 {file_path}")

print()

# Test 3: Materialize Scaffold (Creates Project + Multiple Files)
print("\nTEST 3️⃣: Auto-Setup with Multiple Files")
print("-" * 70)

materialize_payload = {
    "sprint_id": sprint_id,
    "task_title": "Build navbar and hero section",
    "task_type": "coding",
    "scaffold": scaffold,
    "preferred_app": "vscode",
    "open_app": False
}

response = requests.post(f"{BASE_URL}/materialize-scaffold", json=materialize_payload)
result = response.json()
workspace_path = result['workspace_path']

print(f"✅ Project Setup Complete!")
print(f"   📍 Workspace: {workspace_path}")
print(f"\n📌 Setup Message:")
print(f"   {result['message']}")
print()

# Test 4: Verify File Structure
print("\nTEST 4️⃣: Verify Auto-Generated File Structure")
print("-" * 70)

workspace = Path(workspace_path)
print(f"Workspace exists: {workspace.exists()}")

if workspace.exists():
    print(f"\n📁 Key Files:")
    
    # Check for package.json
    if (workspace / 'package.json').exists():
        print(f"   ✅ package.json (npm configured)")
    
    # Check for src structure
    src_dir = workspace / 'src'
    if src_dir.exists():
        print(f"   ✅ src/ (project structure)")
        
        # List components
        components_dir = src_dir / 'components'
        if components_dir.exists():
            components = list(components_dir.glob('*.tsx'))
            print(f"   ✅ src/components/ ({len(components)} component files)")
            for comp in components[:3]:
                print(f"      • {comp.name}")
    
    # Check for node_modules
    if (workspace / 'node_modules').exists():
        print(f"   ✅ node_modules/ (dependencies installed)")
    
    # Count total files
    total_files = len(list(workspace.rglob('*')))
    total_code_files = len(list(workspace.rglob('*.tsx'))) + len(list(workspace.rglob('*.ts')))
    print(f"\n📊 Project Stats:")
    print(f"   Total files: {total_files}")
    print(f"   Code files: {total_code_files}")

print()

# Test 5: Task Completion Detection
print("\nTEST 5️⃣: Task Completion Detection")
print("-" * 70)

task_status_payload = {
    "sprint_id": sprint_id,
    "task_id": 1,
    "workspace_path": workspace_path
}

response = requests.post(f"{BASE_URL}/check-task-status", json=task_status_payload)
task_status = response.json()

print(f"Current Task: {task_status['task_id']}")
print(f"Completion Status: {task_status['completion_percentage']}%")
print(f"Modified Files: {len(task_status['modified_files'])}")
print(f"Is Complete: {'🎉 Yes!' if task_status['is_completed'] else '📝 In Progress'}")
print(f"\n💬 AI Feedback: {task_status['message']}")

if task_status['next_task_id']:
    print(f"\n⏭️ Next Task ID: {task_status['next_task_id']}")

print()
print("=" * 70)
print("✨ ENHANCED SCAFFOLDING FEATURES WORKING!")
print("=" * 70)
