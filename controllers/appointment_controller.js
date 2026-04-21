const db = require('../db').callbackPool;
const { logger } = require('../utils/logger');
const sendEmail = require('../utils/mailer');
const { generateVisitorCardImage } = require('../utils/generate_card');
const { checkVisitorQuery,
  insertOtpQuery,
  selectOtpQuery,
  deleteOtpQuery,
  fetchVisitorQuery,
  insertVisitorQuery,
  insertAppointmentQuery,
  updateAppointmentQuery,
  getAppointmentByIdQuery,
  getAppointmentsTableDataQuery,
  getRemarksByAppointmentIdQuery,
  updateVisitorQrQuery } = require('../queries/appointment_queries');
const { generateVisitorQr } = require('../utils/generate_qr');
const sendOTP = require('../utils/sendEmail');
const qrUtil = require('../utils/generate_qr');

exports.createAppointment = async (req, res) => {
  logger.debug('Creating appointment with data:', { body: req.body });
  
  const {
    first_name,
    last_name,
    email,
    phone,
    gender,
    aadhar_no,
    address,
    purpose_of_visit,
    appointment_date,
    appointment_time,
    duration,
    company_id,
    department_id,
    designation_id,
    whom_to_meet,
    reminder,
    remarks
  } = req.body;

  // Handle uploaded image
  const image = req.file ? req.file.filename : (req.body.image || null);

  // Smart date formatting: handles both 'dd-mm-yyyy' and 'yyyy-mm-dd' (ISO format from HTML date input)
  function formatDate(dateString) {
    if (!dateString) {
      console.error('Date string is empty or undefined');
      return null;
    }
    
    // Check if it's already in ISO format (yyyy-mm-dd) - from HTML date input
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString; // Already in correct MySQL format
    }
    
    // Handle dd-mm-yyyy format
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month}-${day}`;
    }
    
    console.error('Unrecognized date format:', dateString);
    return dateString; // Return as-is and let MySQL handle it
  }

  const formattedDate = formatDate(appointment_date);
  logger.debug('Formatted date:', { formattedDate });

  const visitorData = [
    first_name,
    last_name,
    email,
    phone,
    gender,
    company_id,
    department_id,
    designation_id,
    whom_to_meet,
    purpose_of_visit,  // This maps to 'purpose' column (purpose_id)
    aadhar_no,
    address || '',
    image || null,
    1,               // otp_verified
    'active'         // qr_status
  ];

  logger.debug('Visitor data array prepared');


  db.query(insertVisitorQuery, visitorData, async (err, result) => {
    if (err) {
      console.error('Visitor insert error:', err);
      return res.status(500).send('Failed to create visitor');
    }

    const visitor_id = result.insertId;

    try {
      const qrCode = await generateVisitorQr(visitor_id);
      db.query(updateVisitorQrQuery, [qrCode, visitor_id], (err) => {
        if (err) {
          console.error('QR code update error:', err);
          return res.status(500).send('Failed to save QR code');
        }

        const appointmentData = [
          visitor_id,
          formattedDate,
          appointment_time,
          duration,
          purpose_of_visit,
          company_id,
          department_id,
          designation_id,
          whom_to_meet,
          reminder,
          remarks
        ];

        db.query(insertAppointmentQuery, appointmentData, (err2, result2) => {
          if (err2) {
            console.error('Appointment insert error:', err2);
            return res.status(500).send('Failed to create appointment');
          }

          res.status(201).send({
            message: 'Visitor and appointment created successfully',
            visitor_id,
            appointment_id: result2.insertId,
            qr_code: qrCode
          });

          // Fetch details for the visual card
          const getDetailsQuery = `
            SELECT 
              (SELECT company_name FROM companies WHERE id = ?) AS company_name,
              (SELECT CONCAT(first_name, ' ', last_name) FROM employees WHERE id = ?) AS employee_name,
              (SELECT purpose FROM purpose WHERE purpose_id = ?) AS purpose_text
          `;
          db.query(getDetailsQuery, [company_id, whom_to_meet, purpose_of_visit], async (errDetails, detailsResults) => {
            let companyName = 'VMS';
            let employeeName = '';
            let purposeText = 'Meeting';
            if (!errDetails && detailsResults.length > 0) {
              const row = detailsResults[0];
              companyName = row.company_name || 'VMS';
              employeeName = row.employee_name || '';
              purposeText = row.purpose_text || 'Meeting';
            }

            // Visitor HTML Pass configuration
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const visitorImageUrl = image ? `${baseUrl}/uploads/${image}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=visitor-${visitor_id}`;
            const padVisitorId = visitor_id.toString().padStart(4, '0');

            const cardHtml = `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 450px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
                <tr>
                  <td style="background-color: #2c4463; padding: 20px; border-radius: 8px 8px 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50">
                          <div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; color: white; display: inline-block; text-align: center; line-height: 50px; font-weight: bold; font-size: 16px;">VMS</div>
                        </td>
                        <td align="right" style="color: white;">
                          <div style="font-weight: bold; font-size: 20px; text-transform: uppercase;">${companyName}</div>
                          <div style="font-size: 14px; opacity: 0.9;">${formattedDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <img src="${visitorImageUrl}" alt="Visitor Photo" width="120" height="120" style="border-radius: 50%; border: 4px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.2); object-fit: cover; background-color: #f0f0f0; display: block;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #8898aa; font-weight: bold; font-size: 14px; width: 40%;">NAME</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #32325d; font-weight: bold; font-size: 16px; text-transform: capitalize;">${first_name} ${last_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #8898aa; font-weight: bold; font-size: 14px;">TO MEET</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #32325d; font-weight: bold; font-size: 16px; text-transform: capitalize;">${employeeName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #8898aa; font-weight: bold; font-size: 14px;">PURPOSE</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #32325d; font-weight: bold; font-size: 16px;">${purposeText}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #8898aa; font-weight: bold; font-size: 14px; vertical-align: top;">PHONE</td>
                        <td style="padding: 12px 0; color: #32325d; font-weight: bold; font-size: 16px; vertical-align: top;">
                          ${phone}
                          <div style="float: right; text-align: center; margin-top: -60px; margin-right: -10px;">
                             <img src="${qrImageUrl}" alt="QR Code" width="100" height="100" style="display: block;" />
                             <div style="font-weight: bold; font-size: 20px; color: #32325d; margin-top: 5px;">${padVisitorId}</div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `;

            // Generate PNG Card Image Buffer
            const cardImageBuffer = await generateVisitorCardImage({
              name: `${first_name} ${last_name}`,
              companyName,
              employeeName,
              purposeText,
              phone,
              date: formattedDate,
              imageFilename: image,
              visitorId: visitor_id,
              padVisitorId
            });

            // Send confirmation email to visitor
            if (email) {
              sendEmail({
                to: email,
                subject: 'Your Visitor Digital Pass - ' + companyName,
                html: `
                  <div style="background-color: #f6f9fc; padding: 40px 10px; text-align: center;">
                    <p style="font-family: Arial, sans-serif; color: #525f7f; font-size: 16px; margin-bottom: 20px;">
                      Your appointment has been successfully scheduled for <strong>${formattedDate}</strong> at <strong>${appointment_time}</strong>.
                    </p>
                    ${cardHtml}
                    <div style="margin-top: 30px;">
                      <a href="cid:visitorpass" style="color: #4f46e5; text-decoration: none; font-size: 16px; font-weight: bold;">Download Pass as Image (Attachment)</a>
                    </div>
                  </div>
                `,
                attachments: [
                  {
                    filename: `visitor-pass-${visitor_id}.png`,
                    content: cardImageBuffer,
                    cid: 'visitorpass' // used for inline if supported, or just attachment
                  }
                ]
              }).then(() => logger.info('Appointment email sent to visitor with attachment'))
                .catch((mailErr) => logger.error('Appointment mail error (visitor):', { error: mailErr.text || mailErr.message || mailErr }));
            }

            // Send notification email to company admin(s)
            db.query(
              "SELECT email FROM employees WHERE role_id = 2 AND company_id = ?",
              [company_id],
              (emailErr, emailResults) => {
                if (emailErr) {
                  console.error("Error fetching admin emails:", emailErr.message);
                  return;
                }
                const adminEmails = emailResults.map(row => row.email).filter(Boolean);
                if (adminEmails.length > 0) {
                  const toEmail = adminEmails.join(',');
                  sendEmail({
                    to: toEmail,
                    subject: `New Appointment: ${first_name} ${last_name}`,
                    html: `<h1>New Appointment Scheduled</h1>
                      <p>A new appointment has been scheduled for ${first_name} ${last_name}.</p>
                      <p>Date: ${formattedDate}</p>
                      <p>Time: ${appointment_time}</p>
                      <p>Contact: ${email} | ${phone}</p>`
                  }).then(() => logger.info('Appointment notification sent to admin(s)', { toEmail }))
                    .catch((mailErr) => logger.error('Mail error (admin):', { error: mailErr.text || mailErr.message || mailErr }));
                }
              }
            );
          });
        });
      });

    } catch (qrErr) {
      console.error('QR generation error:', qrErr);
      return res.status(500).send('QR Code generation failed');
    }
  });
};

exports.updateAppointment = (req, res) => {
  const appointment_id = req.params.id;
  const {
    visitor_id,
    appointment_date,
    appointment_time,
    duration,
    purpose_of_visit,
    company_id,
    department_id,
    designation_id,
    whom_to_meet,
    reminder,
    remarks
  } = req.body;

  const data = [
    visitor_id,
    appointment_date,
    appointment_time,
    duration,
    purpose_of_visit,
    company_id,
    department_id,
    designation_id,
    whom_to_meet,
    reminder,
    remarks
  ];

  db.query(updateAppointmentQuery, [...data, appointment_id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).send('Server error');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Appointment not found' });
    }

    res.send({ message: 'Appointment updated successfully' });
  });
};

exports.getAppointmentById = (req, res) => {
  const appointment_id = req.body.id;

  if (!appointment_id) {
    return res.status(400).json({ message: 'Appointment ID is required' });
  }

  db.query(getAppointmentByIdQuery, [appointment_id], (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Appointment not found' });
    }

    const row = results[0];
    res.status(200).send({
      appointment_id: row.appointment_id,
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time,
      duration: row.duration,
      purpose_of_visit: row.purpose_of_visit,
      company_id: row.company_id,
      department_id: row.department_id,
      designation_id: row.designation_id,
      reminder: row.reminder,
      remarks: row.remarks,
      visitor: {
        first_name: row.visitor_first_name,
        last_name: row.visitor_last_name,
        email: row.visitor_email,
        phone: row.visitor_phone
      },
      whom_to_meet: {
        first_name: row.emp_first_name,
        last_name: row.emp_last_name,
        email: row.emp_email
      }
    });
  });
};


exports.getAppointmentsTableData = (req, res) => {
  let query = getAppointmentsTableDataQuery;
  const params = [];

  if (req.user && req.user.roleId === 2) {
    query = query.replace('ORDER BY', 'WHERE a.company_id = ? ORDER BY');
    params.push(req.user.companyId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json({
      message: 'Appointments fetched successfully',
      data: results
    });
  });
};



exports.sendOtp = (req, res) => {
  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ message: 'Phone number or email is required' });
  }

  const isEmail = contact.includes('@');
  const phone = isEmail ? null : contact;
  const email = isEmail ? contact : null;

  db.query(checkVisitorQuery, [phone, email], (err, visitorResults) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });

    if (visitorResults.length === 0) {
      return res.status(404).json({ message: 'No visitor found with this contact' });
    }

    const otp = '1234';
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry


    db.query(insertOtpQuery, [phone, email, otp, expiry], async (err2) => {
      if (err2) return res.status(500).json({ message: 'DB error', error: err2 });

      logger.debug('OTP generated for contact', { contact });

      try {
        if (email) {
          // Send OTP via email
          await sendOTP(email, otp);
        } else {
          logger.debug('Phone OTP - fixed bypass for appointments');
        }

        res.json({ message: 'OTP generated and sent' });
      } catch (emailErr) {
        console.error('Error sending email:', emailErr);
        res.status(500).json({ message: 'Failed to send OTP email' });
      }
    });
  });
};

exports.verifyOtp = (req, res) => {
  const { contact, otp } = req.body;

  logger.debug('Verify OTP request', { contact });

  if (!contact || !otp) {
    return res.status(400).json({ message: 'Contact and OTP are required' });
  }

  const isEmail = contact.includes('@');
  const phone = isEmail ? null : contact;
  const email = isEmail ? contact : null;

  logger.debug('OTP verify parsed contact', { isEmail, phone, email });

  db.query(selectOtpQuery, [phone, phone, email, email], (err, otpResults) => {
    logger.debug('OTP query result count', { count: otpResults?.length });

    if (err) {
      console.error('DB error while checking OTP:', err);
      return res.status(500).json({ message: 'DB error while checking OTP', error: err });
    }

    if (!otpResults.length) {
      console.warn('OTP not found in DB');
      return res.status(404).json({ message: 'OTP not found' });
    }

    const record = otpResults[0];

    logger.debug('OTP record found', { expiresAt: record.expires_at });

    if (record.otp.trim() !== otp.trim()) {
      console.warn('OTP mismatch');
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > record.expires_at) {
      console.warn('OTP expired');
      return res.status(401).json({ message: 'OTP expired' });
    }

    // Do not delete OTP immediately to allow for network retries/idempotency
    // DB will clean it up or it will expire naturally
    /*
    db.query(deleteOtpQuery, [phone, email], (err2) => {
      if (err2) console.error('Failed to delete OTP:', err2);
    });
    */

    db.query(fetchVisitorQuery, [phone, email], (err3, visitorResults) => {
      if (err3) {
        console.error('DB error fetching visitor info:', err3);
        return res.status(500).json({ message: 'DB error fetching visitor info', error: err3 });
      }

      if (!visitorResults.length) {
        console.warn('No active appointment found for this visitor');
        return res.status(404).json({ message: 'No active appointment found for this visitor' });
      }

      const data = visitorResults[0];
      logger.debug('Visitor data fetched for OTP verification');

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const imageUrl = data.image ? `${baseUrl}/uploads/${data.image}` : null;

      res.status(200).json({
        visitor_name: `${data.first_name} ${data.last_name}`,
        appointment_id: data.appointment_id,
        image: imageUrl,
        whom_to_meet: data.whom_to_meet,
        purpose: data.purpose,
        phone: data.phone,
        address: data.address,
        qr_code: data.qr_code
      });
    });
  });
};


