import styles from "./Home.module.css";
import type { GameInfo } from "../../types/AdminPanel/gameManagement.types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  FaChevronCircleLeft, 
  FaChevronCircleRight, 
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaRegCommentDots, 
  FaPaperPlane 
} from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { fetchWithAuth } from "../../api/fetchWithAuth";


interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
}

interface gameMenuType extends Omit<GameInfo, "status" | "boardSize"> {
  link: string;
  art: string;
}

const colorMap: { [key: string]: string } = {
  R: "red", G: "green", B: "blue", Y: "yellow", P: "purple", O: "orange", C: "cyan", M: "magenta", I: "pink",
};

const gameMenu: gameMenuType[] = [
  {
    gameId: "1",
    title: "Caro 5",
    description: "Match 5 in a row",
    link: "/game/caro-5",
    art: 
      `
        RR...RRYYY
        RRR.RRRY..
        .RRRRR.YYY
        ..RRRBBB.Y
        .RRRBBBYYY
        RRRBBBRBBB
        RR.BBRR.BB
        ...BBB.BBB
        ....BBBBB.
        .....BBB..
      `,
  },
  {
    gameId: "2",
    title: "Caro 4",
    description: "Match 4 in a row",
    link: "/game/caro-4",
    art: 
      `
        RR...RRY.Y
        RRR.RRRY.Y
        .RRRRR.YYY
        ..RRRBBB.Y
        .RRRBBBBBY
        RRRBBBRBBB
        RR.BBRR.BB
        ...BBB.BBB
        ....BBBBB.
        .....BBB..
      `,
  },
  {
    gameId: "3",
    title: "Tic Tac Toe",
    description: "Classic 3x3 grid game",
    link: "/game/tic-tac-toe",
    art:
      `
        ..........
        ...Y..Y...
        ...Y..Y...
        .YYYYYYYY.
        ...Y..Y...
        ...Y..Y...
        .YYYYYYYY.
        ...Y..Y...
        ...Y..Y...
        ..........
      `,
  },
  {
    gameId: "4",
    title: "Snake",
    description: "Control the snake to eat food",
    link: "/game/snake",
    art: 
      `
        ..........
        .GGGGGGGG.
        .G......G.
        .G.GY.R.G.
        .G.G....G.
        .G.G....G.
        .G.GGGGGG.
        .G........
        .GGGGGGGG.
        ..........
      `,

  },
  {
    gameId: "5",
    title: "Match 3",
    description: "Match 3 or more items to score points",
    link: "/game/match-3",
    art: 
     `
      ..........
      ..PP..RR..
      ..PP..RR..
      ..........
      ....RRGG..
      ....RRGG..
      ..........
      ..BB..RR..
      ..BB..RR..
      ..........
    `,
  },
  {
    gameId: "6",
    title: "Memory Matching",
    description: "Find pairs of matching cards",
    link: "/game/memory-matching",
    art: 
    `
        ..........
        .CCCCC....
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        ....BBBBB.
        ..........
      `,
  },
  {
    gameId: "7",
    title: "Free Play",
    description: "Play any game without restrictions",
    link: "/game/free-play",
    art: `..........\n..........\n..........\n..RO..BB..\n.R..OP..G.\n.R..PO..G.\n..II..YY..\n..........\n..........\n..........`,
  },
];

const createArtBoard = (gameArt: string) => {
  let art = gameArt.trim().replace(/ /g, "").split("\n");
  return art.map((line) => line.split("").map((char) => colorMap[char] || ""));
};

const Home = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const signInState = useAuthStore((state) => state.signInState);

  const navigate = useNavigate();
  const [rotationSelected, setRotationSelected] = useState<number>(0);
  
  // Review-related states
  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);

  // Chuyển game
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setRotationSelected((prev) => (prev - 1 + gameMenu.length) % gameMenu.length);
      } else if (e.key === "ArrowRight") {
        setRotationSelected((prev) => (prev + 1) % gameMenu.length);
      } else if (e.key === "Enter") {
        navigate(gameMenu[rotationSelected].link);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [rotationSelected, navigate]);

  // Fetch reviews khi đổi game
  useEffect(() => {
    fetchReviews(gameMenu[rotationSelected].gameId);
  }, [rotationSelected]);

  // Gọi API lấy reviews
  const fetchReviews = async (gameId: string) => {
    setIsLoadingReviews(true);
    try {
      // URL
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews/${gameId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Hàm post review mới
  const handlePostReview = async () => {
    if (signInState === "unauthorized" || !accessToken) {
      alert("Please login to post a review!");
      navigate("/signin");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}` //
        },
        body: JSON.stringify({
          game_id: gameMenu[rotationSelected].gameId,
          rating: newRating,
          comment: newComment
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh lại list sau khi post
        fetchReviews(gameMenu[rotationSelected].gameId);
        setNewComment("");
        setNewRating(5);
      } else {
        alert(data.message || "Failed to post review");
      }
    } catch (error) {
      console.error("Error posting review", error);
    }
  };

  // Tính điểm trung bình
  const averageRating = reviews.length > 0
    ? parseFloat((reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)) 
    : 0;

  // Render sao
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <FaStar key={index} color={index < rating ? "#fbbf24" : "#555"} />
    ));
  };

  // Render sao trung bình
  const renderAverageStars = (avg: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (avg >= i) {
        // Sao nguyên
        stars.push(<FaStar key={i} className={styles["star-icon-avg"]} />);
      } else if (avg > i - 1 && avg < i) {
        // Sao nửa
        stars.push(<FaStarHalfAlt key={i} className={styles["star-icon-avg"]} />);
      } else {
        // Sao rỗng
        stars.push(<FaRegStar key={i} className={styles["star-icon-avg"]} />);
      }
    }
    return stars;
  };

  const currentGame = gameMenu[rotationSelected];

  return (
    <div className={styles["home"]}>
      <div className={styles["game-selection"]}>
        
        <button
          onClick={() => setRotationSelected((rotationSelected - 1 + gameMenu.length) % gameMenu.length)}
          className={styles["game-select-button"]}
        >
          <FaChevronCircleLeft className={styles["game-select-button-icon"]} />
        </button>

        <div className={styles["game-container"]}>
          
          <div className={`${styles["board-and-info"]} ${showReviews ? styles["expanded"] : ""}`}>
            
            {/* Nút review */}
            <button 
              className={`${styles["review-toggle-btn"]} ${showReviews ? styles["active"] : ""}`}
              onClick={() => setShowReviews(!showReviews)}
              title="Toggle Reviews"
            >
              <FaRegCommentDots />
            </button>

            {/* Game Info và nuts start */}
            <div className={styles["game-info-col"]}>
              <div className={styles["game-card"]}>
                <h2 className={styles["game-card-title"]}>{currentGame.title}</h2>
                <p className={styles["game-card-description"]}>{currentGame.description}</p>
              </div>
              <button
                className={styles["game-play-prompt"]}
                onClick={() => navigate(currentGame.link)}
              >
                <h3>Click to Play!</h3>
              </button>
            </div>

            {/* Game Board */}
            <div className={styles["board-game-container"]}>
              {createArtBoard(currentGame.art).map((row, rowIndex) => (
                <div key={rowIndex} className={styles["board-game-row"]}>
                  {row.map((cell, colIndex) => (
                    <button
                      key={colIndex}
                      className={styles["board-game-cell"]}
                      style={{ backgroundColor: cell }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Review panel */}
            <div className={`${styles["review-panel"]} ${showReviews ? styles["open"] : ""}`}>
              <div className={styles["review-header-container"]}>
                <h3>Reviews ({reviews.length})</h3>
                <div className={styles["average-rating-box"]}>
                  <span className={styles["avg-score"]}>{averageRating}</span>
                  <div className={styles["avg-stars"]}>
                    {renderAverageStars(averageRating)}
                  </div>
                </div>
              </div>
              
              <div className={styles["review-list"]}>
                {isLoadingReviews ? (
                  <p style={{color:'#888', textAlign:'center'}}>Loading...</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className={styles["review-item"]}>
                      <img 
                        src={review.avatar_url ? `${import.meta.env.VITE_API_URL}${review.avatar_url}` : "https://via.placeholder.com/40"} 
                        alt="avatar" 
                        className={styles["review-avatar"]} 
                      />
                      <div className={styles["review-content"]}>
                        <div className={styles["review-header"]}>
                          <span className={styles["review-username"]}>{review.username}</span>
                          <div className={styles["review-stars"]}>
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className={styles["review-date"]}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        <p className={styles["review-text"]}>{review.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{color:'#666', fontStyle:'italic', textAlign:'center'}}>
                    No reviews yet. Be the first!
                  </p>
                )}
              </div>

              {/* Khung đăng reveiws */}
              <div className={styles["review-input-area"]}>
                <div className={styles["star-selector"]}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar 
                      key={star} 
                      className={`${styles["star-icon"]} ${star <= newRating ? styles["selected"] : ""}`}
                      onClick={() => setNewRating(star)}
                    />
                  ))}
                </div>
                <textarea 
                  className={styles["comment-input"]}
                  rows={2}
                  placeholder="Write a review..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className={styles["submit-review-btn"]} onClick={handlePostReview}>
                  Post <FaPaperPlane style={{marginLeft:'5px'}}/>
                </button>
              </div>
            </div>

          </div>
        </div>

        <button
          onClick={() => setRotationSelected((rotationSelected + 1) % gameMenu.length)}
          className={styles["game-select-button"]}
        >
          <FaChevronCircleRight className={styles["game-select-button-icon"]} />
        </button>

      </div>
    </div>
  );
};

export default Home;