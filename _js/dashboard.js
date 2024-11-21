import { supabase } from './auth.js';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Verificar autenticación al cargar la página
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = './index.html';
        return null;
    }
    return user;
}

// Agregar función de logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = './index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user) return;

    // Mostrar email del usuario
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }

    // Cargar lista de pacientes y respuestas
    await loadPatientResponses();

    // Configurar el formulario de envío de cuestionarios
    setupQuestionnaireForm();

    // Configurar el botón de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

async function loadPatientResponses() {
    try {
        const { data: responses, error } = await supabase
            .from('respuestas_pacientes')
            .select(`
                id,
                paciente_id,
                cuestionario_id,
                puntaje_total,
                fecha_respuesta,
                pacientes (
                    nombre,
                    apellido,
                    email
                )
            `)
            .order('fecha_respuesta', { ascending: false });

        if (error) throw error;

        const patientList = document.getElementById('patient-list');
        if (!patientList) return;

        patientList.innerHTML = '';

        responses.forEach(response => {
            const responseDiv = document.createElement('div');
            responseDiv.classList.add('response-entry');
            responseDiv.innerHTML = `
                <div class="p-4 border rounded mb-4 shadow-sm">
                    <h3 class="font-bold">${response.pacientes.nombre} ${response.pacientes.apellido}</h3>
                    <p>Email: ${response.pacientes.email}</p>
                    <p>Cuestionario: ${response.cuestionario_id}</p>
                    <p>Puntaje Total: ${response.puntaje_total}</p>
                    <p>Fecha: ${new Date(response.fecha_respuesta).toLocaleDateString()}</p>
                </div>
            `;
            patientList.appendChild(responseDiv);
        });
    } catch (error) {
        console.error("Error al cargar respuestas:", error);
        alert("Error al cargar las respuestas de los pacientes");
    }
}

function setupQuestionnaireForm() {
    const form = document.getElementById('send-questionnaire-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const patientEmail = document.getElementById('patient-email').value;
        
        try {
            // Usar la nueva función enviarCuestionario
            await enviarCuestionario(patientEmail, 'GAD-7');
            form.reset();
        } catch (error) {
            console.error("Error al enviar cuestionario:", error);
            alert("Error al enviar el cuestionario");
        }
    });
}

async function enviarCuestionario(emailPaciente, tipoCuestionario) {
    try {
        // Generar token y guardar en BD
        const token = generateUUID();
        const { error: dbError } = await supabase
            .from('cuestionarios_pendientes')
            .insert([{
                email_paciente: emailPaciente,
                token: token,
                tipo_cuestionario: tipoCuestionario,
                completado: false
            }]);

        if (dbError) throw dbError;

        // Construir el link
        const linkCuestionario = `${window.location.origin}/patient_form.html?token=${token}`;
        
        // Enviar el correo usando la función Edge
        const { data, error: emailError } = await supabase.functions.invoke(
            'send-email',
            {
                body: {
                    to: emailPaciente,
                    subject: 'Cuestionario de Salud Mental',
                    html: `
                        <h2>Cuestionario de Salud Mental</h2>
                        <p>Se le ha asignado un cuestionario para completar.</p>
                        <p>Por favor, haga clic en el siguiente enlace para acceder al cuestionario:</p>
                        <a href="${linkCuestionario}">Completar Cuestionario</a>
                        <p>Este enlace expirará en 24 horas.</p>
                    `
                }
            }
        );

        if (emailError) throw emailError;
        alert('Cuestionario enviado correctamente');

    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar el cuestionario: ' + error.message);
    }
}