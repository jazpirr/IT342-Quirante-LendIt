import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { X, Package, Loader2, ImagePlus, CheckCircle2, Plus } from "lucide-react";
import "../css/AddItemModal.css";

const AddItemModal = ({ onClose, onItemAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFiles((prev) => [...prev, f]);
    setPreviews((prev) => [...prev, URL.createObjectURL(f)]);
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(handleFile);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);

    let imageUrls = [];
    for (let file of files) {
      const fileName = `${Date.now()}-${Math.random()}-${file.name}`;
      const { error } = await supabase.storage.from("item-images").upload(fileName, file);
      if (error) { console.error(error); setLoading(false); return; }
      const { data } = supabase.storage.from("item-images").getPublicUrl(fileName);
      imageUrls.push(data.publicUrl);
    }

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8080/api/items/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, imageUrl: imageUrls[0], images: imageUrls }),
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
            <div className="aim-label-row">
              <label className="aim-label">Photos</label>
              {previews.length > 0 && (
                <span className="aim-photo-count">
                  {previews.length} photo{previews.length !== 1 ? "s" : ""} added
                </span>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                Array.from(e.target.files).forEach(handleFile);
                fileRef.current.value = "";
              }}
            />

            {previews.length === 0 ? (
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
                  <div className="aim-dropzone-sub">or click to browse</div>
                </div>
              </div>
            ) : (
              <div
                className={`aim-photo-layout ${dragOver ? "dragover" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {/* Big featured / cover photo */}
                <div className="aim-featured">
                  <img src={previews[0]} className="aim-featured-img" alt="cover" />
                  <span className="aim-featured-badge">Cover</span>
                  <button className="aim-thumb-remove" onClick={() => handleRemove(0)}>
                    <X size={10} />
                  </button>
                </div>

                {/* Small thumbnails + add tile */}
                <div className="aim-thumbs-row">
                  {previews.slice(1).map((p, i) => (
                    <div key={i + 1} className="aim-thumb">
                      <img src={p} className="aim-thumb-img" alt={`photo-${i + 1}`} />
                      <button
                        className="aim-thumb-remove"
                        onClick={() => handleRemove(i + 1)}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <div className="aim-add-tile" onClick={() => fileRef.current.click()}>
                    <Plus size={18} />
                    <span>Add</span>
                  </div>
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
                <><Loader2 size={16} className="aim-spinner" /> Uploading…</>
              ) : (
                <><CheckCircle2 size={16} /> Add Item</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;