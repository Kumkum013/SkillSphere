const Project = require('../models/project');
const User = require('../models/User');
const Task = require('../models/task');
const Notification = require('../models/notification');
const { cacheDel } = require('../config/redis');

// Get faculty dashboard stats and managed projects
const getFacultyOverview = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const [totalProjects, mentoredCount, pendingReviews, totalStudents] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ mentorId: facultyId }),
      Task.countDocuments({ status: 'PENDING_REVIEW' }),
      User.countDocuments({ role: 'STUDENT' })
    ]);

    const mentoredProjects = await Project.find({ mentorId: facultyId })
      .populate('ownerId', 'name email avatarUrl')
      .populate('members.userId', 'name email avatarUrl branch')
      .sort({ updatedAt: -1 });

    const recentPendingProjects = await Project.find({ mentorId: null, status: 'OPEN' })
      .populate('ownerId', 'name email branch')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      stats: {
        totalProjects,
        mentoredProjects: mentoredCount,
        pendingTaskReviews: pendingReviews,
        totalStudents
      },
      mentoredProjects,
      availableProjects: recentPendingProjects
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch faculty overview', error: err.message });
  }
};

// Claim or assign mentorship to a project
const claimMentorship = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.mentorId = req.user.id;
    await project.save();

    await Notification.create({
      userId: project.ownerId,
      type: 'FACULTY_MENTOR',
      projectId: project._id,
      message: `${req.user.name || 'A Faculty member'} joined as mentor for "${project.title}".`
    });

    res.status(200).json({ message: 'Mentorship claimed successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to claim mentorship', error: err.message });
  }
};

// Approve or verify student project
const toggleProjectApproval = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.isFacultyApproved = !project.isFacultyApproved;
    await project.save();

    await Notification.create({
      userId: project.ownerId,
      type: 'PROJECT_APPROVED',
      projectId: project._id,
      message: `Your project "${project.title}" has been ${project.isFacultyApproved ? 'approved' : 'unapproved'} by faculty.`
    });

    res.status(200).json({
      message: `Project ${project.isFacultyApproved ? 'approved' : 'unapproved'}`,
      isFacultyApproved: project.isFacultyApproved
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project approval', error: err.message });
  }
};

// Endorse a student skill
const endorseStudentSkill = async (req, res) => {
  try {
    const { studentId, skillId } = req.body;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const skillObj = student.skills.find(
      (s) => s.skillId && s.skillId.toString() === skillId.toString()
    );

    if (!skillObj) {
      return res.status(404).json({ message: 'Skill not found on student profile' });
    }

    if (!skillObj.endorsedBy) {
      skillObj.endorsedBy = [];
    }

    const alreadyEndorsed = skillObj.endorsedBy.some(
      (id) => id.toString() === req.user.id.toString()
    );

    if (alreadyEndorsed) {
      skillObj.endorsedBy = skillObj.endorsedBy.filter(
        (id) => id.toString() !== req.user.id.toString()
      );
    } else {
      skillObj.endorsedBy.push(req.user.id);
    }

    await student.save();
    await cacheDel(`project-recommendations:${studentId}`);

    if (!alreadyEndorsed) {
      await Notification.create({
        userId: student._id,
        type: 'SKILL_ENDORSED',
        message: `${req.user.name || 'Faculty'} endorsed your skill in "${skillObj.name}".`
      });
    }

    res.status(200).json({
      message: alreadyEndorsed ? 'Endorsement removed' : 'Skill endorsed successfully',
      skills: student.skills
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to endorse skill', error: err.message });
  }
};

module.exports = {
  getFacultyOverview,
  claimMentorship,
  toggleProjectApproval,
  endorseStudentSkill
};
