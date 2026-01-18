import { Link, useNavigate } from "react-router-dom";
import styles from "./EditProfile.module.css";
import { IoClose } from "react-icons/io5";
import { useUserStore } from "../../stores/userStore";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { uploadProfileChanges } from "../../api/editProfile";
import { useAuthStore } from "../../stores/authStore";
import { Toast } from "../../stores/toastStore";
import { AuthError } from "../../errors/AuthError";

interface newUserInformation {
  fullName: string;
  bio: string;
  avatarFile: File | null;
}

const EditProfile = () => {
  const signInState = useAuthStore((state) => state.signInState);
  const userInformation = useUserStore((state) => state.userInformation);
  const navigate = useNavigate();

  const [newUserInformation, setNewUserInformation] = useState<newUserInformation>({
    fullName: userInformation.fullName,
    bio: userInformation.bio || "",
    avatarFile: null,
  });

  const handleUserProfileImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewUserInformation((prev) => ({
        ...prev,
        avatarFile: file,
      }));
    }
  }, []);

  const handleSubmission = async () => {
    try {
      await uploadProfileChanges(newUserInformation);

      Toast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile changes have been saved successfully.",
      });
      useUserStore.getState().fetchUserInfo();
      navigate("/profile");
    } catch (error) {
      if (error instanceof AuthError && error.status === 401) {
        await useAuthStore.getState().requestNewAccessToken();
        try {
          await uploadProfileChanges(newUserInformation);

          Toast({
            type: "success",
            title: "Profile Updated",
            message: "Your profile changes have been saved successfully.",
          });

          useUserStore.getState().fetchUserInfo();
          navigate("/profile");
        } catch (secondError) {
          Toast({
            type: "error",
            title: "Upload Error",
            message: "You aren't signed in. Please sign in again",
          });
        }
      } else {
        Toast({
          type: "error",
          title: "Upload Error",
          message: "Error uploading profile changes. Please try again later",
        });
      }
    }
  };

  const previewURL = useMemo(() => {
    return newUserInformation.avatarFile
      ? URL.createObjectURL(newUserInformation.avatarFile)
      : userInformation.avatarUrl;
  }, [newUserInformation.avatarFile, userInformation.avatarUrl]);

  const handleRevert = useCallback(() => {
    setNewUserInformation({
      fullName: userInformation.fullName,
      bio: userInformation.bio || "",
      avatarFile: null,
    });
  }, [userInformation]);

  useEffect(() => {
    return () => {
      // Revoke the object URL to avoid memory leaks
      if (previewURL && previewURL.startsWith("blob:")) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL, newUserInformation.avatarFile]);

  useEffect(() => {
    if (signInState !== "authorized") {
      navigate("/profile");
    }
  }, [signInState]);

  return (
    signInState === "authorized" && (
      <div className={styles["edit-profile-page"]}>
        <header className={styles["header"]}>
          <h1>Edit Profile</h1>
          <Link to="/profile" className={styles["return-btn"]}>
            <IoClose className={styles["return-btn-icon"]} />
          </Link>
        </header>
        <main className={styles["content"]}>
          <section className={styles["edit-section"]}>
            <h2>Profile Image</h2>
            <input
              className={styles["input"]}
              type="file"
              accept="image/*"
              onChange={handleUserProfileImage}
            />
            <img src={previewURL} className={styles["preview-profile-image"]} />
          </section>

          <div className={styles["divider"]}>•</div>

          <section className={styles["edit-section"]}>
            <h2>Full Name</h2>
            <input
              value={newUserInformation.fullName}
              className={styles["input"]}
              type="text"
              placeholder="Enter display name..."
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewUserInformation((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </section>

          <div className={styles["divider"]}>•</div>

          <section className={styles["edit-section"]}>
            <h2>Bio</h2>
            <textarea
              value={newUserInformation.bio}
              className={`${styles["input"]} ${styles["bio-input"]}`}
              placeholder="Enter bio..."
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setNewUserInformation((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </section>

          <section className={styles["action-section"]}>
            <button className={styles["revert-button"]} onClick={handleRevert}>
              Revert
            </button>
            <button className={styles["save-button"]} onClick={handleSubmission}>
              Save Changes
            </button>
          </section>
        </main>
      </div>
    )
  );
};

export default EditProfile;
