import React from "react";

interface AssignTaskButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const AssignTaskButton: React.FC<AssignTaskButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      // Added a specific class "assign-task-button-interactive" for the <style> tag to target
      className="assign-task-button-interactive group relative transition-all duration-300 ease-in-out shadow-[0_10px_20px_rgba(0,0,0,0.2)] px-5 py-2 bg-indigo-500 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center gap-2.5 font-bold border-2 border-[#ffffff7d] outline-none overflow-hidden text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:border-[#ffffff7d]"
      onClick={onClick}
      disabled={disabled}
    >
      Assign Task
      <svg
        // The "icon" class is used by the CSS in the <style> tag
        className="icon w-6 h-6 transition-all duration-300 ease-in-out"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
          clipRule="evenodd"
        ></path>
      </svg>
      {/* Styles are now targeting ".assign-task-button-interactive" */}
      <style >{`
        .assign-task-button-interactive:hover {
          transform: scale(1.05);
          border-color: #ffffffe6; /* Slightly more opaque white border on hover */
        }
        .assign-task-button-interactive:hover .icon {
          transform: translateX(4px); /* Icon moves to the right */
        }
        .assign-task-button-interactive::before {
          content: "";
          position: absolute;
          width: 100px; /* Width of the shine element */
          height: 100%;
          background-image: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.8), /* Shine color and opacity */
            rgba(255, 255, 255, 0) 70%
          );
          top: 0;
          left: -100px; /* Start position of shine */
          opacity: 0.6; /* Opacity of the shine */
        }
        /* Trigger shine animation on hover, but not when disabled */
        .assign-task-button-interactive:hover:not(:disabled)::before {
          animation: shine 1.5s ease-out infinite;
        }
        @keyframes shine {
          0% {
            left: -100px; /* Start position */
          }
          60% {
            left: 100%; /* End position within the button */
          }
          to {
            left: 100%; /* Ensures it stays off-screen after one pass if not looping correctly */
          }
        }
      `}</style>
    </button>
  );
};

export default AssignTaskButton;