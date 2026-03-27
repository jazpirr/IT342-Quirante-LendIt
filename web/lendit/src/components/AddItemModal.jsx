import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { X, Package, Loader2, ImagePlus, CheckCircle2 } from "lucide-react";
import "../css/AddItemModal.css";

const AddItemModal = ({ onClose, onItemAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);

    let imageUrl = "";

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("item-images").upload(fileName, file);
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from("item-images").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8080/api/items/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, imageUrl }),
    });

    const newItem = await res.json();
    setLoading(false);
    onItemAdded(newItem);
    onClose();
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="aim-backdrop" onClick={onClose}>
      <div className="aim-card" onClick={(e) => e.stopPropagation()}>
        <div className="aim-stripe" />

        <div className="aim-header">
          <div className="aim-title-group">
            <div className="aim-icon-wrap">
              <Package size={20} color="white" />
            </div>
            <div>
              <div className="aim-title">Add New Item</div>
              <div className="aim-subtitle">Share something with your community</div>
            </div>
          </div>
          <button className="aim-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="aim-body">
          <div className="aim-field">
            <label className="aim-label">Item Name *</label>
            <input
              className="aim-input"
              placeholder="e.g. Canon DSLR Camera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="aim-field">
            <label className="aim-label">Description</label>
            <textarea
              className="aim-textarea"
              placeholder="Briefly describe your item — condition, usage instructions, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="aim-field">
            <label className="aim-label">Photo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {preview ? (
              <div className="aim-preview-wrap">
                <img src={preview} className="aim-preview-img" alt="preview" />
                <div className="aim-preview-overlay">
                  <span className="aim-preview-name">{file?.name}</span>
                  <button className="aim-preview-change" onClick={() => fileRef.current.click()}>
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`aim-dropzone ${dragOver ? "dragover" : ""}`}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="aim-dropzone-inner">
                  <div className="aim-dropzone-icon">
                    <ImagePlus size={22} />
                  </div>
                  <div className="aim-dropzone-title">Drop your photo here</div>
                  <div className="aim-dropzone-sub">or click to browse · PNG, JPG, WEBP</div>
                </div>
              </div>
            )}
          </div>

          <div className="aim-actions">
            <button className="aim-cancel" onClick={onClose}>Cancel</button>
            <button
              className="aim-submit"
              onClick={handleSubmit}
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="aim-spinner" />
                  Uploading…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Add Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;