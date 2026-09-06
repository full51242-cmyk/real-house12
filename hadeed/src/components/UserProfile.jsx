import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";
import "./UserProfile.css";

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
const DEFAULT_PHONE = "+92 1234589";

const UserProfile = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const userData = JSON.parse(storedUser);
        return {
          name: userData.name || "bhalu",
          email: userData.email || "",
          phone: userData.phone && userData.phone.trim() !== "" ? userData.phone : DEFAULT_PHONE,
          photo: userData.avatar || DEFAULT_PHOTO
        };
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }

    return {
      name: "bhalu",
      email: "",
      phone: DEFAULT_PHONE,
      photo: DEFAULT_PHOTO
    };
  });
  const navigate = useNavigate();

  const handleEditProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await authAPI.deleteAccount();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
      window.alert("Unable to delete your account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="user-profile">
      <button
        type="button"
        className="user-profile-button"
        aria-expanded={isOpen}
        aria-label="Open user profile menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <img className="user-avatar" src={user.photo} alt={`${user.name}'s avatar`} />
        <span className="user-name">{user.name}</span>
        <span className="dropdown-icon" aria-hidden="true">⌄</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <img
              className="dropdown-avatar"
              src={user.photo}
              alt={`${user.name}'s avatar`}
            />
            <div className="dropdown-user-info">
              <h4>{user.name}</h4>
              <p>{user.email || "No email available"}</p>
            </div>
          </div>

          <div className="user-dropdown-body">
            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">✉</span>
              <span>{user.email || "No email available"}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">☎</span>
              <span>{user.phone}</span>
            </div>
          </div>

          <div className="user-dropdown-footer">
            <button type="button" className="dropdown-btn" onClick={handleEditProfile}>
              View Profile
            </button>
            <button type="button" className="dropdown-btn" onClick={handleLogout}>
              Logout
            </button>
            <button
              type="button"
              className="dropdown-btn dropdown-btn-delete"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default UserProfile;