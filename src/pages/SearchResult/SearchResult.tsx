import React, { Fragment, useEffect, useState } from "react";
import styles from "./SearchResult.module.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatConsoleError } from "../../consoleError";
import { FaCircleUser } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";

interface searchUserType {
  userId: string;
  displayName: string;
  username: string;
  userImgUrl: string;
  bio: string;
}

const SearchResult = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const category = searchParams.get("category") || "post";

  const [inputQuery, setInputQuery] = useState<string>(searchQuery);
  const [searchPage, setSearchPage] = useState<number>(1);
  const [searchUserResults, setSearchUserResults] = useState<searchUserType[]>([]);

  const fetchTrigger = React.useRef<HTMLDivElement | null>(null);
  const fetchResulsts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/results?category=${encodeURIComponent(
          category
        )}&query=${encodeURIComponent(searchQuery)}&page=${searchPage}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch search results");

      const data = await res.json();

      setSearchUserResults(
        searchPage === 1 ? data.data || [] : [...searchUserResults, ...(data.results || [])]
      );
    } catch (error) {
      setSearchUserResults([]);
      formatConsoleError("SearchResult", "useEffect-fetchResults", error);
    }
  };

  useEffect(() => {
    fetchResulsts();
  }, [searchQuery, category]);

  useEffect(() => {
    const postObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting) {
          postObserver.disconnect();

          setSearchPage((prev) => prev + 1);
          fetchResulsts();
        }
      },
      { threshold: 0.5 } //half of the reference is needed to trigger observer
    );

    if (fetchTrigger.current) postObserver.observe(fetchTrigger.current);

    return () => {
      if (postObserver) postObserver.disconnect();
    };
  }, [searchUserResults.length, category]); // End of

  const handleNewParams = (category: string, query: string) => {
    setSearchPage(1);
    setSearchUserResults([]);
    fetchResulsts();

    setSearchParams({
      category: category,
      query: query,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuery(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleNewParams(category, inputQuery);
  };

  return (
    <div className={styles["search-page"]}>
      <main className={styles["content"]}>
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

        <div className={styles["search-results-header"]}>
          <div className={styles["search-result-count"]}>
            {searchUserResults && searchUserResults.length > 0 ? searchUserResults.length : 0}
            &nbsp;results found
          </div>
        </div>

        <div className={styles["search-results-container"]}>
          {searchUserResults && searchUserResults.length > 0
            ? searchUserResults.map(({ userId, displayName, username, userImgUrl, bio }, index) => (
                <Fragment key={userId}>
                  <button
                    className={`${styles["card-item"]}`}
                    onClick={() => {
                      navigate(`/user/${userId}`);
                    }}
                  >
                    {userImgUrl ? (
                      <div
                        className={styles["card-author-logo"]}
                        style={{ backgroundImage: `url(${userImgUrl})` }}
                      />
                    ) : (
                      <FaCircleUser className={styles["card-author-logo"]} />
                    )}

                    <div className={styles["user-info"]}>
                      <h2 className={styles["display-name"]}>{displayName}</h2>
                      <h3 className={styles["username"]}>@{username}</h3>
                      <p className={styles["user-bio"]}>{bio}</p>
                    </div>
                  </button>
                  {index === searchUserResults.length - 4 ? (
                    <div ref={fetchTrigger} style={{ lineHeight: "0" }} />
                  ) : null}
                </Fragment>
              ))
            : null}
        </div>
      </main>
    </div>
  );
};

export default SearchResult;
