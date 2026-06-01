/**
 * testimonialController.js
 * Simple controller that returns a list of testimonials.
 * Kept server-side so the frontend fetches from the backend instead
 * of importing mock data directly.
 */
const testimonials = [
  {
    id: 'test-1',
    name: 'Sarah Mitchell',
    role: 'Coffee Enthusiast',
    content: 'The best coffee I have ever had! The atmosphere is cozy and the staff is incredibly friendly. This has become my go-to spot for morning coffee.',
    rating: 5,
    avatar: '/images/avatars/avatar-1.jpg',
  },
  {
    id: 'test-2',
    name: 'James Anderson',
    role: 'Food Blogger',
    content: 'Exceptional quality in every cup. Their single-origin Ethiopian is a must-try. The breakfast menu is equally impressive.',
    rating: 5,
    avatar: '/images/avatars/avatar-2.jpg',
  },
  {
    id: 'test-3',
    name: 'Emily Chen',
    role: 'Local Artist',
    content: 'Perfect place to work and get inspired. The ambiance is just right, not too loud, great WiFi, and amazing pastries!',
    rating: 5,
    avatar: '/images/avatars/avatar-3.jpg',
  },
];

function getTestimonials(_req, res) {
  res.json(testimonials);
}

module.exports = { getTestimonials };
