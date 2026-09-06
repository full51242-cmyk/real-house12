import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../navbar";
import { designAPI } from "../utils/api";
import "./AIDesignGenerator.css";

export default function AIDesignGenerator() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = image;
    downloadLink.download = "ai-home-design.jpg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError("Describe the home you want to imagine first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setImage("");

    try {
      const response = await designAPI.generate(trimmedDescription);
      setImage(response.image);
    } catch (generationError) {
      setError(generationError.message || "We couldn't generate that design. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-design-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="ai-design-main">
        <Link className="ai-design-back" to="/">Back to Real House</Link>
        <div className="ai-design-intro">
          <p className="eyebrow">AI Design Studio</p>
          <h1>Give the next home a shape.</h1>
          <p>Describe the architecture, mood, and setting. We&apos;ll turn your brief into a photorealistic exterior concept.</p>
        </div>

        <div className="ai-design-layout">
          <form className="ai-design-form" onSubmit={handleSubmit}>
            <label htmlFor="design-description">Your home brief</label>
            <textarea
              id="design-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A two-storey concrete villa with wide glass windows, a shaded courtyard, and native plants in Clifton..."
              rows={8}
              disabled={isGenerating}
            />
            <p className="ai-design-hint">More detail helps: style, materials, rooms, landscape, and location.</p>
            <button className="ai-design-button" type="submit" disabled={isGenerating}>
              {isGenerating ? "Generating your design..." : "Generate Design"}
            </button>
            {isGenerating && <p className="ai-design-status">The studio is warming up. This can take 10-30 seconds.</p>}
            {error && <p className="ai-design-error" role="alert">{error}</p>}
          </form>

          <section className={`ai-design-result ${image ? "has-image" : ""}`} aria-live="polite">
            {image ? (
              <>
                <img src={image} alt={`AI-generated home design based on: ${description}`} />
                <button className="ai-design-download-button" type="button" onClick={handleDownload}>
                  Download Design
                </button>
              </>
            ) : (
              <div className="ai-design-placeholder">
                <span className="ai-design-placeholder-mark">01</span>
                <h2>Your concept will appear here.</h2>
                <p>Start with a place, a feeling, and the kind of home you want to come back to.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}