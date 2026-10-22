import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getToken } from "../services/authService";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL.replace(
    /\/tasks\/?$/,
    ""
  );

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        // Get all projects
        const projectsResponse = await fetch(
          `${API_BASE_URL}/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const projectsData =
          await projectsResponse.json();

        if (!projectsResponse.ok) {
          throw new Error(
            projectsData.message ||
              "Failed to fetch project"
          );
        }

        const currentProject =
          projectsData.find(
            (item) =>
              item._id === projectId
          );

        if (!currentProject) {
          throw new Error(
            "Project not found"
          );
        }

        setProject(currentProject);

        // Get project members
        const membersResponse =
          await fetch(
            `${API_BASE_URL}/projects/${projectId}/members`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const membersData =
          await membersResponse.json();

        if (!membersResponse.ok) {
          throw new Error(
            membersData.message ||
              "Failed to fetch project members"
          );
        }

        setMembers(membersData);
      } catch (error) {
        console.error(
          "Project details error:",
          error
        );

        setError(
          error.message ||
            "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, API_BASE_URL]);

  if (loading) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <h3>
            Loading project...
          </h3>

          <p>
            Fetching project details.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <h3>
            Unable to load project
          </h3>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/projects")
            }
          >
            Back to Projects
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-content">

      {/* HEADER */}

      <div className="page-heading">

        <div>

          <button
            className="back-button"
            onClick={() =>
              navigate("/projects")
            }
          >
            ← Back to Projects
          </button>

          <p className="eyebrow">
            PROJECT
          </p>

          <h1>
            {project.name}
          </h1>

          <p>
            {project.description ||
              "No project description."}
          </p>

        </div>

      </div>


      {/* PROJECT SUMMARY */}

      <div className="project-summary-grid">

        <div className="project-summary-card">

          <span>
            Team
          </span>

          <strong>
            {project.teamId?.name ||
              "Team"}
          </strong>

        </div>


        <div className="project-summary-card">

          <span>
            Members
          </span>

          <strong>
            {members.length}
          </strong>

        </div>


        <div className="project-summary-card">

          <span>
            Status
          </span>

          <strong>
            {project.status}
          </strong>

        </div>

      </div>


      {/* MEMBERS */}

      <div className="project-section">

        <div className="project-section-header">

          <div>
            <p className="eyebrow">
              PROJECT TEAM
            </p>

            <h2>
              Members
            </h2>

            <p>
              Select a member to view
              their work on this project.
            </p>
          </div>

        </div>


        {members.length === 0 ? (
          <div className="empty-state">

            <h3>
              No project members
            </h3>

            <p>
              Add team members to this
              project to start assigning
              work.
            </p>

          </div>
        ) : (
          <div className="project-members-grid">

            {members.map((member) => (

              <div
                key={member.id}
                className="project-member-card"
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/members/${member.id}`
                  )
                }
                style={{
                  cursor: "pointer",
                }}
              >

                <div className="member-avatar">

                  {member.name
                    .substring(0, 1)
                    .toUpperCase()}

                </div>


                <div className="member-info">

                  <h3>
                    {member.name}
                  </h3>

                  <p>
                    {member.email}
                  </p>

                  <span>
                    {member.role}
                  </span>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </section>
  );
}

export default ProjectDetails;