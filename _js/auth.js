import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

const supabaseUrl = 'https://qxnvxkfvypqnaqmuhsrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnZ4a2Z2eXBxbmFxbXVoc3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1MTM4OTUsImV4cCI6MjA0NjA4OTg5NX0.D2xBn_WBiT2sDglpMltHPulKzNJczZQQHVq3zbdnVho';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo buscar el formulario si estamos en la página de login
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                const loginButton = document.getElementById('login-button');
                if (loginButton) {
                    loginButton.disabled = true;
                }

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (error) {
                        throw error;
                    }

                    alert("Inicio de sesión exitoso");
                    window.location.href = './dashboard.html';
                } catch (error) {
                    console.error("Error de inicio de sesión:", error);
                    const errorDiv = document.getElementById('login-error');
                    if (errorDiv) {
                        errorDiv.textContent = "Error: " + error.message;
                    }
                } finally {
                    if (loginButton) {
                        loginButton.disabled = false;
                    }
                }
            });
        } else {
            console.error('No se encontró el formulario de login');
        }
    }
});