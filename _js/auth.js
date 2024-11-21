import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

const supabaseUrl = 'https://qxnvxkfvypqnaqmuhsrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnZ4a2Z2eXBxbmFxbXVoc3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0MjY5NzAsImV4cCI6MjAyMzAwMjk3MH0.Yx0eLKUiB-vfWF8P8hy_v-5HqVuDqR_rY5X5H_Gjxwk';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        redirectTo: 'https://measureappcl.github.io/Measure-App/dashboard.html',
        persistSession: true,
        detectSessionInUrl: true
    }
});

async function signInWithEmail() {
    try {
        console.log('Iniciando proceso de login...');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('Intentando login con:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Error de login:', error);
            throw error;
        }

        console.log('Login exitoso:', data);
        window.location.href = 'https://measureappcl.github.io/Measure-App/dashboard.html';

    } catch (error) {
        console.error('Error en signInWithEmail:', error.message);
        alert(error.message);
    }
}

async function signUpWithEmail() {
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('Iniciando registro con:', email);
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: 'https://measureappcl.github.io/Measure-App/dashboard.html'
            }
        });

        if (error) throw error;

        alert('Registro exitoso. Por favor verifica tu email para confirmar la cuenta.');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error en registro:', error.message);
        alert(error.message);
    }
}

// Verificar sesión al cargar
window.addEventListener('load', async () => {
    console.log('Verificando sesión...');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Sesión actual:', session);
    if (error) console.error('Error al verificar sesión:', error);
});