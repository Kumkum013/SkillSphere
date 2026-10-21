# Kubernetes Secret Setup Guide

## Important Note

The secret.yaml file uses `stringData` instead of `data`, which means you **do NOT need to base64 encode** your secrets. Simply replace the placeholder values with your actual values.

## How to Update Secrets

### Option 1: Edit secret.yaml Directly (Recommended)

Open `k8s/secret.yaml` and replace the placeholder values:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: skillsphere-secret
  namespace: skillsphere
type: Opaque
stringData:
  # JWT Secret - Change this to a strong random string
  JWT_SECRET: "your_actual_strong_secret_here"

  # GitHub OAuth Credentials - Update with your actual credentials
  GITHUB_CLIENT_ID: "your_actual_github_client_id"
  GITHUB_CLIENT_SECRET: "your_actual_github_client_secret"
  GITHUB_TOKEN: "your_actual_github_personal_access_token"

  # Email Configuration (Optional)
  EMAIL_HOST: "smtp.gmail.com"
  EMAIL_PORT: "587"
  EMAIL_USER: "your_email@gmail.com"
  EMAIL_PASS: "your_actual_app_password"
```

**Required Secrets:**
- `JWT_SECRET`: Strong random string (required for authentication)
- `GITHUB_CLIENT_ID`: GitHub OAuth App Client ID (for GitHub integration)
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret (for GitHub integration)

**Optional Secrets:**
- `GITHUB_TOKEN`: GitHub Personal Access Token (for enhanced GitHub API access)
- `EMAIL_*`: Email configuration (for email notifications)

### Option 2: Create Secret from Command Line

You can create the secret directly using kubectl without editing the file:

```bash
kubectl create secret generic skillsphere-secret \
  --from-literal=JWT_SECRET='your_strong_jwt_secret_here' \
  --from-literal=GITHUB_CLIENT_ID='your_github_client_id' \
  --from-literal=GITHUB_CLIENT_SECRET='your_github_client_secret' \
  --from-literal=GITHUB_TOKEN='your_github_personal_access_token' \
  --from-literal=EMAIL_HOST='smtp.gmail.com' \
  --from-literal=EMAIL_PORT='587' \
  --from-literal=EMAIL_USER='your_email@gmail.com' \
  --from-literal=EMAIL_PASS='your_app_password' \
  --namespace=skillsphere
```

### Option 3: Use Kubernetes Secrets Manager

For production, consider using:
- **External Secrets Operator**: Sync secrets from AWS Secrets Manager, Azure Key Vault, etc.
- **Sealed Secrets**: Encrypt secrets with public key
- **Vault**: HashiCorp Vault for secret management

## Generating Strong Secrets

### Generate JWT Secret
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### GitHub OAuth Setup
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set callback URL: `http://your-domain.com/api/auth/github/callback`
4. Copy Client ID and Client Secret

### GitHub Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token
3. Select scopes: repo, user:email
4. Copy the token

## Verifying Secrets

After applying the secret, verify it's created correctly:

```bash
kubectl get secret skillsphere-secret -n skillsphere

# Decode and view secret values (for debugging only)
kubectl get secret skillsphere-secret -n skillsphere -o jsonpath='{.data}' | jq

# View specific secret
kubectl get secret skillsphere-secret -n skillsphere -o jsonpath='{.data.JWT_SECRET}' | base64 -d
```

## Updating Secrets

If you need to update secrets after deployment:

```bash
# Delete and recreate
kubectl delete secret skillsphere-secret -n skillsphere
kubectl apply -f k8s/secret.yaml

# Or use kubectl patch
kubectl patch secret skillsphere-secret -n skillsphere --type='json' \
  -p='[{"op": "replace", "path": "/stringData/JWT_SECRET", "value":"new_secret"}]'

# Then restart deployments to pick up new secrets
kubectl rollout restart deployment/skillsphere-backend -n skillsphere
kubectl rollout restart deployment/skillsphere-frontend -n skillsphere
```

## Security Best Practices

1. **Never commit secrets to git**: Add `k8s/secret.yaml` to `.gitignore`
2. **Use environment-specific secrets**: Different secrets for dev/staging/prod
3. **Rotate secrets regularly**: Change secrets periodically
4. **Use secret management tools**: For production, use proper secret managers
5. **Limit secret access**: Use RBAC to control who can access secrets
6. **Audit secret access**: Monitor who accesses secrets

## Git Ignore

Add this to your `.gitignore`:

```
k8s/secret.yaml
*.secret.yaml
secrets/
```

## Example .gitignore for Secrets

```
# Kubernetes secrets
k8s/secret.yaml
k8s/*.secret.yaml

# Environment files
.env
.env.local
.env.*.local

# Secret directories
secrets/
```
