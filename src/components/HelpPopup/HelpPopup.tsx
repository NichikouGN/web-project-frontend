import styles from "./HelpPopup.module.css";

interface HelpPopupProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  title?: string;
}

const HelpPopup = ({ isOpen, imageUrl, onClose, title }: HelpPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles["popup-overlay"]} onClick={onClose}>
      <div className={styles["popup-content"]} onClick={(e) => e.stopPropagation()}>
        <button className={styles["close-button"]} onClick={onClose} aria-label="Close">
          ✕
        </button>
        {title && <h2 className={styles["popup-title"]}>{title}</h2>}
        <img src={imageUrl} alt="Help" className={styles["popup-image"]} />
      </div>
    </div>
  );
};

export default HelpPopup;
