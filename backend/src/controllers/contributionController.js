const Contribution = require('../models/contribution');
const Project = require('../models/project');
const User = require('../models/User');
const axios = require('axios');

// Helper to construct GitHub API headers
const getGithubHeaders = (user) => {
  const token = user?.github?.accessToken || process.env.GITHUB_TOKEN;
  const headers = {
    'User-Agent': 'SkillSphere-App',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  return headers;
};

// Sync GitHub contributions for a project
const syncContributions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.githubRepo || !project.githubRepo.owner || !project.githubRepo.repoName) {
      return res.status(400).json({ message: 'Project is not linked to any GitHub repository. Please link a repository first.' });
    }

    const { owner, repoName } = project.githubRepo;

    // Collect all member IDs including project owner
    const memberIds = (project.members || []).map(m => m.userId).filter(Boolean);
    if (project.ownerId && !memberIds.some(id => id.toString() === project.ownerId.toString())) {
      memberIds.push(project.ownerId);
    }

    // Get all team members with non-empty GitHub usernames
    const members = await User.find({
      _id: { $in: memberIds },
      'github.username': { $exists: true, $nin: ['', null] }
    });

    if (members.length === 0) {
      return res.status(400).json({
        message: 'No team members have linked their GitHub accounts yet. Please link your GitHub username in your Profile.'
      });
    }

    // Verify repository exists and is accessible
    try {
      await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: getGithubHeaders(members[0])
      });
    } catch (repoErr) {
      if (repoErr.response?.status === 404) {
        return res.status(404).json({
          message: `Repository "${owner}/${repoName}" was not found on GitHub or is private.`
        });
      }
      if (repoErr.response?.status === 403 && repoErr.response?.data?.message?.includes('API rate limit')) {
        return res.status(429).json({
          message: 'GitHub API rate limit exceeded. Please wait a moment or configure GITHUB_TOKEN.'
        });
      }
    }

    const contributions = [];

    // Fetch contributions for each member
    for (const member of members) {
      const headers = getGithubHeaders(member);
      const username = member.github.username.trim();

      try {
        // Get commits
        const commitsResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repoName}/commits?author=${encodeURIComponent(username)}&per_page=100`,
          { headers }
        );

        if (Array.isArray(commitsResponse.data)) {
          for (const commit of commitsResponse.data) {
            const existing = await Contribution.findOne({
              projectId,
              userId: member._id,
              commitHash: commit.sha
            });

            if (!existing) {
              const contribution = await Contribution.create({
                projectId,
                userId: member._id,
                userName: member.name,
                repository: `${owner}/${repoName}`,
                githubUsername: username,
                contributionType: 'COMMIT',
                title: commit.commit?.message ? commit.commit.message.split('\n')[0] : 'Commit',
                description: commit.commit?.message || '',
                url: commit.html_url,
                commitHash: commit.sha,
                githubCreatedAt: commit.commit?.author?.date || new Date(),
                linesAdded: 0,
                linesDeleted: 0,
                filesChanged: 0
              });
              contributions.push(contribution);
            }
          }
        }

        // Get pull requests
        const prsResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repoName}/pulls?state=all&per_page=100`,
          { headers }
        );

        if (Array.isArray(prsResponse.data)) {
          const userPrs = prsResponse.data.filter(
            (pr) => pr.user?.login?.toLowerCase() === username.toLowerCase()
          );

          for (const pr of userPrs) {
            const existing = await Contribution.findOne({
              projectId,
              userId: member._id,
              pullRequestNumber: pr.number
            });

            if (!existing) {
              const contribution = await Contribution.create({
                projectId,
                userId: member._id,
                userName: member.name,
                repository: `${owner}/${repoName}`,
                githubUsername: username,
                contributionType: 'PULL_REQUEST',
                title: pr.title || 'Pull Request',
                description: pr.body || '',
                url: pr.html_url,
                pullRequestNumber: pr.number,
                linesAdded: pr.additions || 0,
                linesDeleted: pr.deletions || 0,
                filesChanged: pr.changed_files || 0,
                githubCreatedAt: pr.created_at,
                mergedAt: pr.merged_at,
                closedAt: pr.closed_at
              });
              contributions.push(contribution);
            }
          }
        }

        // Get issues
        const issuesResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repoName}/issues?creator=${encodeURIComponent(username)}&state=all&per_page=100`,
          { headers }
        );

        if (Array.isArray(issuesResponse.data)) {
          for (const issue of issuesResponse.data) {
            if (!issue.pull_request) {
              const existing = await Contribution.findOne({
                projectId,
                userId: member._id,
                issueNumber: issue.number
              });

              if (!existing) {
                const contribution = await Contribution.create({
                  projectId,
                  userId: member._id,
                  userName: member.name,
                  repository: `${owner}/${repoName}`,
                  githubUsername: username,
                  contributionType: 'ISSUE',
                  title: issue.title || 'Issue',
                  description: issue.body || '',
                  url: issue.html_url,
                  issueNumber: issue.number,
                  githubCreatedAt: issue.created_at,
                  closedAt: issue.closed_at
                });
                contributions.push(contribution);
              }
            }
          }
        }

      } catch (error) {
        console.error(`Error fetching contributions for ${username}:`, error.response?.status, error.message);
      }
    }

    // Update project last synced time
    project.githubRepo.lastSyncedAt = new Date();
    await project.save();

    res.json({
      message: 'Contributions synced successfully',
      contributionsAdded: contributions.length,
      contributions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync contributions', error: error.message });
  }
};

// Get all contributions for a project
const getProjectContributions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, type, status } = req.query;

    const filter = { projectId };

    if (userId) filter.userId = userId;
    if (type) filter.contributionType = type;
    if (status) filter.reviewStatus = status;

    const contributions = await Contribution.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email avatarUrl')
      .populate('reviewedBy', 'name');

    res.json({ contributions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contributions', error: error.message });
  }
};

// Get contribution summary for a project (for project manager)
const getContributionSummary = async (req, res) => {
  try {
    const { projectId } = req.params;

    const contributions = await Contribution.find({ projectId });

    // Group by user
    const userSummary = {};
    contributions.forEach(contrib => {
      const userId = contrib.userId.toString();
      if (!userSummary[userId]) {
        userSummary[userId] = {
          userId,
          userName: contrib.userName,
          totalContributions: 0,
          totalScore: 0,
          contributionsByType: {
            COMMIT: 0,
            PULL_REQUEST: 0,
            ISSUE: 0,
            CODE_REVIEW: 0,
            MERGE: 0
          },
          linesAdded: 0,
          linesDeleted: 0,
          filesChanged: 0,
          recentActivity: []
        };
      }

      userSummary[userId].totalContributions += 1;
      userSummary[userId].totalScore += contrib.contributionScore;
      userSummary[userId].contributionsByType[contrib.contributionType] += 1;
      userSummary[userId].linesAdded += contrib.linesAdded;
      userSummary[userId].linesDeleted += contrib.linesDeleted;
      userSummary[userId].filesChanged += contrib.filesChanged;

      if (userSummary[userId].recentActivity.length < 5) {
        userSummary[userId].recentActivity.push({
          type: contrib.contributionType,
          title: contrib.title,
          date: contrib.createdAt,
          score: contrib.contributionScore
        });
      }
    });

    // Convert to array and sort by total score
    const summary = Object.values(userSummary).sort((a, b) => b.totalScore - a.totalScore);

    // Add user details
    const userIds = summary.map(s => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name email avatarUrl');

    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    summary.forEach(s => {
      const userDetails = userMap[s.userId];
      if (userDetails) {
        s.userDetails = {
          name: userDetails.name,
          email: userDetails.email,
          avatarUrl: userDetails.avatarUrl
        };
      }
    });

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contribution summary', error: error.message });
  }
};

// Add manual contribution
const addManualContribution = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      contributionType,
      title,
      description,
      url,
      linesAdded,
      linesDeleted,
      filesChanged
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user.github || !user.github.username) {
      return res.status(400).json({ message: 'Please link your GitHub account first' });
    }

    const contribution = await Contribution.create({
      projectId,
      userId: req.user.id,
      userName: user.name,
      repository: project.githubRepo?.url || 'Manual Entry',
      githubUsername: user.github.username,
      contributionType,
      title,
      description,
      url,
      linesAdded: linesAdded || 0,
      linesDeleted: linesDeleted || 0,
      filesChanged: filesChanged || 0
    });

    res.status(201).json({ message: 'Contribution added successfully', contribution });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add contribution', error: error.message });
  }
};

// Review contribution (for project manager)
const reviewContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;
    const { status, comment } = req.body;

    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    contribution.reviewStatus = status;
    contribution.reviewedBy = req.user.id;
    contribution.reviewComment = comment;
    await contribution.save();

    res.json({ message: 'Contribution reviewed successfully', contribution });
  } catch (error) {
    res.status(500).json({ message: 'Failed to review contribution', error: error.message });
  }
};

// Link GitHub repository to project
const linkGithubRepo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { repoUrl } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Parse GitHub URL (handle http/https, .git suffix, and trailing slashes)
    const cleanUrl = (repoUrl || '').trim();
    const urlMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!urlMatch) {
      return res.status(400).json({ message: 'Invalid GitHub repository URL. Format should be https://github.com/owner/repository' });
    }

    const owner = urlMatch[1];
    const repoName = urlMatch[2].replace(/\.git$/, '');

    project.githubRepo = {
      url: `https://github.com/${owner}/${repoName}`,
      owner,
      repoName,
      lastSyncedAt: null
    };

    await project.save();

    res.json({ message: 'GitHub repository linked successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Failed to link repository', error: error.message });
  }
};

module.exports = {
  syncContributions,
  getProjectContributions,
  getContributionSummary,
  addManualContribution,
  reviewContribution,
  linkGithubRepo
};
