// Configuración de Supabase
const SUPABASE_URL = 'https://qxnvxkfvypqnaqmuhsrj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnZ4a2Z2eXBxbmFxbXVoc3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1MTM4OTUsImV4cCI6MjA0NjA4OTg5NX0.D2xBn_WBiT2sDglpMltHPulKzNJczZQQHVq3zbdnVho';

// Crear el cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Esperar a que el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Documento cargado');
    const accessForm = document.getElementById('access-form');
    if (accessForm) {
        accessForm.addEventListener('submit', handleAccessForm);
    }
});

// Función para manejar el formulario de acceso
async function handleAccessForm(event) {
    event.preventDefault();
    try {
        const rut = document.getElementById('rut').value;
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const email = document.getElementById('email').value;

        console.log("Intentando acceder al cuestionario con RUT:", rut);

        // Verificar si el paciente ya está registrado
        let { data: patient, error } = await supabase
            .from('pacientes')
            .select('rut')
            .eq('rut', rut)
            .single();

        if (error && error.code === 'PGRST116') {
            // Registrar nuevo paciente
            const { data, error: insertError } = await supabase
                .from('pacientes')
                .insert([{ 
                    rut, 
                    nombre, 
                    apellido, 
                    email 
                }])
                .select()
                .single();

            if (insertError) throw insertError;
            patient = data;
        } else if (error) {
            throw error;
        }

        // Mostrar el cuestionario
        document.getElementById('access-form').style.display = 'none';
        document.getElementById('questionnaire-section').style.display = 'block';
        await loadQuestionnaire();
        
    } catch (error) {
        console.error("Error al procesar el formulario:", error);
        alert("Error al procesar el formulario. Por favor, intenta de nuevo.");
    }
}

// Función para cargar el cuestionario
async function loadQuestionnaire() {
    try {
        const { data: questionnaire, error } = await supabase
            .from('cuestionarios')
            .select('*')
            .eq('id', 'GAD-7')
            .single();

        if (error) throw error;

        const questions = questionnaire.preguntas.preguntas;
        let questionnaireHtml = `
            <h2 class="text-xl font-bold mb-4">Cuestionario GAD-7</h2>
            <p class="mb-6">Durante las últimas 2 semanas, ¿con qué frecuencia ha tenido los siguientes problemas?</p>
        `;

        // Opciones fijas para todas las preguntas
        const opciones = [
            { valor: 0, texto: "Nunca" },
            { valor: 1, texto: "Varios días" },
            { valor: 2, texto: "Más de la mitad de los días" },
            { valor: 3, texto: "Casi todos los días" }
        ];

        // Construir el HTML para cada pregunta
        for (let question of questions) {
            questionnaireHtml += `
                <div class="mb-6 p-4 bg-white rounded shadow">
                    <p class="mb-3 font-medium">${question.id}. ${question.texto}</p>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            `;

            // Agregar las opciones para cada pregunta
            for (let option of opciones) {
                questionnaireHtml += `
                    <label class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <input type="radio" 
                               name="q${question.id}" 
                               value="${option.valor}" 
                               required 
                               class="form-radio text-blue-600">
                        <span>${option.texto}</span>
                    </label>
                `;
            }

            questionnaireHtml += `
                    </div>
                </div>
            `;
        }

        questionnaireHtml += `
            <div class="mt-6">
                <button type="submit" 
                        class="w-full md:w-auto bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
                    Enviar Respuestas
                </button>
            </div>
        `;

        const form = document.getElementById('questionnaire-form');
        form.innerHTML = questionnaireHtml;
        form.addEventListener('submit', handleQuestionnaireSubmit);

    } catch (error) {
        console.error("Error al cargar el cuestionario:", error);
        alert("Error al cargar el cuestionario");
    }
}

// Función para manejar el envío del formulario
async function handleQuestionnaireSubmit(event) {
    event.preventDefault();
    try {
        const rut = document.getElementById('rut').value;
        const responses = {};
        let totalScore = 0;

        // Recoger todas las respuestas
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            const questionId = input.name.replace('q', '');
            const value = parseInt(input.value);
            responses[questionId] = value;
            totalScore += value;
        });

        // Verificar que todas las preguntas fueron respondidas
        if (Object.keys(responses).length !== 7) {
            alert("Por favor, responde todas las preguntas.");
            return;
        }

        // Guardar las respuestas
        const { error } = await supabase
            .from('respuestas_pacientes')
            .insert([{
                paciente_id: rut,
                cuestionario_id: 'GAD-7',
                puntaje_total: totalScore,
                respuestas: responses
            }]);

        if (error) throw error;

        // Mostrar mensaje con interpretación del puntaje
        let interpretacion = "";
        if (totalScore >= 0 && totalScore <= 4) {
            interpretacion = "No se sugiere ansiedad";
        } else if (totalScore >= 5 && totalScore <= 9) {
            interpretacion = "Se sugiere ansiedad leve";
        } else if (totalScore >= 10 && totalScore <= 14) {
            interpretacion = "Se sugiere ansiedad moderada";
        } else {
            interpretacion = "Se sugiere ansiedad severa";
        }

        alert(`Cuestionario completado.\nPuntaje total: ${totalScore}\n${interpretacion}`);
        window.location.href = 'thank_you.html';

    } catch (error) {
        console.error("Error al enviar respuestas:", error);
        alert("Error al enviar las respuestas. Por favor, intenta de nuevo.");
    }
}