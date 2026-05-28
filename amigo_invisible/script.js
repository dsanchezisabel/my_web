// ==========================================
// 1. CONFIGURACIÓN EXTERNA (RELLENAR)
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyDDMpo9zKJvsbHPyj6bdGV3qowLiJ2ll1M",
    authDomain: "amigo-invisible-82e6e.firebaseapp.com",
    databaseURL: "https://amigo-invisible-82e6e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "amigo-invisible-82e6e",
    storageBucket: "amigo-invisible-82e6e.firebasestorage.app",
    messagingSenderId: "345366299218",
    appId: "1:345366299218:web:059a1b504185129ce1958b",
    measurementId: "G-JLB321W95K"
  };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Configuración EmailJS
const EMAILJS_PUBLIC_KEY = "bKHdjuO4n97yQQdfG";
const EMAILJS_SERVICE_ID = "service_i7na7xb";
const EMAILJS_TEMPLATE_ID = "template_wnki7zn";
const EMAILJS_TXT_TEMPLATE_ID = "template_2t5i2xu";
emailjs.init(EMAILJS_PUBLIC_KEY);

// Tu web final en GitHub
const URL_WEB = "https://tu-usuario.github.io/tu-repo/index.html";

// ==========================================
// 2. UTILIDADES GLOBALES
// ==========================================

async function hashPassword(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generarToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

function mostrarAlerta(id, mensaje, tipo = 'error') {
    const caja = document.getElementById(id);
    caja.className = `alert alert-${tipo}`;
    caja.innerText = mensaje;
    caja.classList.remove('oculto');
    setTimeout(() => caja.classList.add('oculto'), 5000);
}

// ==========================================
// 3. LÓGICA DE PÁGINAS (RUTAS VIRTUALES)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // --- PÁGINA: LOGIN ---
    if (document.getElementById('page-login')) {
        
        db.ref('admin_pwd').once('value').then(async (snapshot) => {
            if (!snapshot.exists()) {
                const defaultHash = await hashPassword("MiAdminPassword123");
                db.ref('admin_pwd').set(defaultHash);
            }
        });

        document.getElementById('form-login').addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwd = document.getElementById('login-password').value.trim();
            const pwdHash = await hashPassword(pwd);
            const pwdUpperHash = await hashPassword(pwd.toUpperCase());

            // Check Admin
            const adminSnap = await db.ref('admin_pwd').once('value');
            if (adminSnap.val() === pwdHash) {
                sessionStorage.setItem('admin_logeado', 'true');
                window.location.href = 'admin.html';
                return;
            }

            // Check Participante
            const partsSnap = await db.ref('participantes').once('value');
            if (partsSnap.exists()) {
                const participantes = partsSnap.val();
                for (let emailKey in participantes) {
                    if (participantes[emailKey].token_hash === pwdUpperHash) {
                        sessionStorage.setItem('participante_email', emailKey);
                        window.location.href = 'participante.html';
                        return;
                    }
                }
            }
            mostrarAlerta('mensaje-error', 'Contraseña incorrecta.', 'error');
        });
    }

    // --- PÁGINA: ADMINISTRADOR ---
    if (document.getElementById('page-admin')) {
        if (sessionStorage.getItem('admin_logeado') !== 'true') {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('page-admin').style.display = 'block';

        db.ref('participantes').on('value', (snapshot) => {
            const tbody = document.getElementById('tabla-usuarios');
            tbody.innerHTML = '';
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                let sorteoHecho = false;

                for (let email in data) {
                    const p = data[email];
                    if (p.amigo_invisible) sorteoHecho = true;

                    const tr = document.createElement('tr');
                    const textoExcepcion = p.excepcion ? p.excepcion.replace(/,/g, '.') : '-';
                    
                    tr.innerHTML = `
                        <td><strong>${p.nombre}</strong></td>
                        <td style="color: var(--text-muted);">${email.replace(/,/g, '.')}</td>
                        <td style="color: var(--warning); font-size: 0.85rem;">${textoExcepcion}</td>
                        <td>${p.completado ? '<span class="badge badge-ready">Listo</span>' : '<span class="badge badge-pending">Pendiente</span>'}</td>
                    `;
                    tbody.appendChild(tr);
                }

                if (sorteoHecho) {
                    document.getElementById('caja-post-sorteo').classList.remove('oculto');
                    if(document.getElementById('msg-post-sorteo-pendiente')) document.getElementById('msg-post-sorteo-pendiente').classList.add('oculto');
                } else {
                    document.getElementById('caja-post-sorteo').classList.add('oculto');
                    if(document.getElementById('msg-post-sorteo-pendiente')) document.getElementById('msg-post-sorteo-pendiente').classList.remove('oculto');
                }

            } else {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay participantes todavía.</td></tr>';
                document.getElementById('caja-post-sorteo').classList.add('oculto');
                if(document.getElementById('msg-post-sorteo-pendiente')) document.getElementById('msg-post-sorteo-pendiente').classList.remove('oculto');
            }
        });

        document.getElementById('form-add-user').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('add-nombre').value;
            const email = document.getElementById('add-email').value.replace(/\./g, ',');
            
            let excepcion = document.getElementById('add-excepcion').value.trim();
            if (excepcion) excepcion = excepcion.replace(/\./g, ',');

            const snap = await db.ref('participantes/' + email).once('value');
            if (snap.exists()) {
                return mostrarAlerta('alerta-sistema', '¡Error: Ese correo ya está en la lista!', 'error');
            }
            
            db.ref('participantes/' + email).set({
                nombre: nombre, token_hash: "", amigo_invisible: "",
                link: "", talla: "", anotaciones: "", completado: false,
                excepcion: excepcion 
            });
            e.target.reset();
            mostrarAlerta('alerta-sistema', 'Participante añadido.', 'success');
        });

        document.getElementById('btn-sorteo').addEventListener('click', async () => {
            if (!confirm("🎁 ¿Realizar el sorteo ahora?\nEsto enviará los correos y fijará las parejas.")) return;
            
            const snap = await db.ref('participantes').once('value');
            if (!snap.exists()) return alert("No hay participantes.");
            
            const participantes = snap.val();
            const emails = Object.keys(participantes);
            if (emails.length < 2) return alert("Faltan participantes.");

            let receptores = [...emails];
            let exito = false;
            let maxIntentos = 1000; 

            // 1er INTENTO: Sorteo teniendo en cuenta las excepciones
            for (let intento = 0; intento < maxIntentos; intento++) {
                receptores.sort(() => Math.random() - 0.5);
                let valido = true;
                
                for (let i = 0; i < emails.length; i++) {
                    const donante = emails[i];
                    const receptor = receptores[i];
                    const excepcionDonante = participantes[donante].excepcion || "";

                    // Falla si se regala a sí mismo o a su excepción
                    if (donante === receptor || excepcionDonante === receptor) {
                        valido = false;
                        break; 
                    }
                }
                
                if (valido) {
                    exito = true; 
                    break;
                }
            }

            // 2do INTENTO (POP-UP DE EMERGENCIA): Si el 1er intento falló
            if (!exito) {
                const forzarSorteo = confirm("⚠️ ¡Imposible cuadrar el sorteo!\n\nLas excepciones que has puesto forman un bloqueo matemático.\n\n¿Quieres REALIZAR EL SORTEO DE TODAS FORMAS ignorando las reglas de excepciones?");
                
                if (forzarSorteo) {
                    // Sorteo básico: solo comprobamos que nadie se regale a sí mismo
                    while (true) {
                        receptores.sort(() => Math.random() - 0.5);
                        if (emails.every((donante, i) => donante !== receptores[i])) {
                            break;
                        }
                    }
                } else {
                    // Si el usuario dice que NO, cancelamos el proceso y no enviamos nada
                    return mostrarAlerta('alerta-sistema', 'Sorteo cancelado para que revises las excepciones.', 'warning');
                }
            }

            // Si llegamos aquí (ya sea por éxito a la primera o por forzarlo), enviamos los correos
            for (let i = 0; i < emails.length; i++) {
                const donante = emails[i];
                const receptor = receptores[i];
                const tokenPlano = generarToken();
                const hash = await hashPassword(tokenPlano);

                participantes[donante].amigo_invisible = participantes[receptor].nombre;
                participantes[donante].token_hash = hash;
                
                db.ref('participantes/' + donante).update({
                    amigo_invisible: participantes[receptor].nombre,
                    token_hash: hash
                });

                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_email: donante.replace(/,/g, '.'),
                    to_name: participantes[donante].nombre,
                    url_web: URL_WEB,
                    token: tokenPlano
                });
            }
            mostrarAlerta('alerta-sistema', '¡Sorteo realizado y correos enviados!', 'success');
        });

        document.getElementById('btn-descargar-txt').addEventListener('click', async () => {
            const snap = await db.ref('participantes').once('value');
            const data = snap.val();
            let txt = "=== RESULTADOS DEL AMIGO INVISIBLE ===\n\n";
            for (let email in data) {
                const p = data[email];
                txt += `Participante: ${p.nombre} (${email.replace(/,/g, '.')})\nLe regala a: ${p.amigo_invisible}\nLink: ${p.link || 'N/A'}\nTalla: ${p.talla || 'N/A'}\nAnotaciones: \n${p.anotaciones || 'N/A'}\n----------------------------------------\n`;
            }
            
            const blob = new Blob([txt], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'resultados_amigo_invisible.txt';
            a.click();
        });

        document.getElementById('form-change-pwd').addEventListener('submit', async (e) => {
            e.preventDefault();
            const p1 = document.getElementById('new-pwd').value;
            const p2 = document.getElementById('confirm-pwd').value;
            if (p1 !== p2) return mostrarAlerta('alerta-sistema', 'Las contraseñas no coinciden.', 'error');
            
            const newHash = await hashPassword(p1);
            db.ref('admin_pwd').set(newHash);
            mostrarAlerta('alerta-sistema', 'Contraseña actualizada.', 'success');
            e.target.reset();
        });

        document.getElementById('form-regenerar-pwd').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email-regenerar').value.replace(/\./g, ',');
            const snap = await db.ref('participantes/' + email).once('value');
            
            if (snap.exists()) {
                const nuevoToken = generarToken();
                const nuevoHash = await hashPassword(nuevoToken);
                db.ref('participantes/' + email + '/token_hash').set(nuevoHash);
                
                const containerPwd = document.getElementById("alerta-pwd-temporal");
                document.getElementById('pwd-generada').innerText = nuevoToken;
                containerPwd.classList.remove('oculto');
                containerPwd.style.opacity = "1";
                containerPwd.style.transform = "scale(1)";
                
                let tiempo = 10;
                document.getElementById("contador").innerText = tiempo;
                const intervalo = setInterval(() => {
                    tiempo--;
                    document.getElementById("contador").innerText = tiempo;
                    if (tiempo <= 0) {
                        clearInterval(intervalo);
                        containerPwd.style.transition = "all 0.5s ease";
                        containerPwd.style.opacity = "0";
                        containerPwd.style.transform = "scale(0.9)";
                        setTimeout(() => containerPwd.classList.add('oculto'), 500);
                    }
                }, 1000);
            } else {
                mostrarAlerta('alerta-sistema', 'Correo no encontrado.', 'error');
            }
            e.target.reset();
        });

        document.getElementById('form-reset').addEventListener('submit', (e) => {
            e.preventDefault();
            if (confirm("⚠️ ¡PELIGRO!\n¿Seguro que quieres borrar todo el sorteo?")) {
                db.ref('participantes').remove();
                mostrarAlerta('alerta-sistema', 'Sistema limpiado.', 'success');
            }
        });

        document.getElementById('btn-logout').addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });

        document.getElementById('btn-toggle-email').addEventListener('click', () => {
            const caja = document.getElementById('caja-email-responsable');
            caja.classList.toggle('oculto');
        });

        const formEnviarTxt = document.getElementById('form-enviar-txt');
        if (formEnviarTxt) {
            formEnviarTxt.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailResponsable = document.getElementById('email-responsable').value;
                const botonEnviar = e.target.querySelector('button');
                const textoOriginal = botonEnviar.innerText;
                
                botonEnviar.innerText = "Enviando...";
                botonEnviar.disabled = true;

                const snap = await db.ref('participantes').once('value');
                const data = snap.val();
                let textoResultados = "========================================\n\n";
                
                for (let email in data) {
                    const p = data[email];
                    textoResultados += `Participante: ${p.nombre} (${email.replace(/,/g, '.')})\n`;
                    textoResultados += `Link: ${p.link || 'N/A'}\n`;
                    textoResultados += `Talla: ${p.talla || 'N/A'}\n`;
                    textoResultados += `Anotaciones: \n${p.anotaciones || 'N/A'}\n`;
                    textoResultados += `----------------------------------------\n`;
                }

                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TXT_TEMPLATE_ID, {
                    to_email: emailResponsable,
                    resultados: textoResultados
                }).then(() => {
                    mostrarAlerta('alerta-sistema', `Resultados enviados a ${emailResponsable}`, 'success');
                    document.getElementById('caja-email-responsable').classList.add('oculto');
                    e.target.reset(); 
                }).catch((error) => {
                    console.error("Error al enviar:", error);
                    mostrarAlerta('alerta-sistema', 'Error al enviar el correo.', 'error');
                }).finally(() => {
                    botonEnviar.innerText = textoOriginal;
                    botonEnviar.disabled = false;
                });
            });
        }
    }

    // --- PÁGINA: PARTICIPANTE ---
    if (document.getElementById('page-participante')) {
        const pEmail = sessionStorage.getItem('participante_email');
        if (!pEmail) {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('page-participante').style.display = 'block';

        function actualizarVistaDatos(data) {
            document.getElementById('res-link').innerText = data.link || "No especificado";
            document.getElementById('res-talla').innerText = data.talla || "No especificada";
            document.getElementById('res-anotaciones').innerText = data.anotaciones || "Ninguna";
        }

        db.ref('participantes/' + pEmail).once('value').then((snap) => {
            const data = snap.val();
            document.getElementById('nombre-usuario').innerText = data.nombre;
            document.getElementById('nombre-receptor').innerText = data.amigo_invisible.toUpperCase();
            
            document.getElementById('pref-link').value = "";
            document.getElementById('pref-talla').value = "";
            document.getElementById('pref-anotaciones').value = "- Nombre: \n- Número: \n- Otras anotaciones: ";
            
            if (data.completado) {
                actualizarVistaDatos(data);
                document.getElementById('zona-datos-guardados').classList.remove('oculto');
            }
        });

        document.getElementById('form-datos-regalo').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const linkVal = document.getElementById('pref-link').value;
            const tallaVal = document.getElementById('pref-talla').value;
            const anotacionesVal = document.getElementById('pref-anotaciones').value;

            db.ref('participantes/' + pEmail).update({
                link: linkVal,
                talla: tallaVal,
                anotaciones: anotacionesVal,
                completado: true
            }).then(() => {
                mostrarAlerta('alerta-guardado', '¡Tus datos han sido guardados!', 'success');
                
                actualizarVistaDatos({ link: linkVal, talla: tallaVal, anotaciones: anotacionesVal });
                document.getElementById('zona-datos-guardados').classList.remove('oculto');

                document.getElementById('pref-link').value = "";
                document.getElementById('pref-talla').value = "";
                document.getElementById('pref-anotaciones').value = "- Nombre: \n- Número: \n- Otras anotaciones: "; 
            });
        });

        document.getElementById('btn-toggle-datos').addEventListener('click', () => {
            const caja = document.getElementById('caja-datos-guardados');
            const boton = document.getElementById('btn-toggle-datos');
            
            if (caja.classList.contains('oculto')) {
                caja.classList.remove('oculto');
                boton.innerText = "👁️ Ocultar mis datos guardados ▲";
            } else {
                caja.classList.add('oculto');
                boton.innerText = "👁️ Ver mis últimos datos guardados ▼";
            }
        });

        document.getElementById('btn-logout-part').addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
});