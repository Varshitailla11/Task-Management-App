import { useState } from "react";

function CreateTeamModal({
  onClose,
  onCreate,
  loading,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleOverlayClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !loading
    ) {
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    setError("");

    try {
      await onCreate(name.trim());
    } catch (submitError) {
      setError(
        submitError.message ||
          "Failed to create team."
      );
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div className="task-modal">

        <div className="modal-header">

          <div>
            <p className="eyebrow">TEAM</p>

            <h2>Create Team</h2>

            <p>
              Start a new workspace to
              collaborate with others.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>

        {error && (
          <div
            className="auth-error"
            style={{ margin: "16px 24px 0" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="team-name">
              Team Name
            </label>

            <input
              id="team-name"
              type="text"
              placeholder="e.g. Frontend Team"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Team"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateTeamModal;