// Contact API for form submission
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const contactApi = {
  async submit(data) {
    try {
      console.log('Submitting contact form to backend:', data);
      
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit contact form');
      }

      return {
        success: true,
        message: result.data?.message || 'Thank you for your message! We will get back to you soon.'
      };
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw new Error(error.message || 'Failed to submit contact form. Please try again.');
    }
  }
};
