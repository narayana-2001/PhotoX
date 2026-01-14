import React, { useState, useEffect } from "react";
import UploadButton from "./UploadButton";
import Modal from "./Modal";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import "../index.css";

export default function MainGallery({ profileId = null }) {
  const { session } = UserAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Load images when session or selected profile changes
  useEffect(() => {
    if (profileId) loadUserImages(profileId);
    else if (session) loadUserImages(session.user.id);
    else setImages([]);
  }, [session, profileId]);
  const loadUserImages = async (ownerId) => {
    if (!ownerId) return;

    try {
      const { data, error: listError } = await supabase.storage
        .from("images")
        .list(`${ownerId}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) throw listError;

      const imageObjects = data
        .filter((file) => file.name !== ".emptyFolderPlaceholder")
        .map((file) => {
          const publicUrl = supabase.storage
            .from("images")
            .getPublicUrl(`${ownerId}/${file.name}`).data.publicUrl;

          return {
            src: publicUrl,
            date: new Date(file.created_at).toLocaleString(),
            fileName: file.name,
            ownerId,
          };
        });

      setImages(imageObjects);
    } catch (err) {
      console.error("Error loading images:", err);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setError("");
    setLoading(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${session.user.id}/${fileName}`;

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const publicUrl = supabase.storage.from("images").getPublicUrl(filePath)
          .data.publicUrl;

        uploadedImages.push({
          src: publicUrl,
          date: new Date().toLocaleString(),
          fileName: fileName,
          ownerId: session.user.id,
        });
      }

      setImages((prev) => [...uploadedImages, ...prev]);
    } catch (err) {
      console.error("Error uploading images:", err);
      setError("Failed to upload images. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    const imageToDelete = images[index];
    const owner = imageToDelete?.ownerId || session?.user?.id;

    if (!session?.user?.id || session.user.id !== owner) return;

    try {
      const filePath = `${owner}/${imageToDelete.fileName}`;
      const { error: deleteError } = await supabase.storage
        .from("images")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      setImages((prev) => prev.filter((_, i) => i !== index));
      if (selectedImageIndex === index) {
        setSelectedImageIndex(null);
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Failed to delete image.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <div>
      {/* Upload Button */}
      <UploadButton
        onFileSelect={handleFileUpload}
        onError={(errorMsg) => {
          setError(errorMsg);
          setTimeout(() => setError(""), 5000);
        }}
      />

      {/* Error Message */}
      {error && (
        <p style={{ color: "#ff6b6b", padding: "10px", textAlign: "center" }}>
          {error}
        </p>
      )}

      {/* Loading Indicator */}
      {loading && (
        <p style={{ color: "#fff", textAlign: "center" }}>Uploading...</p>
      )}

      {/* Image Gallery */}
      <div className="grid-container">
        {images.map((image, index) => (
          <div
            key={index}
            className="grid-item"
            onClick={() => handleImageClick(index)}
            style={{
              backgroundImage: `url(${image.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              cursor: "pointer",
            }}
          >
            {/* Overlay with date and delete icon */}
            <div className="overlay">
              <span className="upload-date">{image.date}</span>
              {session?.user?.id === image.ownerId && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        images={images}
        currentIndex={selectedImageIndex}
        onClose={handleCloseModal}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  );
}
