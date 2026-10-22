import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace(
  /\/tasks\/?$/,
  ""
);

const PROJECT_ROLE_OPTIONS = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "member", label: "Member" },
];

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create project modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // Team members available for the project
  const [teamMembers, setTeamMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Selected project members
  const [selectedMembers, setSelectedMembers] = useState([]);

  // --------------------------------------------------
  // FETCH PROJECTS
  // --------------------------------------------------

  const fetchProjects = async () => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch projects"
      );
    }

    setProjects(data);
    return data;
  };

  // --------------------------------------------------
  // FETCH TEAMS
  // --------------------------------------------------

  const fetchTeams = async () => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/team`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch teams"
      );
    }

    setTeams(data);

    return data;
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          fetchProjects(),
          fetchTeams(),
        ]);
      } catch (loadError) {
        console.error("Projects page error:", loadError);

        setError(
          loadError.message ||
            "Failed to load projects."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --------------------------------------------------
  // FETCH TEAM MEMBERS
  // --------------------------------------------------

  const fetchTeamMembers = async (teamId) => {
    if (!teamId) {
      setTeamMembers([]);
      return;
    }

    try {
      setMembersLoading(true);
      setCreateError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/team/${teamId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch team members"
        );
      }

      setTeamMembers(data);
    } catch (memberError) {
      console.error(
        "Fetch team members error:",
        memberError
      );

      setTeamMembers([]);

      setCreateError(
        memberError.message ||
          "Failed to load team members."
      );
    } finally {
      setMembersLoading(false);
    }
  };

  // --------------------------------------------------
  // OPEN CREATE PROJECT
  // --------------------------------------------------

  const openCreateProject = () => {
    setProjectName("");
    setProjectDescription("");
    setSelectedMembers([]);
    setCreateError("");

    const firstTeam = teams[0];

    if (firstTeam) {
      setSelectedTeamId(String(firstTeam.id));
      fetchTeamMembers(firstTeam.id);
    } else {
      setSelectedTeamId("");
      setTeamMembers([]);
    }

    setCreateOpen(true);
  };

  // --------------------------------------------------
  // CLOSE CREATE PROJECT
  // --------------------------------------------------

  const closeCreateProject = () => {
    if (createLoading) {
      return;
    }

    setCreateOpen(false);
    setCreateError("");
  };

  // --------------------------------------------------
  // CHANGE TEAM
  // --------------------------------------------------

  const handleTeamChange = async (event) => {
    const teamId = event.target.value;

    setSelectedTeamId(teamId);
    setSelectedMembers([]);
    setTeamMembers([]);

    if (teamId) {
      await fetchTeamMembers(teamId);
    }
  };

  // --------------------------------------------------
  // ADD MEMBER TO PROJECT SELECTION
  // --------------------------------------------------

  const handleAddMember = (memberId) => {
    const member = teamMembers.find(
      (item) =>
        String(item.id) === String(memberId)
    );

    if (!member) {
      return;
    }

    const alreadySelected =
      selectedMembers.some(
        (item) =>
          String(item.userId) ===
          String(member.id)
      );

    if (alreadySelected) {
      return;
    }

    setSelectedMembers((current) => [
      ...current,
      {
        userId: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: "member",
      },
    ]);
  };

  // --------------------------------------------------
  // CHANGE SELECTED MEMBER ROLE
  // --------------------------------------------------

  const handleMemberRoleChange = (
    memberId,
    role
  ) => {
    setSelectedMembers((current) =>
      current.map((member) =>
        String(member.userId) ===
        String(memberId)
          ? {
              ...member,
              role,
            }
          : member
      )
    );
  };

  // --------------------------------------------------
  // REMOVE SELECTED MEMBER
  // --------------------------------------------------

  const handleRemoveMember = (memberId) => {
    setSelectedMembers((current) =>
      current.filter(
        (member) =>
          String(member.userId) !==
          String(memberId)
      )
    );
  };

  // --------------------------------------------------
  // CREATE PROJECT
  // --------------------------------------------------

  const handleCreateProject = async (event) => {
    event.preventDefault();

    if (!projectName.trim()) {
      setCreateError(
        "Project name is required."
      );
      return;
    }

    if (!selectedTeamId) {
      setCreateError(
        "Please select a team."
      );
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");

      const token = getToken();

      // ----------------------------------------------
      // CREATE PROJECT
      // ----------------------------------------------

      const projectResponse = await fetch(
        `${API_BASE_URL}/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: projectName.trim(),
            description:
              projectDescription.trim(),
            teamId: selectedTeamId,
          }),
        }
      );

      const projectData =
        await projectResponse.json();

      if (!projectResponse.ok) {
        throw new Error(
          projectData.message ||
            "Failed to create project."
        );
      }

      const createdProject =
        projectData.project;

      // ----------------------------------------------
      // ADD SELECTED MEMBERS
      // ----------------------------------------------

      if (
        createdProject &&
        selectedMembers.length > 0
      ) {
        for (
          const member of selectedMembers
        ) {
          const memberResponse =
            await fetch(
              `${API_BASE_URL}/projects/${createdProject._id}/members`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userId:
                    member.userId,
                  role: member.role,
                }),
              }
            );

          const memberData =
            await memberResponse.json();

          if (!memberResponse.ok) {
            throw new Error(
              memberData.message ||
                `Failed to add ${member.name} to the project.`
            );
          }
        }
      }

      // ----------------------------------------------
      // REFRESH PROJECTS
      // ----------------------------------------------

      await fetchProjects();

      // ----------------------------------------------
      // CLOSE MODAL
      // ----------------------------------------------

      setCreateOpen(false);

      setProjectName("");
      setProjectDescription("");
      setSelectedTeamId("");
      setTeamMembers([]);
      setSelectedMembers([]);

      // ----------------------------------------------
      // OPEN PROJECT DETAILS
      // ----------------------------------------------

      if (createdProject?._id) {
        navigate(
          `/projects/${createdProject._id}`
        );
      }
    } catch (createProjectError) {
      console.error(
        "Create project error:",
        createProjectError
      );

      setCreateError(
        createProjectError.message ||
          "Failed to create project."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // --------------------------------------------------
  // AVAILABLE MEMBERS
  // --------------------------------------------------

  const availableMembers =
    teamMembers.filter(
      (member) =>
        !selectedMembers.some(
          (selected) =>
            String(selected.userId) ===
            String(member.id)
        )
    );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              WORKSPACE
            </p>

            <h1>Projects</h1>

            <p>
              Loading your projects...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <section className="page-content">

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            WORKSPACE
          </p>

          <h1>Projects</h1>

          <p>
            Manage projects and see the
            people working on them.
          </p>
        </div>

        <button
          type="button"
          className="create-button"
          onClick={openCreateProject}
        >
          <span>+</span>
          Create Project
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* NO PROJECTS */}

      {!error &&
        projects.length === 0 && (
          <div className="empty-state">

            <h3>
              No projects yet
            </h3>

            <p>
              Create your first project
              to get started.
            </p>

            <button
              type="button"
              className="create-button"
              onClick={openCreateProject}
              style={{
                marginTop: "16px",
              }}
            >
              <span>+</span>
              Create Project
            </button>

          </div>
        )}

      {/* PROJECT GRID */}

      {!error &&
        projects.length > 0 && (
          <div className="projects-grid">

            {projects.map((project) => (
              <div
                className="project-card"
                key={project._id}
                onClick={() =>
                  navigate(
                    `/projects/${project._id}`
                  )
                }
                style={{
                  cursor: "pointer",
                }}
              >

                <div className="project-card-top">

                  <div className="project-avatar">
                    {project.name
                      ?.substring(0, 2)
                      .toUpperCase()}
                  </div>

                </div>

                <h2>
                  {project.name}
                </h2>

                <p>
                  {project.description ||
                    "No description"}
                </p>

                <div className="project-progress-info">

                  <span>
                    Team
                  </span>

                  <strong>
                    {project.teamId?.name ||
                      "Team"}
                  </strong>

                </div>

                <div className="project-progress-info">

                  <span>
                    Members
                  </span>

                  <strong>
                    {project.memberCount ||
                      0}
                  </strong>

                </div>

                <div className="project-card-footer">

                  <span>
                    <strong>
                      {project.status}
                    </strong>
                  </span>

                  <span>
                    Open →
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      {/* CREATE PROJECT MODAL */}

      {createOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateProject();
            }
          }}
        >

          <div className="task-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <p className="eyebrow">
                  WORKSPACE
                </p>

                <h2>
                  Create Project
                </h2>

                <p>
                  Create a project and
                  choose the people who
                  will work on it.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeCreateProject
                }
                disabled={
                  createLoading
                }
              >
                ×
              </button>

            </div>

            {/* MODAL ERROR */}

            {createError && (
              <div
                className="auth-error"
                style={{
                  margin:
                    "16px 24px 0",
                }}
              >
                {createError}
              </div>
            )}

            <form
              onSubmit={
                handleCreateProject
              }
            >

              {/* PROJECT NAME */}

              <div className="form-group">

                <label htmlFor="project-name">
                  Project Name
                </label>

                <input
                  id="project-name"
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(
                      event.target.value
                    )
                  }
                  disabled={
                    createLoading
                  }
                  autoFocus
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label htmlFor="project-description">
                  Description
                </label>

                <textarea
                  id="project-description"
                  rows="4"
                  placeholder="Describe what this project is about..."
                  value={
                    projectDescription
                  }
                  onChange={(event) =>
                    setProjectDescription(
                      event.target.value
                    )
                  }
                  disabled={
                    createLoading
                  }
                />

              </div>

              {/* TEAM */}

              <div className="form-group">

                <label htmlFor="project-team">
                  Team
                </label>

                <select
                  id="project-team"
                  value={
                    selectedTeamId
                  }
                  onChange={
                    handleTeamChange
                  }
                  disabled={
                    createLoading
                  }
                >

                  <option value="">
                    Select a team
                  </option>

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

              {/* TEAM MEMBERS */}

              {selectedTeamId && (
                <div className="form-group">

                  <label>
                    Add Members
                  </label>

                  {membersLoading ? (
                    <p
                      style={{
                        margin:
                          "8px 0",
                        color:
                          "#64748b",
                      }}
                    >
                      Loading team
                      members...
                    </p>
                  ) : teamMembers.length ===
                    0 ? (
                    <p
                      style={{
                        margin:
                          "8px 0",
                        color:
                          "#64748b",
                      }}
                    >
                      No active team
                      members found.
                    </p>
                  ) : (
                    <>
                      <select
                        value=""
                        onChange={(event) => {
                          if (
                            event.target
                              .value
                          ) {
                            handleAddMember(
                              event.target
                                .value
                            );
                          }
                        }}
                        disabled={
                          createLoading ||
                          availableMembers.length ===
                            0
                        }
                      >

                        <option value="">
                          {availableMembers.length >
                          0
                            ? "Select a team member..."
                            : "All team members added"}
                        </option>

                        {availableMembers.map(
                          (member) => (
                            <option
                              key={
                                member.id
                              }
                              value={
                                member.id
                              }
                            >
                              {member.name} —{" "}
                              {member.email}
                            </option>
                          )
                        )}

                      </select>

                      {/* SELECTED MEMBERS */}

                      {selectedMembers.length >
                        0 && (
                        <div
                          style={{
                            marginTop:
                              "14px",
                          }}
                        >

                          <p
                            style={{
                              fontSize:
                                "13px",
                              fontWeight:
                                "600",
                              marginBottom:
                                "8px",
                            }}
                          >
                            Project Members
                          </p>

                          <div
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              gap: "8px",
                            }}
                          >

                            {selectedMembers.map(
                              (member) => (
                                <div
                                  key={
                                    member.userId
                                  }
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "space-between",
                                    gap: "10px",
                                    padding:
                                      "10px 12px",
                                    border:
                                      "1px solid #e2e8f0",
                                    borderRadius:
                                      "10px",
                                  }}
                                >

                                  <div>
                                    <strong>
                                      {
                                        member.name
                                      }
                                    </strong>

                                    <div
                                      style={{
                                        fontSize:
                                          "12px",
                                        color:
                                          "#64748b",
                                      }}
                                    >
                                      {
                                        member.email
                                      }
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      gap: "8px",
                                    }}
                                  >

                                    <select
                                      value={
                                        member.role
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleMemberRoleChange(
                                          member.userId,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      disabled={
                                        createLoading
                                      }
                                    >

                                      {PROJECT_ROLE_OPTIONS.map(
                                        (
                                          option
                                        ) => (
                                          <option
                                            key={
                                              option.value
                                            }
                                            value={
                                              option.value
                                            }
                                          >
                                            {
                                              option.label
                                            }
                                          </option>
                                        )
                                      )}

                                    </select>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveMember(
                                          member.userId
                                        )
                                      }
                                      disabled={
                                        createLoading
                                      }
                                      style={{
                                        border:
                                          "none",
                                        background:
                                          "transparent",
                                        color:
                                          "#dc2626",
                                        cursor:
                                          "pointer",
                                        fontWeight:
                                          "600",
                                      }}
                                    >
                                      Remove
                                    </button>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    </>
                  )}

                </div>
              )}

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeCreateProject
                  }
                  disabled={
                    createLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={
                    createLoading ||
                    !projectName.trim() ||
                    !selectedTeamId
                  }
                >
                  {createLoading
                    ? "Creating..."
                    : "Create Project"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default Projects;