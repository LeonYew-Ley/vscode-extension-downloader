import { Component } from 'solid-js';

const LoadingSpinner: Component = () => {
  return (
    <>
      <style>{`
        @keyframes spinner-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .spinner-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #2563eb;
          animation: spinner-bounce 1.4s ease-in-out infinite both;
        }
        .spinner-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .spinner-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        .spinner-dot:nth-child(3) {
          animation-delay: 0s;
        }
        .spinner-dot:nth-child(4) {
          animation-delay: 0.16s;
        }
        .spinner-dot:nth-child(5) {
          animation-delay: 0.32s;
        }
      `}</style>
      <div class="flex items-center justify-center py-2 w-full">
        <div class="spinner">
          <div class="spinner-dot"></div>
          <div class="spinner-dot"></div>
          <div class="spinner-dot"></div>
          <div class="spinner-dot"></div>
          <div class="spinner-dot"></div>
        </div>
      </div>
    </>
  );
};

export default LoadingSpinner;

