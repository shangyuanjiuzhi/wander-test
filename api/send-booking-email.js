const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  console.log('Booking email API called');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, passengers, phone, wechat, whatsapp, email, services, others } = req.body;

    console.log('Received booking data:', { name, passengers, phone, email, services });

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const servicesList = services && services.length > 0 ? services.join(', ') : 'None selected';

    const emailContent = `
Booking Request Details
========================

Name: ${name}
Number of Passengers: ${passengers || 'Not specified'}
Contact Email: ${email}

Contact Methods:
${phone ? `- Phone: ${phone}` : ''}
${wechat ? `- WeChat: ${wechat}` : ''}
${whatsapp ? `- WhatsApp: ${whatsapp}` : ''}

Services Requested: ${servicesList}

${others ? `Additional Requirements:\n${others}` : ''}

------------------------
Request received at: ${new Date().toLocaleString()}
`;

    const { data, error } = await resend.emails.send({
      from: 'Wander Any Place <booking@wanderanyplace.com>',
      to: 'wanderanyplace@gmail.com',
      subject: `New Booking Request from ${name}`,
      text: emailContent
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log('Email sent successfully:', data);
    res.json({ success: true, message: 'Booking request sent successfully!', id: data?.id });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};