// sendEmail.js
const sgMail = require('@sendgrid/mail');

// Configura tu API Key de SendGrid
sgMail.setApiKey('TU_API_KEY_DE_SENDGRID');

async function sendQuestionnaireEmail(senderEmail, recipientEmail, questionnaireUrl) {
    // El email remitente debe estar verificado en SendGrid
    const msg = {
        to: recipientEmail,
        from: 'tu_email_verificado@tudominio.com', // IMPORTANTE: Usa un email verificado en SendGrid
        subject: 'Cuestionario GAD-7 - Evaluación de Ansiedad',
        text: `Se le ha enviado un cuestionario GAD-7 para evaluar niveles de ansiedad. Por favor, haga clic en el siguiente enlace para completarlo: ${questionnaireUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2b6cb0;">Cuestionario GAD-7</h1>
                <p>Estimado/a paciente:</p>
                <p>Se le ha enviado un cuestionario GAD-7 para evaluar niveles de ansiedad.</p>
                <p>Por favor, haga clic en el siguiente botón para completar el cuestionario:</p>
                <a href="${questionnaireUrl}" 
                   style="display: inline-block; 
                          background-color: #2b6cb0; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 4px; 
                          margin: 16px 0;">
                    Completar Cuestionario
                </a>
                <p>Si el botón no funciona, puede copiar y pegar este enlace en su navegador:</p>
                <p>${questionnaireUrl}</p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Email enviado exitosamente a ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw error;
    }
}

module.exports = sendQuestionnaireEmail;
