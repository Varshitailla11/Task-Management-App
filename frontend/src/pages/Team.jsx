import { useEffect, useState } from "react";

import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import CreateTeamModal from "../components/CreateTeamModal";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace(
  /\/tasks\/?$/,
  ""
);

const MEMBER_ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "admin", label: "Admin" },
];

function Team() {
  const { tasks } = useTasks();
  const { user } = useAuth();

  const currentUserId = user?.id
    ? String(user.id)
    : "";

  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);

  const [invitations, setInvitations] =
    useState([]);

  const [teamInvitations, setTeamInvitations] =
    useState([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Create team modal
  const [createOpen, setCreateOpen] =
    useState(false);

  const [createLoading, setCreateLoading] =
    useState(false);

  // Invite member modal
  const [inviteOpen, setInviteOpen] =
    useState(false);

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState("member");

  const [inviteLoading, setInviteLoading] =
    useState(false);

  const [inviteMessage, setInviteMessage] =
    useState("");

  const [acceptingInvitationId, setAcceptingInvitationId] =
    useState("");

  const [rejectingInvitationId, setRejectingInvitationId] =
    useState("");

  const [cancellingInvitationId, setCancellingInvitationId] =
    useState("");

  const [updatingMemberId, setUpdatingMemberId] =
    useState("");

  const [removingMemberId, setRemovingMemberId] =
    useState("");


  // Fetch teams
  const loadTeams = async () => {
    const data = await apiRequest(
      `${API_BASE_URL}/team`
    );

    setTeams(data);

    return data;
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await loadTeams();

        if (data.length > 0) {
          setSelectedTeamId(
            String(data[0].id)
          );
        }
      } catch (error) {
        console.error(
          "Failed to load teams:",
          error
        );

        setError(
          error.message ||
            "Failed to load teams."
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);


  // Fetch pending invitations addressed to the logged-in user
  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const data = await apiRequest(
          `${API_BASE_URL}/team-invitations`
        );

        setInvitations(data);
      } catch (error) {
        console.error(
          "Failed to load invitations:",
          error
        );
      }
    };

    loadInvitations();
  }, []);


  const selectedTeam = teams.find(
    (team) =>
      String(team.id) ===
      String(selectedTeamId)
  );

  const canManage =
    Boolean(selectedTeam) &&
    (selectedTeam.role === "owner" ||
      selectedTeam.role === "admin");


  // Fetch members whenever selected team changes
  useEffect(() => {
    if (!selectedTeamId) {
      setMembers([]);
      return;
    }

    const loadMembers = async () => {
      try {
        setError("");

        const data = await apiRequest(
          `${API_BASE_URL}/team/${selectedTeamId}/members`
        );

        setMembers(data);
      } catch (error) {
        console.error(
          "Failed to load team members:",
          error
        );

        setError(
          error.message ||
            "Failed to load team members."
        );

        setMembers([]);
      }
    };

    loadMembers();
  }, [selectedTeamId]);


  // Fetch this team's outstanding sent invitations (owner/admin only)
  useEffect(() => {
    if (!selectedTeamId || !canManage) {
      setTeamInvitations([]);
      return;
    }

    const loadTeamInvitations = async () => {
      try {
        const data = await apiRequest(
          `${API_BASE_URL}/team-invitations/team/${selectedTeamId}`
        );

        setTeamInvitations(data);
      } catch (error) {
        console.error(
          "Failed to load team invitations:",
          error
        );

        setTeamInvitations([]);
      }
    };

    loadTeamInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId, canManage]);


  const getMemberStats = (member) => {
    const memberTasks = tasks.filter(
      (task) =>
        task.assignee === member.name
    );

    const completed = memberTasks.filter(
      (task) =>
        task.status === "completed" ||
        task.status === "Completed"
    ).length;

    const completion =
      memberTasks.length > 0
        ? Math.round(
            (completed /
              memberTasks.length) *
              100
          )
        : 0;

    return {
      taskCount: memberTasks.length,
      completion,
    };
  };


  /* =====================================================
     CREATE TEAM
  ===================================================== */

  const openCreateModal = () => {
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (createLoading) {
      return;
    }

    setCreateOpen(false);
  };

  const handleCreateTeam = async (name) => {
    setCreateLoading(true);

    try {
      const newTeam = await apiRequest(
        `${API_BASE_URL}/team`,
        {
          method: "POST",
          body: JSON.stringify({ name }),
        }
      );

      const updatedTeams = await loadTeams();

      const createdId =
        newTeam?._id || newTeam?.id;

      if (createdId) {
        setSelectedTeamId(String(createdId));
      } else if (updatedTeams.length > 0) {
        setSelectedTeamId(
          String(
            updatedTeams[
              updatedTeams.length - 1
            ].id
          )
        );
      }

      setCreateOpen(false);
    } finally {
      setCreateLoading(false);
    }
  };


  /* =====================================================
     INVITE MEMBER
  ===================================================== */

  const openInviteModal = () => {
    setInviteEmail("");
    setInviteRole("member");
    setInviteMessage("");
    setInviteOpen(true);
  };

  const closeInviteModal = () => {
    if (inviteLoading) {
      return;
    }

    setInviteOpen(false);
    setInviteMessage("");
  };

  const refreshTeamInvitations = async () => {
    if (!selectedTeamId || !canManage) {
      return;
    }

    try {
      const data = await apiRequest(
        `${API_BASE_URL}/team-invitations/team/${selectedTeamId}`
      );

      setTeamInvitations(data);
    } catch (error) {
      console.error(
        "Failed to refresh team invitations:",
        error
      );
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();

    if (!selectedTeamId) {
      return;
    }

    if (!inviteEmail.trim()) {
      setInviteMessage(
        "Please enter an email address."
      );
      return;
    }

    try {
      setInviteLoading(true);
      setInviteMessage("");

      const response =
        await apiRequest(
          `${API_BASE_URL}/team-invitations/${selectedTeamId}/invite`,
          {
            method: "POST",
            body: JSON.stringify({
              email:
                inviteEmail.trim(),
              role: inviteRole,
            }),
          }
        );

      setInviteMessage(
        response.message ||
          "Invitation sent successfully."
      );

      setInviteEmail("");
      setInviteRole("member");

      await refreshTeamInvitations();
    } catch (error) {
      console.error(
        "Failed to send invitation:",
        error
      );

      setInviteMessage(
        error.message ||
          "Failed to send invitation."
      );
    } finally {
      setInviteLoading(false);
    }
  };


  /* =====================================================
     ACCEPT / REJECT MY INVITATIONS
  ===================================================== */

  const handleAcceptInvitation = async (
    invitationId
  ) => {
    try {
      setAcceptingInvitationId(
        invitationId
      );
      setError("");

      await apiRequest(
        `${API_BASE_URL}/team-invitations/${invitationId}/accept`,
        {
          method: "POST",
        }
      );

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            String(invitation.id) !==
            String(invitationId)
        )
      );

      const updatedTeams =
        await loadTeams();

      if (updatedTeams.length > 0) {
        setSelectedTeamId(
          String(updatedTeams[0].id)
        );
      }
    } catch (error) {
      console.error(
        "Failed to accept invitation:",
        error
      );

      setError(
        error.message ||
          "Failed to accept invitation."
      );
    } finally {
      setAcceptingInvitationId("");
    }
  };

  const handleRejectInvitation = async (
    invitationId
  ) => {
    try {
      setRejectingInvitationId(
        invitationId
      );
      setError("");

      await apiRequest(
        `${API_BASE_URL}/team-invitations/${invitationId}/reject`,
        {
          method: "POST",
        }
      );

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            String(invitation.id) !==
            String(invitationId)
        )
      );
    } catch (error) {
      console.error(
        "Failed to decline invitation:",
        error
      );

      setError(
        error.message ||
          "Failed to decline invitation."
      );
    } finally {
      setRejectingInvitationId("");
    }
  };


  /* =====================================================
     CANCEL A SENT INVITATION (owner/admin)
  ===================================================== */

  const handleCancelInvitation = async (
    invitationId
  ) => {
    try {
      setCancellingInvitationId(
        invitationId
      );
      setError("");

      await apiRequest(
        `${API_BASE_URL}/team-invitations/${invitationId}`,
        {
          method: "DELETE",
        }
      );

      setTeamInvitations((current) =>
        current.filter(
          (invitation) =>
            String(invitation.id) !==
            String(invitationId)
        )
      );
    } catch (error) {
      console.error(
        "Failed to cancel invitation:",
        error
      );

      setError(
        error.message ||
          "Failed to cancel invitation."
      );
    } finally {
      setCancellingInvitationId("");
    }
  };


  /* =====================================================
     MEMBER MANAGEMENT (owner/admin)
  ===================================================== */

  const handleRoleChange = async (
    memberUserId,
    newRole
  ) => {
    try {
      setUpdatingMemberId(memberUserId);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/team/${selectedTeamId}/members/${memberUserId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      setMembers((current) =>
        current.map((member) =>
          String(member.id) ===
          String(memberUserId)
            ? { ...member, role: newRole }
            : member
        )
      );
    } catch (error) {
      console.error(
        "Failed to update member role:",
        error
      );

      setError(
        error.message ||
          "Failed to update member role."
      );
    } finally {
      setUpdatingMemberId("");
    }
  };

  const handleRemoveMember = async (
    memberUserId,
    memberName
  ) => {
    const confirmed = window.confirm(
      `Remove ${memberName} from ${selectedTeam?.name || "this team"}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMemberId(memberUserId);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/team/${selectedTeamId}/members/${memberUserId}`,
        {
          method: "DELETE",
        }
      );

      setMembers((current) =>
        current.filter(
          (member) =>
            String(member.id) !==
            String(memberUserId)
        )
      );
    } catch (error) {
      console.error(
        "Failed to remove member:",
        error
      );

      setError(
        error.message ||
          "Failed to remove member."
      );
    } finally {
      setRemovingMemberId("");
    }
  };


  if (loading) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              COLLABORATION
            </p>

            <h1>Team</h1>

            <p>
              Loading your workspace...
            </p>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="page-content">

      {/* PAGE HEADER */}
      <div className="page-heading">

        <div>
          <p className="eyebrow">
            COLLABORATION
          </p>

          <h1>Team</h1>

          <p>
            Manage your workspace members
            and their productivity.
          </p>
        </div>

        <div className="team-header-actions">

          {teams.length > 0 && (
            <div className="team-selector">

              <label htmlFor="team-select">
                Workspace
              </label>

              <select
                id="team-select"
                value={selectedTeamId}
                onChange={(event) =>
                  setSelectedTeamId(
                    event.target.value
                  )
                }
              >
                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>

            </div>
          )}

          {teams.length > 0 &&
            canManage && (
              <button
                type="button"
                className="create-button"
                onClick={
                  openInviteModal
                }
              >
                <span>+</span>
                Invite Member
              </button>
            )}

          <button
            type="button"
            className="create-button"
            onClick={openCreateModal}
          >
            <span>+</span>
            Create Team
          </button>

        </div>

      </div>


      {/* ERROR */}
      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {/* PENDING INVITATIONS ADDRESSED TO ME */}
      {invitations.length > 0 && (
        <div className="team-invitations-section">

          <div className="section-heading">

            <div>
              <p className="eyebrow">
                INVITATIONS
              </p>

              <h2>
                Pending Invitations
              </h2>
            </div>

          </div>


          <div className="invitation-list">

            {invitations.map(
              (invitation) => (
                <div
                  className="invitation-card"
                  key={invitation.id}
                >

                  <div className="invitation-info">

                    <div className="member-avatar">
                      {invitation.teamName
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "T"}
                    </div>

                    <div>

                      <h3>
                        {invitation.teamName}
                      </h3>

                      <p>
                        Invited by{" "}
                        <strong>
                          {
                            invitation.invitedBy
                          }
                        </strong>
                      </p>

                      <span>
                        Role:{" "}
                        {invitation.role}
                      </span>

                    </div>

                  </div>


                  <div className="invitation-actions">

                    <button
                      type="button"
                      className="pill-button decline"
                      onClick={() =>
                        handleRejectInvitation(
                          invitation.id
                        )
                      }
                      disabled={
                        acceptingInvitationId ===
                          invitation.id ||
                        rejectingInvitationId ===
                          invitation.id
                      }
                    >
                      {rejectingInvitationId ===
                      invitation.id
                        ? "Declining..."
                        : "Decline"}
                    </button>

                    <button
                      type="button"
                      className="pill-button accept"
                      onClick={() =>
                        handleAcceptInvitation(
                          invitation.id
                        )
                      }
                      disabled={
                        acceptingInvitationId ===
                          invitation.id ||
                        rejectingInvitationId ===
                          invitation.id
                      }
                    >
                      {acceptingInvitationId ===
                      invitation.id
                        ? "Accepting..."
                        : "Accept Invitation"}
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}


      {/* OUTSTANDING INVITATIONS SENT BY THIS TEAM */}
      {canManage &&
        teamInvitations.length > 0 && (
          <div className="team-invitations-section">

            <div className="section-heading">

              <div>
                <p className="eyebrow">
                  OUTSTANDING
                </p>

                <h2>
                  Invitations Sent
                </h2>
              </div>

            </div>


            <div className="invitation-list">

              {teamInvitations.map(
                (invitation) => (
                  <div
                    className="invitation-card"
                    key={invitation.id}
                  >

                    <div className="invitation-info">

                      <div className="member-avatar">
                        {invitation.email
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "?"}
                      </div>

                      <div>

                        <h3>
                          {invitation.email}
                        </h3>

                        <p>
                          Invited by{" "}
                          <strong>
                            {
                              invitation.invitedBy
                            }
                          </strong>
                        </p>

                        <span>
                          Role:{" "}
                          {invitation.role}
                        </span>

                      </div>

                    </div>


                    <div className="invitation-actions">

                      <button
                        type="button"
                        className="pill-button decline"
                        onClick={() =>
                          handleCancelInvitation(
                            invitation.id
                          )
                        }
                        disabled={
                          cancellingInvitationId ===
                          invitation.id
                        }
                      >
                        {cancellingInvitationId ===
                        invitation.id
                          ? "Cancelling..."
                          : "Cancel Invite"}
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>
        )}


      {/* TEAM CONTENT */}
      {teams.length === 0 ? (

        <div className="empty-state">

          <h2>
            No teams yet
          </h2>

          <p>
            {invitations.length > 0
              ? "You have a pending invitation above, or create your own team below."
              : "Create a team to start collaborating with others."}
          </p>

          <button
            type="button"
            className="create-button"
            onClick={openCreateModal}
            style={{ marginTop: "16px" }}
          >
            <span>+</span>
            Create Team
          </button>

        </div>

      ) : members.length === 0 ? (

        <div className="empty-state">

          <h2>
            No members found
          </h2>

          <p>
            This team currently has no
            active members.
          </p>

        </div>

      ) : (

        <div className="team-grid">

          {members.map((member) => {

            const stats =
              getMemberStats(member);

            const initial =
              member.name
                ?.charAt(0)
                ?.toUpperCase() || "?";

            const isSelf =
              String(member.id) ===
              currentUserId;

            const isOwnerRow =
              member.role === "owner";

            const canManageThisMember =
              canManage &&
              !isSelf &&
              !isOwnerRow;

            return (
              <div
                className="member-card"
                key={member.id}
              >

                <div className="member-top">

                  <div className="member-avatar">
                    {initial}
                  </div>

                </div>

                <h2>
                  {member.name}
                  {isSelf ? " (You)" : ""}
                </h2>

                <span className="member-role">
                  {member.role}
                </span>

                <p className="member-email">
                  {member.email}
                </p>

                <div className="member-stats">

                  <div>

                    <strong>
                      {stats.taskCount}
                    </strong>

                    <span>
                      Tasks
                    </span>

                  </div>

                  <div>

                    <strong>
                      {stats.completion}%
                    </strong>

                    <span>
                      Completed
                    </span>

                  </div>

                </div>

                <div className="progress-bar">

                  <div
                    style={{
                      width: `${stats.completion}%`,
                    }}
                  />

                </div>

                {canManageThisMember && (
                  <div className="member-card-actions">

                    <select
                      className="member-role-select"
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(
                          member.id,
                          event.target.value
                        )
                      }
                      disabled={
                        updatingMemberId ===
                          member.id ||
                        removingMemberId ===
                          member.id
                      }
                    >
                      {MEMBER_ROLE_OPTIONS.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      className="remove-member-button"
                      onClick={() =>
                        handleRemoveMember(
                          member.id,
                          member.name
                        )
                      }
                      disabled={
                        updatingMemberId ===
                          member.id ||
                        removingMemberId ===
                          member.id
                      }
                    >
                      {removingMemberId ===
                      member.id
                        ? "Removing..."
                        : "Remove"}
                    </button>

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}


      {/* CREATE TEAM MODAL */}
      {createOpen && (
        <CreateTeamModal
          onClose={closeCreateModal}
          onCreate={handleCreateTeam}
          loading={createLoading}
        />
      )}


      {/* INVITE MEMBER MODAL */}
      {inviteOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeInviteModal();
            }
          }}
        >

          <div className="task-modal">

            <div className="modal-header">

              <div>

                <p className="eyebrow">
                  TEAM
                </p>

                <h2>
                  Invite Member
                </h2>

                <p>
                  Invite someone to join{" "}
                  <strong>
                    {selectedTeam?.name}
                  </strong>
                  .
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeInviteModal
                }
                disabled={inviteLoading}
              >
                ×
              </button>

            </div>


            {inviteMessage && (
              <div
                className="auth-error"
                style={{
                  margin: "16px 24px 0",
                }}
              >
                {inviteMessage}
              </div>
            )}


            <form
              onSubmit={handleInvite}
            >

              <div className="form-group">

                <label htmlFor="invite-email">
                  Email
                </label>

                <input
                  id="invite-email"
                  type="email"
                  placeholder="Enter member's email"
                  value={inviteEmail}
                  onChange={(event) =>
                    setInviteEmail(
                      event.target.value
                    )
                  }
                  required
                  disabled={inviteLoading}
                />

              </div>


              <div className="form-group">

                <label htmlFor="invite-role">
                  Role
                </label>

                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(
                      event.target.value
                    )
                  }
                  disabled={inviteLoading}
                >

                  <option value="member">
                    Member
                  </option>

                  <option value="developer">
                    Developer
                  </option>

                  <option value="designer">
                    Designer
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                </select>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeInviteModal
                  }
                  disabled={inviteLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={inviteLoading}
                >
                  {inviteLoading
                    ? "Sending..."
                    : "Send Invitation"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default Team;