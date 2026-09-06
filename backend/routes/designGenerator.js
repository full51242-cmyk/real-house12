const express = require('express');

const router = express.Router();

function getEnhancedPrompt(description) {
  return `Architectural exterior photo of a ${description}, modern residential real estate, photorealistic, professional architecture photography, natural daylight, high detail, 4k, well-landscaped surroundings, clear blue sky`;
}

router.post('/generate-design', async (req, res) => {
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';

  if (!description || description.length > 1000) {
    return res.status(400).json({ message: 'A home description is required' });
  }

  const prompt = getEnhancedPrompt(description);

  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=960&enhance=true&seed=${seed}&nologo=true`;
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Pollinations returned status ${response.status}`);
    }

    const base64Image = Buffer.from(await response.arrayBuffer()).toString('base64');
    return res.json({ image: `data:image/jpeg;base64,${base64Image}` });
  } catch (error) {
    console.error('Design generation error:', error.message);
    return res.status(500).json({ message: 'Unable to generate the design right now. Please try again.' });
  }
});

module.exports = router;