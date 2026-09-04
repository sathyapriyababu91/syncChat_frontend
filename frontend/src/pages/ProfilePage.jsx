import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profileService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();

      setProfile(data.user);
      setName(data.user.name || "");
      setBio(data.user.bio || "");

      if (data.user.profilePic) {
        // Changed localhost to Render live URL for production support
        const cleanPath = data.user.profilePic.startsWith("/") ? data.user.profilePic : `/${data.user.profilePic}`;
        setPreview(`https://syncchat-rfzq.onrender.com${cleanPath}`);
      }
    } catch (error) {
      console.log("Profile loading failed:", error);
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("bio", bio);

      if (photo) {
        formData.append("profilePic", photo);
      }

      const data = await updateProfile(formData);

      setProfile(data.user);

      if (data.user.profilePic) {
        const cleanPath = data.user.profilePic.startsWith("/") ? data.user.profilePic : `/${data.user.profilePic}`;
        setPreview(`https://syncchat-rfzq.onrender.com${cleanPath}`);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.log("Update profile failed:", error);

      alert(
        error.response?.data?.message ||
          "Profile update failed"
      );
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-violet-700 text-center mb-6">
          My Profile
        </h1>

        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-violet-600 text-white flex items-center justify-center text-4xl font-bold">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              name?.charAt(0).toUpperCase()
            )}
          </div>

          <label className="mt-3 text-violet-600 font-semibold cursor-pointer">
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <label className="block font-medium mb-1">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-violet-500"
        />

        {/* Email */}
        <label className="block font-medium mb-1">
          Email / Phone
        </label>
        <input
          value={profile.email || profile.phone || ""}
          disabled
          className="w-full border rounded-lg p-3 mb-4 bg-gray-100 text-gray-600"
        />

        {/* Bio */}
        <label className="block font-medium mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="About you..."
          rows="3"
          className="w-full border rounded-lg p-3 mb-5 outline-none focus:ring-2 focus:ring-violet-500"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Profile;