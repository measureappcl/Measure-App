import { supabase } from './auth.js';

console.log("cuestionario.js cargado correctamente")

// Formulario de datos personales
const patientInfoForm = document.getElementById('patient-info-form')
const questionnaireForm = document.getElementById('questionnaire-form')

// Manejo del envío del formulario de datos del paciente
patientInfoForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    try {
        const rut = document.getElementById('rut').value
        const name = document.getElementById('name').value
        const email = document.getElementById('email').value

        // Guardar en la tabla de pacientes
        const { data, error } = await supabase
            .from('pacientes')
            .upsert([{ 
                rut, 
                nombre: name, 
                email 
            }], {
                onConflict: 'rut'
            })

        if (error) throw error

        // Enviar email al paciente
        await sendPatientEmail(email, name)

        patientInfoForm.style.display = 'none'
        questionnaireForm.style.display = 'block'
        
    } catch (error) {
        console.error("Error al guardar datos del paciente:", error)
        alert("Hubo un error al guardar tus datos. Por favor, intenta de nuevo.")
    }
})

// Función para enviar email al paciente
async function sendPatientEmail(email, name) {
    try {
        const { data, error } = await supabase.functions.invoke('send-patient-email', {
            body: JSON.stringify({
                email,
                name,
                questionnaire: 'GAD-7'
            })
        })
        
        if (error) throw error
        
        console.log('Email enviado exitosamente')
    } catch (error) {
        console.error('Error al enviar email:', error)
    }
}

// Manejo del envío del cuestionario
questionnaireForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    try {
        const rut = document.getElementById('rut').value
        const responses = {}
        
        // Obtener todas las respuestas
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            responses[input.name] = parseInt(input.value)
        })

        const puntajeTotal = Object.values(responses).reduce((total, num) => total + num, 0)

        const { error } = await supabase
            .from('respuestas_pacientes')
            .insert([{ 
                paciente_id: rut, 
                cuestionario_id: 'GAD-7', 
                puntaje_total: puntajeTotal, 
                respuestas: responses, 
                fecha_respuesta: new Date().toISOString() 
            }])

        if (error) throw error

        alert("Respuestas enviadas con éxito.")
        window.location.href = 'thank_you.html'
        
    } catch (error) {
        console.error("Error al guardar respuestas:", error)
        alert("Hubo un error al guardar las respuestas. Por favor, intenta de nuevo.")
    }
})