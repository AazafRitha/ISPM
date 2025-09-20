import { ApiResponse } from '../utils/apiResponse.js';

// Contact form submission
export const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json(
        ApiResponse.error('All fields are required', 400)
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(
        ApiResponse.error('Please provide a valid email address', 400)
      );
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM system
    // For now, we'll just log it and return success

    console.log('Contact form submission:', {
      firstName,
      lastName,
      email,
      message,
      timestamp: new Date().toISOString()
    });

    // TODO: Add database save logic here
    // const contact = await Contact.create({ firstName, lastName, email, message });

    // TODO: Add email notification here
    // await sendContactEmail({ firstName, lastName, email, message });

    res.status(200).json(
      ApiResponse.success(
        {
          message: 'Thank you for your message! We will get back to you soon.',
          id: Date.now() // Temporary ID, replace with actual database ID
        },
        'Contact form submitted successfully'
      )
    );

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json(
      ApiResponse.error('Internal server error. Please try again later.', 500)
    );
  }
};
