import React from "react";
import "../index.css";

export default function Modal({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) {
  if (!images || images.length === 0 || currentIndex === null) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Left Arrow */}
        <button
          className="modal-arrow modal-arrow-left"
          onClick={onPrev}
          aria-label="Previous image"
        >
          &#8249;
        </button>

        {/* Image Container */}
        <div className="modal-image-container">
          <img
            src={currentImage.src}
            alt="Gallery item"
            className="modal-image"
          />
          <p className="modal-date">{currentImage.date}</p>
        </div>

        {/* Right Arrow */}
        <button
          className="modal-arrow modal-arrow-right"
          onClick={onNext}
          aria-label="Next image"
        >
          &#8250;
        </button>
      </div>
    </div>
  );
}
