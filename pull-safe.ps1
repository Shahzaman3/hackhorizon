$ErrorActionPreference = "Stop"

# 1. Ensure we identify the current branch
$branch = git branch --show-current
Write-Host "Current branch: $branch"

# 2. Create absolute backup of the current pristine local server folder (with our fixes)
Write-Host "Backing up local server snapshot..."
Copy-Item -Recurse -Force "server" "../server_backup_snap"

# 3. Commit ALL local changes so git pull is allowed to run without dirty tree errors
Write-Host "Committing local state..."
git add .
git commit -m "Local changes before pulling remote UI updates"

# 4. Pull the remote changes (this grabs the UI *and* remote backend changes)
Write-Host "Pulling from remote..."
git pull origin $branch --no-edit

# 5. Obliterate the post-pull server folder and replace it purely with our snapshot!
Write-Host "Restoring strict local backend isolation..."
Remove-Item -Recurse -Force "server"
Copy-Item -Recurse -Force "../server_backup_snap" "server"
Remove-Item -Recurse -Force "../server_backup_snap"

# 6. Commit the restoration so the working tree is clean again
git add server
git commit -m "Restoring local backend to pristine state, rejecting remote backend changes"

Write-Host "Done safely pulling frontend without touching backend!"
