# Git Commands Reference - Complete Guide

---

## Getting Started

### Initial Setup
```bash
# Set your username and email globally
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set username and email for current repository only
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Check your configuration
git config --list
git config user.name
git config user.email
```

### Initialize Repository
```bash
# Create a new Git repository
git init

# Initialize repository with a specific branch name
git init -b main

# Clone an existing repository
git clone <repository-url>

# Clone to a specific directory
git clone <repository-url> <directory-name>

# Clone a specific branch
git clone -b <branch-name> <repository-url>

# Clone with limited history (shallow clone)
git clone --depth 1 <repository-url>
```

---

## Repository Management

### Repository Status
```bash
# Check repository status
git status

# Check status in short format
git status --short
git status -s

# Check status ignoring untracked files
git status --ignored
```

### Repository Information
```bash
# Show repository information
git remote -v

# Show branch information
git branch -a

# Show current branch
git branch --show-current

# Show repository size
git count-objects -vH
```

---

## Basic Operations

### Adding Files
```bash
# Add all files to staging area
git add .

# Add specific file
git add <filename>

# Add multiple files
git add <file1> <file2> <file3>

# Add all files with specific extension
git add *.js

# Add all modified files (not untracked)
git add -u

# Add files interactively
git add -i

# Add files with patch mode
git add -p
```

### Committing Changes
```bash
# Commit with message
git commit -m "Your commit message"

# Commit all tracked files (skip staging)
git commit -am "Your commit message"

# Commit with detailed message editor
git commit

# Amend last commit
git commit --amend

# Amend last commit with new message
git commit --amend -m "New commit message"

# Commit with signature
git commit -S -m "Signed commit message"
```

### Removing Files
```bash
# Remove file from working directory and staging
git rm <filename>

# Remove file from staging only (keep in working directory)
git rm --cached <filename>

# Remove directory recursively
git rm -r <directory>

# Remove files matching pattern
git rm *.log
```

### Moving/Renaming Files
```bash
# Move/rename file
git mv <old-name> <new-name>

# Move file to different directory
git mv <filename> <directory>/<filename>
```

---

## Branching and Merging

### Branch Operations
```bash
# List all branches
git branch

# List all branches (local and remote)
git branch -a

# List remote branches only
git branch -r

# Create new branch
git branch <branch-name>

# Create and switch to new branch
git checkout -b <branch-name>
git switch -c <branch-name>

# Switch to existing branch
git checkout <branch-name>
git switch <branch-name>

# Switch to previous branch
git checkout -
git switch -

# Delete local branch
git branch -d <branch-name>

# Force delete local branch
git branch -D <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

### Merging
```bash
# Merge branch into current branch
git merge <branch-name>

# Merge with no fast-forward (always create merge commit)
git merge --no-ff <branch-name>

# Merge with squash (combine all commits into one)
git merge --squash <branch-name>

# Abort merge
git merge --abort

# Continue merge after resolving conflicts
git merge --continue
```

### Rebasing
```bash
# Rebase current branch onto another branch
git rebase <base-branch>

# Interactive rebase (last n commits)
git rebase -i HEAD~n

# Interactive rebase to specific commit
git rebase -i <commit-hash>

# Abort rebase
git rebase --abort

# Continue rebase after resolving conflicts
git rebase --continue

# Skip current commit in rebase
git rebase --skip
```

---

## Remote Operations

### Remote Repository Management
```bash
# Add remote repository
git remote add <name> <url>

# Add remote with fetch URL
git remote add <name> <fetch-url> <push-url>

# Remove remote
git remote remove <name>

# Rename remote
git remote rename <old-name> <new-name>

# Show remote details
git remote show <name>

# List all remotes
git remote -v
```

### Fetching and Pulling
```bash
# Fetch from remote
git fetch <remote>

# Fetch all remotes
git fetch --all

# Fetch specific branch
git fetch <remote> <branch>

# Pull changes from remote
git pull <remote> <branch>

# Pull with rebase
git pull --rebase <remote> <branch>

# Pull with merge strategy
git pull --no-ff <remote> <branch>
```

### Pushing
```bash
# Push current branch to remote
git push <remote> <branch>

# Push all branches
git push --all

# Push tags
git push --tags

# Force push (use with caution)
git push --force
git push --force-with-lease

# Push to upstream branch
git push -u origin <branch>

# Push to different remote branch
git push <remote> <local-branch>:<remote-branch>
```

---

## History and Logs

### Viewing History
```bash
# Show commit history
git log

# Show commit history in one line
git log --oneline

# Show commit history with graph
git log --graph --oneline --all

# Show commit history with stats
git log --stat

# Show commit history with patches
git log -p

# Show commit history for specific file
git log <filename>

# Show commit history since date
git log --since="2024-01-01"

# Show commit history until date
git log --until="2024-12-31"

# Show commit history by author
git log --author="Author Name"

# Show commit history with custom format
git log --pretty=format:"%h - %an, %ar : %s"
```

### Comparing Changes
```bash
# Show differences in working directory
git diff

# Show differences in staging area
git diff --staged
git diff --cached

# Show differences between commits
git diff <commit1> <commit2>

# Show differences between branches
git diff <branch1>..<branch2>

# Show differences for specific file
git diff <filename>

# Show differences with word-level changes
git diff --word-diff
```

### Commit Information
```bash
# Show specific commit
git show <commit-hash>

# Show commit with stats
git show --stat <commit-hash>

# Show commit with patches
git show -p <commit-hash>

# Show commit message only
git show --format="%B" <commit-hash>
```

---

## Stashing

### Stash Operations
```bash
# Stash current changes
git stash

# Stash with message
git stash push -m "Work in progress"

# Stash specific files
git stash push <filename>

# List all stashes
git stash list

# Show stash content
git stash show <stash-name>

# Show stash content with patches
git stash show -p <stash-name>

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply <stash-name>

# Apply stash without removing it
git stash apply

# Drop specific stash
git stash drop <stash-name>

# Drop most recent stash
git stash drop

# Clear all stashes
git stash clear

# Create branch from stash
git stash branch <branch-name> <stash-name>
```

---

## Tags

### Tag Operations
```bash
# Create lightweight tag
git tag <tag-name>

# Create annotated tag
git tag -a <tag-name> -m "Tag message"

# Create tag for specific commit
git tag -a <tag-name> <commit-hash> -m "Tag message"

# List all tags
git tag

# List tags matching pattern
git tag -l "v1.*"

# Show tag information
git show <tag-name>

# Delete local tag
git tag -d <tag-name>

# Delete remote tag
git push origin --delete <tag-name>

# Push specific tag
git push origin <tag-name>

# Push all tags
git push origin --tags
```

---

## Configuration

### Global Configuration
```bash
# Set global username
git config --global user.name "Your Name"

# Set global email
git config --global user.email "your.email@example.com"

# Set global editor
git config --global core.editor "vim"

# Set global merge tool
git config --global merge.tool "vimdiff"

# Set global default branch
git config --global init.defaultBranch main

# Set global credential helper
git config --global credential.helper cache

# Set global alias
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

### Local Configuration
```bash
# Set local username (for current repository)
git config user.name "Your Name"

# Set local email (for current repository)
git config user.email "your.email@example.com"

# Set local ignore file
git config core.excludesfile ~/.gitignore_global
```

### Configuration Management
```bash
# List all configuration
git config --list

# List global configuration
git config --global --list

# List local configuration
git config --local --list

# Get specific configuration value
git config user.name

# Edit configuration file
git config --global --edit

# Remove configuration
git config --global --unset user.name
```

---

## Advanced Operations

### Cherry-picking

It allows you to pick individual commits from one branch and apply them to another branch, without merging or rebasing the entire branch.

```bash
# Cherry-pick specific commit
git cherry-pick <commit-hash>

# Cherry-pick multiple commits
git cherry-pick <commit1> <commit2>

# Cherry-pick range of commits
git cherry-pick <start-commit>..<end-commit>

# Cherry-pick without auto-commit
git cherry-pick --no-commit <commit-hash>

# Continue cherry-pick after resolving conflicts
git cherry-pick --continue

# Abort cherry-pick
git cherry-pick --abort
```

### Reset Operations
```bash
# Soft reset (keep changes in staging)
git reset --soft HEAD~1

# Mixed reset (keep changes in working directory)
git reset --mixed HEAD~1
git reset HEAD~1

# Hard reset (discard all changes)
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard <commit-hash>

# Reset specific file
git reset HEAD <filename>
```

---

## Common Workflows

### Feature Branch Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push -u origin feature/new-feature

# Create pull request (via web interface)
# After review and merge, clean up:
git checkout main
git pull origin main
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Hotfix Workflow
```bash
# Create hotfix branch from main
git checkout -b hotfix/critical-fix main

# Make urgent fix
git add .
git commit -m "Fix critical issue"

# Push hotfix
git push origin hotfix/critical-fix

# Merge to main and develop
git checkout main
git merge hotfix/critical-fix
git push origin main

git checkout develop
git merge hotfix/critical-fix
git push origin develop

# Clean up
git branch -d hotfix/critical-fix
git push origin --delete hotfix/critical-fix
```

### Release Workflow
```bash
# Create release branch
git checkout -b release/v1.0.0 develop

# Version bump and final fixes
git add .
git commit -m "Bump version to 1.0.0"

# Merge to main
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# Clean up
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

## Best Practices

### Commit Messages
```bash
# Use conventional commit format
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login issue"
git commit -m "docs: update README"
git commit -m "style: format code"
git commit -m "refactor: improve performance"
git commit -m "test: add unit tests"
git commit -m "chore: update dependencies"
```

### Branch Naming
```bash
# Feature branches
git checkout -b feature/user-dashboard
git checkout -b feature/payment-integration

# Bug fix branches
git checkout -b fix/login-error
git checkout -b fix/database-connection

# Hotfix branches
git checkout -b hotfix/security-patch
git checkout -b hotfix/critical-bug

# Release branches
git checkout -b release/v1.2.0
git checkout -b release/v2.0.0

```

---

## Additional Resources

### Git Documentation
- [Git Official Documentation](https://git-scm.com/doc)
- [Git Book](https://git-scm.com/book/en/v2)
- [GitHub Guides](https://guides.github.com/)

### Git Tools
- **Git GUI**: `git gui`
- **GitK**: `gitk`
- **GitHub Desktop**: Desktop client
- **SourceTree**: Cross-platform Git client
- **GitKraken**: Modern Git client

### Git Hosting Services
- **GitHub**: Most popular Git hosting
- **GitLab**: Self-hosted option
- **Bitbucket**: Atlassian's Git hosting
- **Azure DevOps**: Microsoft's Git hosting 