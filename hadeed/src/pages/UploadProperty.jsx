import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { propertyAPI } from "../utils/api";
import "./UploadProperty.css";

export default function UploadProperty() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
  });

  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.location || !formData.price) {
      setError("Property name, location, and price are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        photos: previewUrls,
      };

      const response = await propertyAPI.create(payload);
      alert(response.message || "Property created successfully");
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <div className="upload-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="36" height="36" rx="4" stroke="#1976d2" strokeWidth="2"/>
              <path d="M10 30L10 15L15 15L15 10L25 10L25 15L30 15L30 30Z" fill="#42a5f5"/>
              <rect x="18" y="20" width="4" height="10" fill="#1976d2"/>
            </svg>
          </div>
          <h1>Upload Property</h1>
          <p>Add your property to our portfolio</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h3>Property Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Property Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter property name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Property Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="office">Office</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (PKR)</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 Cr, 2.1 Cr onward"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="area">Area (sqft)</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Enter area"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="Number of bedrooms"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="Number of bathrooms"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your property..."
                rows={4}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Property Photos</h3>
            
            <div className="photo-upload-area">
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="photo-input"
              />
              <label htmlFor="photos" className="photo-upload-label">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Click to upload photos</span>
                <span className="upload-hint">or drag and drop</span>
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="photo-preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => removePhoto(index)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/" className="btn-cancel">Cancel</Link>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
