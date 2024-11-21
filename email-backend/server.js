// server.js
const express = require('express');
const cors = require('cors');
const sendQuestionnaireEmail = require('./sendEmail');

const app = express();
const PORT = 3000;

// Configurar CORS
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Configuración para analizar JSON en el cuerpo de las solicitudes
app.use(express.json());

// Endpoint para enviar correos electrónicos
app.post('/send-email', async (req, res) => {
    const { recipientEmail, questionnaireUrl } = req.body;

    try {
        console.log('Intentando enviar email a:', recipientEmail);
        await sendQuestionnaireEmail('tu-email@ejemplo.com', recipientEmail, questionnaireUrl);
        console.log('Email enviado exitosamente');
        res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
        console.error("Error en el envío de correo:", error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
