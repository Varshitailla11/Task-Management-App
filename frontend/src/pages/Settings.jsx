
import { useState } from "react";
import {
  UserRound,
  Palette,
  Bell,
  ShieldCheck,
  Save,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState("light");

  const tabs = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your account and personalize your workspace.</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-menu">
          <h3>GENERAL</h3>

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`settings-tab ${
                  activeTab === tab.id ? "selected" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <section className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-section">
              <h2>Profile information</h2>
              <p>Manage your personal account details.</p>

              <div className="settings-form">
                <label>
                  Full name
                  <input type="text" placeholder="Your full name" />
                </label>

                <label>
                  Email address
                  <input type="email" placeholder="Your email address" />
                </label>

                <label>
                  About
                  <textarea placeholder="Write something about yourself..." />
                </label>

                <button className="settings-save">
                  <Save size={16} />
                  Save changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <p>Choose how TaskFlow looks on your device.</p>

              <div className="theme-options">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.id}
                      className={`theme-option ${
                        theme === option.id ? "chosen" : ""
                      }`}
                      onClick={() => setTheme(option.id)}
                    >
                      <Icon size={22} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-section">
              <h2>Notifications</h2>
              <p>Choose which updates you want to receive.</p>

              {[
                "Task assignments",
                "Task deadlines and reminders",
                "Project updates",
                "Team invitations",
                "Comments and mentions",
              ].map((item) => (
                <label className="notification-option" key={item}>
                  <span>{item}</span>
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <h2>Security</h2>
              <p>Keep your TaskFlow account secure.</p>

              <div className="settings-form">
                <label>
                  Current password
                  <input type="password" placeholder="Current password" />
                </label>

                <label>
                  New password
                  <input type="password" placeholder="New password" />
                </label>

                <label>
                  Confirm new password
                  <input type="password" placeholder="Confirm new password" />
                </label>

                <button className="settings-save">
                  <ShieldCheck size={16} />
                  Update password
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Settings;
