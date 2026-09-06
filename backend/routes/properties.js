const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/requireAuth');

const MAX_PHOTOS = 8;
const MAX_PHOTO_LENGTH = 5 * 1024 * 1024;

function normalizeProperty(input = {}) {
  return {
    id: input.id || cryptoRandomId(),
    name: String(input.name || '').trim(),
    type: String(input.type || 'Residential').trim(),
    location: String(input.location || '').trim(),
    price: String(input.price || '').trim(),
    bedrooms: input.bedrooms !== undefined && input.bedrooms !== '' ? Number(input.bedrooms) : null,
    bathrooms: input.bathrooms !== undefined && input.bathrooms !== '' ? Number(input.bathrooms) : null,
    area: String(input.area || '').trim(),
    description: String(input.description || '').trim(),
    photos: Array.isArray(input.photos) ? input.photos.filter(Boolean) : [],
    created_at: input.created_at || new Date().toISOString(),
  };
}

function validateProperty(input) {
  const missingField = ['name', 'location', 'price'].find((field) => typeof input[field] !== 'string' || !input[field].trim());
  if (missingField) return `Property ${missingField} is required`;
  for (const field of ['bedrooms', 'bathrooms']) {
    if (input[field] !== undefined && input[field] !== '' && (!Number.isInteger(Number(input[field])) || Number(input[field]) < 0)) {
      return `${field} must be a non-negative integer`;
    }
  }
  if (!Array.isArray(input.photos) || input.photos.length > MAX_PHOTOS) return `No more than ${MAX_PHOTOS} photos are allowed`;
  if (input.photos.some((photo) => typeof photo !== 'string' || photo.length > MAX_PHOTO_LENGTH || !(/^(https?:\/\/|data:image\/(jpeg|png|webp|gif);base64,)/i.test(photo)))) {
    return 'Photos must be image URLs or supported image data and remain below the size limit';
  }
  return null;
}

function cryptoRandomId() {
  return `prop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function listPropertiesFromSupabase() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Property fetch from Supabase failed:', error.message);
    throw error;
  }

  return data;
}

async function savePropertyToSupabase(property, client) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await client
    .from('properties')
    .insert({
      name: property.name,
      type: property.type,
      location: property.location,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      description: property.description,
      photos: property.photos,
    })
    .select()
    .single();

  if (error) {
    console.error('Property insert to Supabase failed:', error.message);
    throw error;
  }

  return data;
}

router.get('/', async (req, res) => {
  try {
    const supabaseProperties = await listPropertiesFromSupabase();

    res.status(200).json({
      success: true,
      properties: supabaseProperties.map((property) => normalizeProperty(property)),
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Unable to fetch properties' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const validationError = validateProperty(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    const propertyInput = normalizeProperty(req.body);
    const savedProperty = await savePropertyToSupabase(propertyInput, req.supabase);

    return res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: normalizeProperty(savedProperty),
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(503).json({ message: 'Property database is unavailable. Property was not saved.' });
  }
});

module.exports = router;
