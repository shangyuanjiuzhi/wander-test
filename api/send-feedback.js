const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  console.log('Feedback email API called');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    console.log('Received feedback data:', { name, email, subject });

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const emailContent = `
New Feedback Received
=====================

${name ? `Name: ${name}\n` : ''}
${email ? `Email: ${email}\n` : ''}
Subject: ${subject || 'General Feedback'}

Message:
${message}

------------------------
Received at: ${new Date().toLocaleString()}
`;

    const { data, error } = await resend.emails.send({
      from: 'Wander Any Place <feedback@wanderanyplace.com>',
      to: 'wanderanyplace@gmail.com',
      subject: `Feedback: ${subject || 'General Feedback'}`,
      text: emailContent
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log('Feedback email sent successfully:', data);
    res.json({ success: true, message: 'Feedback sent successfully!', id: data?.id });

  } catch (error) {
    console.error('Error sending feedback email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};