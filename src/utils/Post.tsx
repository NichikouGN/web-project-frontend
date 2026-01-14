import { formatConsoleError } from "../consoleError";
import { Toast } from "../stores/toastStore";

export const Donut = ({ size = 120, strokeWidth = 10, progress = 30, text = "" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--theme-text-secondary)"
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--red-500)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} // start from top
      />

      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="1.5rem"
        fill="var(--theme-text-primary)"
        fontWeight="900"
      >
        {text}
      </text>
    </svg>
  );
};

/**
 * Copy text to clipboard
 * @param text The text to copy to the clipboard
 */
const copyToClipboard = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;

  // Prevent keyboard from showing
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);

  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

// Handle share functionality
export const handlePostShare = async (title: string) => {
  if (!navigator.share) {
    copyToClipboard(window.location.href);
    Toast({
      type: "info",
      title: "Share",
      message: "Copied link to clipboard",
    });
  } else {
    navigator
      .share({
        title: title,
        url: window.location.href,
      })
      .catch((error) => {
        formatConsoleError("PostContent.tsx", "handleShare", error);
      });
  }
};
