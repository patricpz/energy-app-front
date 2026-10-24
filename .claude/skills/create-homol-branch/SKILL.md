---
name: create-homol-branch
description: Create a new branch from the homol branch, never from main
---

# Create Branch from homol

Whenever a new branch is needed, the new branch **MUST** be created from the `homol` branch and never from the `main` branch.

## Rules

1. **Never** create a new branch directly from the `main` branch.
2. Whenever creating a new branch, use the `homol` branch as the base.
3. If you are on `main` and need to create a new branch, first checkout the `homol` branch.

## Step by step

To create a new branch from `homol`:

```bash
# 1. Make sure you are on the homol branch
git checkout homol

# 2. Update the homol branch
git pull origin homol

# 3. Create the new branch from homol
git checkout -b <new-branch-name> homol
```

Replace `<new-branch-name>` with the desired name of the new branch.

## Example

To create a branch called `feature/new-feature`:

```bash
git checkout homol
git pull origin homol
git checkout -b feature/new-feature homol
```

## Verification

Before creating a new branch, always confirm the base branch:

```bash
git branch --show-current
```

The result should be `homol` for any new branch.
