import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircle, ArrowLeft, Send, Mail, Check, Target, Trash2, MoreVertical, Edit, Github } from 'lucide-react';
import Navbar from '../components/Navbar';
import SkillDots from '../components/SkillDots';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

export const ProjectChatPanel = ({ project: initialProject = null, defaultMode = 'team', defaultUserId = null }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(initialProject);
  const [messages, setMessages] = useState([]);
  const [chatMode, setChatMode] = useState(defaultMode);
  const [selectedUserId, setSelectedUserId] = useState(defaultUserId);
  const [messageDraft, setMessageDraft] = useState('');
  const [chatError, setChatError] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const endRef = useRef(null);
  const latestChatRequestRef = useRef(0);

  const projectId = id || project?._id;
  const currentUserId = user?.id;

  useEffect(() => {
    setChatMode(defaultMode);
    setSelectedUserId(defaultUserId);
  }, [defaultMode, defaultUserId]);

  useEffect(() => {
    if (!project && projectId) {
      api.get(`/projects/${projectId}`)
        .then((res) => setProject(res.data.project))
        .catch(() => setChatError('Unable to load project chat.'));
    }
  }, [project, projectId]);

  const loadProjectMessages = async () => {
    if (!projectId) return;
    const requestId = ++latestChatRequestRef.current;
    try {
      const res = await api.get(`/projects/${projectId}/chat`);
      if (requestId !== latestChatRequestRef.current) return;
      setMessages(res.data.messages || []);
      setChatError('');
    } catch (err) {
      if (requestId !== latestChatRequestRef.current) return;
      setChatError(err.response?.data?.message || 'Unable to load team chat.');
    }
  };

  const loadPrivateMessages = async (memberId) => {
    if (!projectId || !memberId) return;
    const requestId = ++latestChatRequestRef.current;
    try {
      const res = await api.get(`/projects/${projectId}/chat/${memberId}`);
      if (requestId !== latestChatRequestRef.current) return;
      setMessages(res.data.messages || []);
      setChatError('');
    } catch (err) {
      if (requestId !== latestChatRequestRef.current) return;
      setChatError(err.response?.data?.message || 'Unable to load private chat.');
    }
  };

  useEffect(() => {
    if (!projectId) return;
    if (chatMode === 'team') {
      loadProjectMessages();
    } else if (selectedUserId) {
      loadPrivateMessages(selectedUserId);
    }
  }, [projectId, chatMode, selectedUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!project) {
    return <div className="glass-card rounded-2xl p-6 text-sm text-ink/50">Loading project chat…</div>;
  }

  const members = Array.from(
    new Map(
      (project.members || []).map((member) => {
        const memberId = String(member.userId?._id || member.userId || '');
        return [memberId, member];
      })
    ).values()
  );

  const getMemberUserId = (member) => {
    const candidate = member?.userId ?? member;
    if (!candidate) return '';
    if (typeof candidate === 'string') return candidate;
    if (candidate._id) return String(candidate._id);
    return String(candidate);
  };

  const displayMembers = members.filter((member) => {
    const memberId = getMemberUserId(member);
    return memberId && memberId !== String(currentUserId);
  });

  const selectedMember = members.find((member) => {
    const memberId = getMemberUserId(member);
    return memberId === String(selectedUserId);
  });

  const openPrivateChat = async (memberId) => {
    setChatMode('private');
    setSelectedUserId(memberId);
    setMessageDraft('');
    setChatError('');
    await loadPrivateMessages(memberId);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmed = messageDraft.trim();
    if (!trimmed || !projectId) return;

    setChatLoading(true);
    setChatError('');

    try {
      if (chatMode === 'team') {
        const response = await api.post(`/projects/${projectId}/chat`, { message: trimmed });
        const newMessage = response?.data?.message;
        setChatError('');
        if (newMessage) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg._id === newMessage._id);
            return exists ? prev : [...prev, newMessage];
          });
        } else {
          await loadProjectMessages();
        }
      } else if (selectedUserId) {
        const response = await api.post(`/projects/${projectId}/chat/${selectedUserId}`, { message: trimmed });
        const newMessage = response?.data?.message;
        setChatError('');
        if (newMessage) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg._id === newMessage._id);
            return exists ? prev : [...prev, newMessage];
          });
        } else {
          await loadPrivateMessages(selectedUserId);
        }
      }
      setMessageDraft('');
    } catch (err) {
      setChatError(err.response?.data?.message || 'Could not send message.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-soft border border-slate-700/80">
      <div className="flex flex-col gap-3 border-b border-slate-700/80 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setChatMode('team')}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
              chatMode === 'team'
                ? 'bg-[#f87171] text-[#111827] shadow-[0_8px_18px_rgba(248,113,113,0.28)]'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Team Chat
          </button>
          <button
            onClick={() => {
              if (displayMembers[0]) {
                openPrivateChat(getMemberUserId(displayMembers[0]));
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
              chatMode === 'private'
                ? 'bg-[#f87171] text-[#111827] shadow-[0_8px_18px_rgba(248,113,113,0.28)]'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Private Chats
          </button>
        </div>

        {chatMode === 'private' && selectedMember && (
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#fbb4b4] text-[#7f1d1d] flex items-center justify-center text-xs font-semibold">
              {(selectedMember.userId?.name || selectedMember.name)?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="font-medium text-white">{selectedMember.userId?.name || selectedMember.name}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] min-h-[500px]">
        <aside className="border-b lg:border-b-0 lg:border-r border-slate-700/80 bg-slate-900/50 p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-3">Team Members</h3>
          <div className="space-y-2">
            {displayMembers.length === 0 ? (
              <p className="text-sm text-slate-400">No teammates available.</p>
            ) : (
              displayMembers.map((member) => {
                const memberId = getMemberUserId(member);
                const memberName = member.userId?.name || member.name;
                const isSelected = chatMode === 'private' && String(selectedUserId) === memberId;

                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => openPrivateChat(memberId)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                      isSelected
                        ? 'border-[#f87171]/60 bg-[#1f1a1a] shadow-[0_0_0_1px_rgba(248,113,113,0.15)]'
                        : 'border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {member.userId?.avatarUrl ? (
                        <img src={member.userId.avatarUrl} alt={memberName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#fbc7c7] text-[#7f1d1d] flex items-center justify-center text-xs font-semibold">
                          {memberName?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{memberName}</p>
                        <p className="text-[11px] text-slate-400">Message</p>
                      </div>
                    </div>
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex flex-col min-h-[420px] bg-slate-950/30">
          {chatMode === 'private' && selectedMember && (
            <div className="flex items-center justify-between border-b border-slate-700/80 p-3 bg-slate-900/40">
              <button
                type="button"
                onClick={() => setChatMode('team')}
                className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-sm font-medium text-white">
                {selectedMember.userId?.name || selectedMember.name}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.06),_transparent_30%)]">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                No messages yet. Start the conversation.
              </div>
            ) : (
              messages.map((msg) => {
                const senderId = String(msg.sender?._id || msg.sender || '');
                const isMine = senderId === String(currentUserId);
                const senderName = msg.sender?.name || 'Unknown user';
                const avatar = msg.sender?.avatarUrl;
                const timeLabel = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMine && (
                        <div className="mb-1 flex items-center gap-2">
                          {avatar ? (
                            <img src={avatar} alt={senderName} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#fbb4b4] text-[#7f1d1d] flex items-center justify-center text-[10px] font-semibold">
                              {senderName[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-[11px] font-medium text-slate-300">{senderName}</span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-3 py-2.5 shadow-sm border ${
                          isMine
                            ? 'bg-[#f87171] text-[#111827] border-[#ef6b6b]'
                            : 'bg-slate-900 text-slate-100 border-slate-700'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message || msg.body}</p>
                      </div>

                      <p className={`mt-1 text-[10px] ${isMine ? 'text-right text-slate-400' : 'text-left text-slate-400'}`}>
                        {timeLabel}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-700/80 p-4 bg-slate-900/60">
            <div className="flex gap-2">
              <textarea
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                rows={1}
                placeholder="Type a message..."
                className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f9b5b5] focus:border-[#f87171]"
                style={{ color: '#f1f5f9', backgroundColor: '#0f172a' }}
              />
              <button
                type="submit"
                disabled={chatLoading || !messageDraft.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f87171] px-4 py-2 text-sm font-medium text-[#111827] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_10px_24px_rgba(248,113,113,0.22)]"
              >
                <Send className="w-4 h-4" /> {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
            {chatError && <p className="mt-2 text-xs text-red-300">{chatError}</p>}
          </form>
        </section>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('overview');
  const [chatTab, setChatTab] = useState('team');
  const [chatUserId, setChatUserId] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', requiredSkill: '', deadline: '', assignedTo: '' });
  const [invitedIds, setInvitedIds] = useState([]);
  const [invitationError, setInvitationError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinNotice, setJoinNotice] = useState('');
  const [minScore, setMinScore] = useState(50);
  const [bulkInviteLoading, setBulkInviteLoading] = useState(false);
  const [bulkInviteSuccess, setBulkInviteSuccess] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const load = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`).catch(() => ({ data: { tasks: [] } }))
      ]);
      setProject(projRes.data.project);
      setRelationship(projRes.data.relationship || {});
      setMatchScore(projRes.data.matchScore);
      setMatchedSkills(projRes.data.matchedSkills || []);
      setTasks(taskRes.data.tasks || []);

      if (projRes.data.project?.minMatchScore) {
        setMinScore(projRes.data.project.minMatchScore);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      setProject(null);
    }
  };

  useEffect(() => { load(); }, [id]);

  const isOwner = project && user && String(project.ownerId?._id || project.ownerId) === String(user.id);
  const isFacultyMentor = project && user && ['FACULTY', 'ADMIN'].includes(user.role)
    && String(project.mentorId?._id || project.mentorId || '') === String(user.id);
  const requestStatus = relationship?.joinRequest?.status;
  const requestToJoin = async () => {
    setJoinLoading(true);
    setJoinError('');
    setJoinNotice('');
    try {
      const response = await api.post(`/projects/${id}/join-request`);
      setRelationship((current) => ({ ...current, joinRequest: response.data.request }));
      setJoinNotice(response.data.emailSent
        ? 'Join request sent; the project owner was emailed.'
        : 'Join request sent, but the owner email could not be delivered.');
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Could not send join request');
    } finally {
      setJoinLoading(false);
    }
  };

  const expressInterest = async () => {
    setInterestLoading(true);
    setJoinError('');
    setJoinNotice('');
    try {
      const response = await api.post(`/projects/${id}/join-request`);
      setRelationship((current) => ({ ...current, joinRequest: response.data.request }));
      setJoinNotice(response.data.emailSent
        ? 'Join request sent; the project owner was emailed.'
        : 'Join request sent, but the owner email could not be delivered.');
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Could not express interest');
    } finally {
      setInterestLoading(false);
    }
  };

  const loadRecommendations = () => {
    api.get(`/projects/${id}/recommendations`).then((res) => setRecommendations(res.data.recommendations));
  };

  useEffect(() => {
    if (tab === 'recommendations') loadRecommendations();
  }, [tab]);

  const invite = async (studentId) => {
    setInvitationError('');
    try {
      const response = await api.post('/invitations', { projectId: id, studentId });
      setInvitedIds((prev) => [...prev, studentId]);
      setBulkInviteSuccess({ count: 1, message: response.data.message });
    } catch (err) {
      setInvitationError(err.response?.data?.message || 'Could not deliver the invitation email.');
    }
  };

  const sendBulkInvites = async () => {
    setBulkInviteLoading(true);
    setBulkInviteSuccess(null);
    try {
      const studentIds = recommendations
        .filter((r) => r.matchScore >= minScore && !invitedIds.includes(r.student.id))
        .map((r) => r.student.id);

      if (studentIds.length === 0) {
        setBulkInviteSuccess({ count: 0, message: 'No eligible candidates to invite' });
        return;
      }

      const response = await api.post('/invitations/bulk', {
        projectId: id,
        studentIds,
        minScore
      });

      const newInvitedIds = response.data.invitations.map((inv) => inv.studentId);
      setInvitedIds((prev) => [...prev, ...newInvitedIds]);
      setBulkInviteSuccess({
        count: response.data.totalSent,
        message: response.data.failedEmails?.length
          ? `Delivered ${response.data.totalSent} invitation(s); email delivery failed for ${response.data.failedEmails.length} candidate(s).`
          : `Delivered ${response.data.totalSent} invitation(s) to candidates with ${minScore}%+ match score.`
      });
    } catch (err) {
      console.error('Bulk invite failed:', err);
      setBulkInviteSuccess({ count: 0, message: err.response?.data?.message || 'Failed to send invitations' });
    } finally {
      setBulkInviteLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    await api.post('/tasks', { projectId: id, ...taskForm, assignedTo: taskForm.assignedTo || undefined });
    setTaskForm({ title: '', description: '', requiredSkill: '', deadline: '', assignedTo: '' });
    load();
  };

  const updateTaskStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}/status`, { status });
    load();
  };

  const updateProject = async () => {
    try {
      await api.put(`/projects/${id}`, {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status
      });
      setShowEditModal(false);
      load();
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const deleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      window.location.href = '/projects';
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const openEditModal = () => {
    setEditForm({
      title: project.title,
      description: project.description,
      status: project.status
    });
    setShowEditModal(true);
    setShowProjectMenu(false);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-ink/40 mb-4">Loading project...</p>
            <button 
              onClick={() => window.location.href = '/projects'}
              className="text-sm text-[#f87171] hover:underline"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const checkRequirementsFulfilled = () => {
    if (!project?.requiredSkills || project.requiredSkills.length === 0) return false;

    const memberSkills = new Set();
    (project.members || []).forEach((member) => {
      if (member.userId?.skills) {
        member.userId.skills.forEach((skill) => {
          const sId = skill.skillId?._id || skill.skillId;
          if (sId) {
            memberSkills.add(String(sId));
          }
        });
      }
    });

    const fulfilledSkills = project.requiredSkills.filter((req) => {
      const rId = req.skillId?._id || req.skillId;
      return rId && memberSkills.has(String(rId));
    });

    return fulfilledSkills.length === project.requiredSkills.length;
  };

  const requirementsFulfilled = checkRequirementsFulfilled();

  const statuses = ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED'];
  const statusLabel = { TODO: 'To do', IN_PROGRESS: 'In progress', PENDING_REVIEW: 'Pending review', COMPLETED: 'Done' };
  const contributionRows = project.members.map((member) => {
    const memberId = String(member.userId?._id || member.userId || '');
    const memberTasks = tasks.filter((task) => String(task.assignedTo?._id || task.assignedTo || '') === memberId);
    return {
      id: memberId,
      name: member.userId?.name || member.name || 'Team member',
      tasks: memberTasks,
      completed: memberTasks.filter((task) => task.status === 'COMPLETED').length
    };
  }).filter((member) => member.tasks.length > 0);
  const unassignedTasks = tasks.filter((task) => !task.assignedTo);
  const projectTabs = ['overview', 'team', 'chat', 'recommendations', 'tasks'];
  if (isOwner || relationship?.isMember || isFacultyMentor) projectTabs.push('contributions');

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto px-6 py-10"
      >
        <div className="glass-card rounded-3xl p-6 md:p-7 mb-6 border border-slate-700/80">
          {isOwner && requirementsFulfilled && project.status === 'OPEN' && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <div>
                    <p className="text-sm font-medium text-emerald-300">All skill requirements fulfilled!</p>
                    <p className="text-xs text-slate-400">Your team has all the required skills. Consider closing the project to new members.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditForm({ ...editForm, status: 'CLOSED' });
                    openEditModal();
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Close Project
                </button>
              </div>
            </div>
          )}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-700 text-white leading-tight">{project.title}</h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">{project.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowProjectMenu(!showProjectMenu)}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                  {showProjectMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 min-w-[160px] z-10">
                      <button
                        onClick={openEditModal}
                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Edit Project
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirm(true);
                          setShowProjectMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Project
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!isOwner && matchScore !== null && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-700 text-sm text-white"
                    style={{ background: `conic-gradient(#10b981 ${matchScore * 3.6}deg, #334155 0deg)` }}>
                    <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-700">
                      {matchScore}%
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Your match</p>
                    <p className="text-sm font-medium text-emerald-300">{matchScore >= 70 ? 'Great fit!' : matchScore >= 50 ? 'Good match' : 'Low match'}</p>
                  </div>
                </div>
              )}
              <span className={`text-[11px] px-3 py-1.5 rounded-full border font-semibold uppercase tracking-wide whitespace-nowrap ${
                project.status === 'OPEN' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                project.status === 'IN_PROGRESS' ? 'border-[#f87171]/30 bg-[#f87171]/10 text-[#fca5a5]' :
                project.status === 'CLOSED' ? 'border-slate-500/30 bg-slate-500/10 text-slate-300' :
                'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}>{project.status.replace('_', ' ')}</span>
              {isOwner && requirementsFulfilled && project.status === 'OPEN' && (
                <span className="text-xs text-emerald-300 border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  ✓ Requirements fulfilled
                </span>
              )}
              {isOwner ? (
                <span className="text-xs text-slate-300">Owner</span>
              ) : relationship?.isMember ? (
                <span className="text-xs text-emerald-300 border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 rounded-full">Joined</span>
              ) : requestStatus === 'PENDING' ? (
                <span className="text-xs text-[#fca5a5] border border-[#f87171]/20 bg-[#f87171]/10 px-2.5 py-1 rounded-full">Request Pending</span>
              ) : project.status !== 'OPEN' ? (
                <span className="text-xs text-slate-400">Not accepting members</span>
              ) : matchScore !== null && matchScore >= (project.minMatchScore || 50) ? (
                <button
                  onClick={expressInterest}
                  disabled={interestLoading}
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-500 text-white border border-emerald-400/80 shadow-[0_8px_20px_rgba(16,185,129,0.28)] transition-all hover:bg-emerald-600 hover:shadow-[0_10px_24px_rgba(16,185,129,0.34)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {interestLoading ? 'Sending...' : 'Express Interest ✓'}
                </button>
              ) : (
                <button
                  onClick={requestToJoin}
                  disabled={joinLoading}
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#f87171] text-[#111827] border border-[#fca5a5]/80 shadow-[0_8px_20px_rgba(248,113,113,0.28)] transition-all hover:bg-[#fb7185] hover:shadow-[0_10px_24px_rgba(248,113,113,0.34)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {joinLoading ? 'Sending...' : requestStatus === 'REJECTED' ? 'Request to Join Again' : 'Request to Join'}
                </button>
              )}
              {joinError && <span className="text-xs text-red-300 max-w-48 text-right">{joinError}</span>}
              {joinNotice && <span role="status" className={`text-xs max-w-48 text-right ${joinNotice.includes('could not') ? 'text-amber-300' : 'text-emerald-300'}`}>{joinNotice}</span>}
              {!isOwner && !relationship?.isMember && requestStatus !== 'PENDING' && project.status === 'OPEN' && matchScore !== null && matchScore >= (project.minMatchScore || 50) && (
                <p className="text-xs text-emerald-300 max-w-48 text-right">✓ You meet the score requirement!</p>
              )}
            </div>
          </div>

          {!isOwner && matchedSkills.length > 0 && (
            <div className={`mb-4 p-4 rounded-xl border ${matchScore >= (project.minMatchScore || 50) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-300" />
                  <p className="text-xs font-medium text-emerald-300">Your matching skills:</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Required: {project.minMatchScore || 50}%</span>
                  {matchScore >= (project.minMatchScore || 50) ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">✓ Eligible</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20">Below threshold</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <p className="text-xs text-slate-400 mr-2 self-center">Required skills:</p>
            {project.requiredSkills?.map((s) => (
              <span key={s.skillId} className="text-xs px-2.5 py-1.5 rounded-full border border-slate-700 bg-slate-900/70 text-slate-200">
                {s.name} <span className="text-slate-400">· weight {s.weight}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-1 border-b border-slate-700/80 mb-6 bg-slate-900/40 rounded-t-xl p-1">
          {projectTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-sm font-medium capitalize rounded-lg transition-colors ${
                tab === t ? 'text-[#fca5a5]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
              {tab === t && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#f87171] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-5 shadow-soft border border-slate-700/80">
                <h2 className="text-lg font-semibold text-white mb-2">Project Overview</h2>
                <p className="text-sm leading-6 text-slate-300">{project.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-4 border border-slate-700/80">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Owner</p>
                  <p className="mt-2 text-sm font-medium text-white">{project.ownerId?.name || 'Project owner'}</p>
                </div>
                <div className="glass-card rounded-2xl p-4 border border-slate-700/80">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Members</p>
                  <p className="mt-2 text-sm font-medium text-white">{project.members?.length || 0}</p>
                </div>
                <div className="glass-card rounded-2xl p-4 border border-slate-700/80">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Status</p>
                  <p className="mt-2 text-sm font-medium text-white">{project.status}</p>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'team' && (
            <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} variants={container} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.members.map((member) => {
                const memberId = String(member.userId?._id || member.userId || '');
                const memberName = member.userId?.name || member.name;
                const isCurrentUser = String(user?.id) === memberId;

                return (
                  <motion.div variants={item} key={memberId} className="glass-card hover-glow rounded-2xl p-4 shadow-soft border border-slate-700/80">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {member.userId?.avatarUrl ? (
                          <img src={member.userId.avatarUrl} alt={memberName} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#fbb4b4] text-[#7f1d1d] flex items-center justify-center font-display font-600 text-sm">
                            {memberName?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{memberName}</p>
                          <p className="text-xs text-slate-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {!isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => {
                            setChatTab('private');
                            setChatUserId(memberId);
                            setTab('chat');
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-[#f87171]/40 hover:text-[#fca5a5]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Message
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {tab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectChatPanel
                project={project}
                defaultMode={chatTab}
                defaultUserId={chatUserId}
              />
            </motion.div>
          )}

          {tab === 'recommendations' && (
            <motion.div key="rec" initial="hidden" animate="show" exit={{ opacity: 0 }} variants={container} className="space-y-3">
              {invitationError && <p role="alert" className="text-sm text-red-300">{invitationError}</p>}
              {isOwner && recommendations.length > 0 && (
                <motion.div variants={item} className="glass-card rounded-2xl p-5 shadow-soft border border-slate-700/80">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-[#f87171]" />
                    <h3 className="text-base font-semibold text-white">Bulk Invitations</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Project minimum score: <span className="text-[#fca5a5] font-medium">{project.minMatchScore || 50}%</span>. Send invitations to candidates with match score of at least <span className="text-[#fca5a5] font-medium">{minScore}%</span> or higher.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-slate-300">Adjust Score:</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="w-32 accent-[#f87171]"
                      />
                      <span className="text-sm font-medium text-[#fca5a5] min-w-[3rem]">{minScore}%</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {recommendations.filter((r) => r.matchScore >= minScore && !invitedIds.includes(r.student.id)).length} eligible candidates
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={sendBulkInvites}
                      disabled={bulkInviteLoading || recommendations.filter((r) => r.matchScore >= minScore && !invitedIds.includes(r.student.id)).length === 0}
                      className="text-sm font-medium px-4 py-2 rounded-xl bg-[#f87171] text-[#111827] hover:opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_8px_18px_rgba(248,113,113,0.22)] flex items-center gap-2"
                    >
                      {bulkInviteLoading ? 'Sending...' : <><Mail className="w-4 h-4" /> Send Bulk Invites</>}
                    </motion.button>
                  </div>
                  {bulkInviteSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-3 text-sm flex items-center gap-2 ${bulkInviteSuccess.count > 0 ? 'text-emerald-300' : 'text-[#fca5a5]'}`}
                    >
                      <Check className="w-4 h-4" />
                      {bulkInviteSuccess.message}
                    </motion.div>
                  )}
                </motion.div>
              )}
              {recommendations.length === 0 ? (
                <p className="text-sm text-slate-400">No matching candidates right now.</p>
              ) : (
                recommendations.map((r) => (
                  <motion.div
                    variants={item}
                    key={r.student.id}
                    className="glass-card hover-glow rounded-2xl p-4 shadow-soft border border-slate-700/80"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-display font-700 text-sm text-white"
                          style={{ background: `conic-gradient(#f87171 ${r.matchScore * 3.6}deg, #334155 0deg)` }}>
                          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-700">
                            {r.matchScore}%
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{r.student.name}</p>
                          <p className="text-xs text-slate-400">{r.student.branch} · Year {r.student.year}</p>
                        </div>
                      </div>
                      {isOwner && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          disabled={invitedIds.includes(r.student.id)}
                          onClick={() => invite(r.student.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-xl bg-[#f87171] text-[#111827] hover:opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_8px_18px_rgba(248,113,113,0.22)]"
                        >
                          {invitedIds.includes(r.student.id) ? 'Invited ✓' : 'Invite'}
                        </motion.button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {r.student.skills.slice(0, 4).map((s) => (
                        <span key={s.skillId} className="text-[11px] text-slate-300 flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                          {s.name} <SkillDots level={s.level} />
                        </span>
                      ))}
                    </div>
                    {r.breakdown && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700">
                          <p className="text-slate-400 mb-1">Skills</p>
                          <p className="font-medium text-white">{r.breakdown.skillScore}%</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700">
                          <p className="text-slate-400 mb-1">Workload</p>
                          <p className="font-medium text-white">{r.breakdown.workloadScore}%</p>
                          <p className="text-[10px] text-slate-500">{r.breakdown.activeTasks} active tasks</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700">
                          <p className="text-slate-400 mb-1">Available</p>
                          <p className="font-medium text-white">{r.breakdown.availabilityScore}%</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isOwner && (
                <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4">
                  <input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Task title..."
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
                  />
                  <input value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Description" className="px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]" />
                  <input value={taskForm.requiredSkill} onChange={(e) => setTaskForm({ ...taskForm, requiredSkill: e.target.value })} placeholder="Required skill" className="px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]" />
                  <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]" />
                  <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171] md:col-span-2"><option value="">Unassigned</option>{project.members.map((member) => <option key={member.userId?._id || member.userId} value={member.userId?._id || member.userId}>{member.userId?.name || member.name}</option>)}</select>
                  <button className="md:col-span-2 bg-[#f87171] text-[#111827] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#fb7185] transition-colors flex items-center justify-center gap-1.5 shadow-[0_10px_24px_rgba(248,113,113,0.2)]">
                    <Plus className="w-4 h-4" /> Add task
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statuses.map((s) => (
                  <div key={s} className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-[0.12em]">{statusLabel[s]}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {tasks.filter((t) => t.status === s).length}
                      </span>
                    </div>
                    <div className="space-y-2 min-h-[40px]">
                      <AnimatePresence>
                        {tasks.filter((t) => t.status === s).map((t) => (
                          <motion.div
                            key={t._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 shadow-soft"
                          >
                            <p className="text-sm font-medium text-white mb-1.5">{t.title}</p>
                            {t.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{t.description}</p>}
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                              <span>{t.assignedTo?.name || 'Unassigned'}</span>
                              {t.requiredSkill && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                  {t.requiredSkill}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                              {isOwner ? (
                                <select
                                  value={t.status}
                                  onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                                  className="text-xs border border-slate-700 rounded-lg px-2 py-1.5 w-full bg-slate-900 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#f87171]"
                                >
                                  {statuses.map((opt) => (
                                    <option key={opt} value={opt}>{statusLabel[opt]}</option>
                                  ))}
                                </select>
                              ) : t.status === 'PENDING_REVIEW' ? (
                                <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 w-full text-center">
                                  Pending Owner Review
                                </span>
                              ) : t.status !== 'COMPLETED' && (
                                <button
                                  type="button"
                                  onClick={() => updateTaskStatus(t._id, 'COMPLETED')}
                                  className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors w-full text-center font-medium"
                                >
                                  ✓ Mark as Completed
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'contributions' && (
            <motion.div key="contributions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-5 border border-slate-700/80">
                <h2 className="text-lg font-semibold text-white">GitHub Contributions</h2>
                <p className="text-sm text-slate-400 mt-1">Track team member contributions from GitHub repositories.</p>
              </div>
              <div className="glass-card rounded-2xl p-8 text-center border border-slate-700/80">
                <Github className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-sm text-slate-300 mb-4">View detailed contribution tracking with GitHub integration</p>
                <button
                  onClick={() => navigate(`/projects/${id}/contributions`)}
                  className="px-6 py-2 bg-[#f87171] text-[#111827] rounded-xl hover:bg-[#fb7185] transition-colors font-medium"
                >
                  Open Contribution Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-slate-700/80">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Project</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300">Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateProject}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#f87171] text-[#111827] hover:bg-[#fb7185] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-slate-700/80">
              <h2 className="text-xl font-semibold text-white mb-2">Delete Project</h2>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProject}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
};

export default ProjectDetail;
