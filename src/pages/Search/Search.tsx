import styles from "./Search.module.css";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { useEffect, useState } from "react";

const Search = () => {
  const navigate = useNavigate();

  // State to manage transition animation
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSearchQuery("");
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchQuery.trim() === "") return;

    navigate(`/search/results?&query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className={styles["search-page"]}>
      <div className={styles["search-container"]}>
        <h1 className={styles["search-title"]}>User Search</h1>

        <div className={`${styles["search-input-container"]}`}>
          <form className={styles["search-form"]} onSubmit={handleFormSubmit}>
            <input
              type="text"
              className={styles["search-input"]}
              value={searchQuery}
              onChange={(e) => {
                handleInputChange(e);
              }}
            />
            <button type="submit" className={styles["search-input-btn"]}>
              <IoSearch className={styles["search-input-btn-icon"]} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Search;
