const jwt = require('jsonwebtoken');
const GitHubIntegration = require('../models/githubIntegration');
const Project = require('../models/project');
const User = require('../models/User');
const { encryptToken, decryptToken } = require('../services/githubTokenEncryption');

const GITHUB_API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
};

const getOAuthConfiguration = () => {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
    throw new Error('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL.');
  }
  return { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET, callbackUrl: GITHUB_CALLBACK_URL };
};

const parseRepositoryUrl = (value) => {
  if (typeof value !== 'string' || value.length > 300) return null;
  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== 'github.com' || !['http:', 'https:'].includes(url.protocol)) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 2) return null;
    const owner = parts[0];
    const repository = parts[1].replace(/\.git$/i, '');
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(owner)
      || !/^[A-Za-z0-9_.-]+$/.test(repository)) return null;
    return { owner, repository };
  } catch {
    return null;
  }
};

const beginGitHubConnect = async (req, res) => {
  try {
    const config = getOAuthConfiguration();
    if (!process.env.GITHUB_TOKEN_ENCRYPTION_KEY || !/^[a-f0-9]{64}$/i.test(process.env.GITHUB_TOKEN_ENCRYPTION_KEY)) {
      return res.status(503).json({ message: 'GitHub token encryption is not configured on the server' });
    }

    const project = await Project.findById(req.params.projectId).select('ownerId');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can connect its GitHub repository' });
    }

    const repository = parseRepositoryUrl(req.body?.repositoryUrl);
    if (!repository) {
      return res.status(400).json({ message: 'Enter a GitHub repository URL, such as https://github.com/owner/repository' });
    }

    const state = jwt.sign({
      purpose: 'github-project-connect',
      userId: req.user.id,
      projectId: project._id.toString(),
      repositoryOwner: repository.owner,
      repositoryName: repository.repository
    }, process.env.JWT_SECRET, { expiresIn: '10m', issuer: 'skillsphere' });

    const authorizationUrl = new URL('https://github.com/login/oauth/authorize');
    authorizationUrl.searchParams.set('client_id', config.clientId);
    authorizationUrl.searchParams.set('redirect_uri', config.callbackUrl);
    authorizationUrl.searchParams.set('scope', 'repo');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('allow_signup', 'false');

    res.status(200).json({ authorizationUrl: authorizationUrl.toString() });
  } catch (err) {
    res.status(503).json({ message: err.message || 'Unable to start GitHub authorization' });
  }
};

const finishGitHubConnect = async (req, res) => {
  let projectId;
  try {
    const { code, state, error: githubError } = req.body;
    if (typeof state !== 'string') throw new Error('GitHub authorization state is missing or invalid');
    const decoded = jwt.verify(state, process.env.JWT_SECRET, { issuer: 'skillsphere' });
    if (decoded.purpose !== 'github-project-connect') throw new Error('GitHub authorization state is invalid');
    projectId = decoded.projectId;
    if (req.user.id !== decoded.userId) {
      return res.status(403).json({ message: 'Sign in as the project owner who started GitHub authorization', projectId });
    }

    if (githubError) {
      return res.status(400).json({ message: 'GitHub authorization was cancelled or denied', projectId });
    }
    if (typeof code !== 'string' || !code) {
      return res.status(400).json({ message: 'GitHub did not return an authorization code', projectId });
    }

    const project = await Project.findById(projectId).select('ownerId');
    if (!project || project.ownerId.toString() !== decoded.userId) {
      throw new Error('The project owner changed or the project no longer exists');
    }
    const config = getOAuthConfiguration();
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (!tokenResponse.ok) throw new Error(`GitHub token exchange failed with HTTP ${tokenResponse.status}`);
    const tokenResult = await tokenResponse.json();
    if (tokenResult.error || !tokenResult.access_token) {
      throw new Error(tokenResult.error_description || 'GitHub did not provide an access token');
    }

    const accountResponse = await fetch('https://api.github.com/user', {
      headers: { ...GITHUB_API_HEADERS, Authorization: `Bearer ${tokenResult.access_token}` },
      signal: AbortSignal.timeout(10000)
    });
    if (!accountResponse.ok) throw new Error(`Could not verify the GitHub account (HTTP ${accountResponse.status})`);
    const account = await accountResponse.json();
    if (!account.login) throw new Error('GitHub account did not include a username');

    const integration = await GitHubIntegration.findOneAndUpdate(
      { projectId },
      {
        projectId,
        repositoryOwner: decoded.repositoryOwner,
        repositoryName: decoded.repositoryName,
        connectedBy: decoded.userId,
        githubUsername: account.login,
        encryptedAccessToken: encryptToken(tokenResult.access_token)
      },
      { new: true, upsert: true, runValidators: true }
    );
    await User.findByIdAndUpdate(decoded.userId, { githubUsername: account.login });
    projectId = integration.projectId.toString();
  } catch (err) {
    const status = err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' ? 400 : 502;
    return res.status(status).json({
      message: status === 400 ? 'GitHub authorization expired or is invalid. Start the connection again.' : err.message,
      ...(projectId ? { projectId } : {})
    });
  }

  return res.status(200).json({ projectId });
};

const getGitHubContributions = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).select('ownerId mentorId');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.ownerId.toString() === req.user.id;
    const isFaculty = ['FACULTY', 'ADMIN'].includes(req.user.role);
    if (!isOwner && !isFaculty) {
      return res.status(403).json({ message: 'Only the project owner or faculty can view GitHub contributions' });
    }

    const integration = await GitHubIntegration.findOne({ projectId: project._id }).select('+encryptedAccessToken');
    if (!integration) {
      return res.status(404).json({ message: 'No GitHub repository is connected to this project' });
    }

    const accessToken = decryptToken(integration.encryptedAccessToken);
    const contributors = [];
    let page = 1;
    let hasNextPage = true;
    while (hasNextPage && page <= 10) {
      const url = new URL(`https://api.github.com/repos/${encodeURIComponent(integration.repositoryOwner)}/${encodeURIComponent(integration.repositoryName)}/contributors`);
      url.searchParams.set('per_page', '100');
      url.searchParams.set('page', String(page));
      const response = await fetch(url, {
        headers: { ...GITHUB_API_HEADERS, Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        const status = response.status === 404 ? 502 : response.status === 401 || response.status === 403 ? 502 : response.status;
        const message = response.status === 404
          ? 'GitHub repository was not found or the connected account cannot access it. Reconnect an account with repository access.'
          : response.status === 401 || response.status === 403
            ? 'GitHub authorization expired or lacks repository access. Reconnect the repository owner’s GitHub account.'
            : `GitHub contributions request failed (HTTP ${response.status})`;
        return res.status(status).json({ message });
      }
      const pageContributors = await response.json();
      if (!Array.isArray(pageContributors)) {
        return res.status(502).json({ message: 'GitHub returned an unexpected contributors response' });
      }
      contributors.push(...pageContributors.map((contributor) => ({
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        profileUrl: contributor.html_url,
        commits: contributor.contributions
      })));
      hasNextPage = /<[^>]+[?&]page=\d+[^>]*>;\s*rel="next"/.test(response.headers.get('link') || '');
      page += 1;
    }

    if (hasNextPage) {
      return res.status(502).json({ message: 'Repository has more than 1,000 contributors; narrow the report before retrying' });
    }
    return res.status(200).json({
      repository: {
        owner: integration.repositoryOwner,
        name: integration.repositoryName,
        url: `https://github.com/${integration.repositoryOwner}/${integration.repositoryName}`,
        connectedAccount: integration.githubUsername,
        updatedAt: integration.updatedAt
      },
      metric: 'commits',
      contributors
    });
  } catch (err) {
    console.error('GitHub contribution fetch failed:', err.message);
    return res.status(502).json({ message: 'Could not load GitHub contributions. Check the backend logs and try again.' });
  }
};

module.exports = { beginGitHubConnect, finishGitHubConnect, getGitHubContributions };
