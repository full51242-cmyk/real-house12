const API_BASE_URL = 'https://real-house12.vercel.app/api';
const PROPERTY_STORAGE_KEY = 'hadeed_test_properties';

const FALLBACK_PROPERTIES = [
  {
    id: 'fake-1',
    name: 'Ridge House',
    type: 'Residential',
    location: 'Clifton, Karachi',
    price: 'PKR 5.6 Cr',
    bedrooms: 5,
    bathrooms: 4,
    area: '4200 sqft',
    description: 'Luxury family villa with rooftop lounge and landscaped garden.',
    photos: [],
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fake-2',
    name: 'Marina Suites',
    type: 'Apartment',
    location: 'Seaview Apartments, Karachi',
    price: 'PKR 3.9 Cr',
    bedrooms: 3,
    bathrooms: 3,
    area: '2000 sqft',
    description: 'Modern apartment with sea-facing balconies and smart home features.',
    photos: [],
    created_at: '2026-01-02T00:00:00.000Z',
  },
];

function getStoredProperties() {
  try {
    const stored = localStorage.getItem(PROPERTY_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(FALLBACK_PROPERTIES));
      return FALLBACK_PROPERTIES;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_PROPERTIES;
  } catch (error) {
    console.warn('Local property storage unavailable:', error);
    return FALLBACK_PROPERTIES;
  }
}

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  deleteAccount: async () => {
    return apiCall('/auth/me', {
      method: 'DELETE',
    });
  },
};

export const propertyAPI = {
  create: async (propertyData) => {
    try {
      return await apiCall('/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      });
    } catch {
      const properties = getStoredProperties();
      const newProperty = {
        ...propertyData,
        id: `fake-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      const updatedProperties = [newProperty, ...properties];
      localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(updatedProperties));

      return {
        success: true,
        message: 'Property added locally while the server is unavailable',
        property: newProperty,
      };
    }
  },

  list: async () => {
    try {
      const response = await apiCall('/properties');
      return response;
    } catch {
      const stored = getStoredProperties();
      return { success: true, properties: stored };
    }
  },
};

export const designAPI = {
  generate: async (description) => {
    return apiCall('/generate-design', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },
};

export default apiCall;
