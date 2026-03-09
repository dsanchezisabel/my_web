document.addEventListener('DOMContentLoaded', () => {

    let globalProyectos = [];
    let globalNoticias = [];
    let filtroActualProyectos = 'todos';
    let idiomaActual = localStorage.getItem('idioma') || 'es';
    const btnLang = document.getElementById('btn-lang');

    // --- 0. FOOTER DINÁMICO ---
    const footerDinamico = document.getElementById('footer-dinamico');
    const anioActual = new Date().getFullYear(); 
    if (footerDinamico) {
        footerDinamico.innerHTML = `
            <div class="redes-sociales">
                <a href="https://www.linkedin.com/in/david-sánchez-isabel-465344328/" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>
                <span class="separador">|</span>
                <a href="https://github.com/dsanchezisabel" target="_blank"><i class="fab fa-github"></i> GitHub</a>
                <span class="separador">|</span>
                <a href="https://www.canva.com/design/DAGAPXdz9eE/WstU_wM81Um85RzlSsXfgw/view" target="_blank"><i class="fas fa-file-alt"></i> CV</a>
            </div>
            <ul class="enlaces-legales">
                <li><a href="politica.html" data-i18n="footer_legal">Política de la web</a></li>
            </ul>
            <p>&copy; ${anioActual} David Sánchez Isabel. <span data-i18n="footer_derechos">Todos los derechos reservados.</span></p>
        `;
    }

    // --- 1. ANIMACIÓN SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('mostrar'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.oculto').forEach((el) => observer.observe(el));

    // --- 2. MENÚ DESPLEGABLE ---
    const menuBtn = document.getElementById('menu-btn');
    const dropdownContent = document.getElementById('nav-links');
    const iconChevron = menuBtn ? menuBtn.querySelector('i') : null;

    if (menuBtn && dropdownContent) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dropdownContent.classList.toggle('show');
            if(iconChevron) iconChevron.style.transform = dropdownContent.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
        });
        dropdownContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => { dropdownContent.classList.remove('show'); if(iconChevron) iconChevron.style.transform = 'rotate(0deg)'; });
        });
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.classList.remove('show');
                if(iconChevron) iconChevron.style.transform = 'rotate(0deg)';
            }
        });
    }

    // --- 3. MODO OSCURO ---
    const btnTema = document.getElementById('btn-tema');
    const body = document.body;
    const iconTema = btnTema ? btnTema.querySelector('i') : null;

    if (localStorage.getItem('dark-theme') === 'true') {
        body.classList.add('dark-theme');
        if (iconTema) iconTema.classList.replace('fa-moon', 'fa-sun');
    }
    if (btnTema && iconTema) {
        btnTema.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            localStorage.setItem('dark-theme', body.classList.contains('dark-theme'));
            if (body.classList.contains('dark-theme')) iconTema.classList.replace('fa-moon', 'fa-sun');
            else iconTema.classList.replace('fa-sun', 'fa-moon');
        });
    }

    // --- 4. EVENTOS DE SCROLL (HEADER, BARRA PROGRESO Y BOTÓN FLOTANTE) ---
    const header = document.getElementById('header-principal');
    const barraProgreso = document.getElementById('barra-progreso');
    const btnFlotante = document.getElementById('btn-flotante');

    window.addEventListener('scroll', () => {
        // Efecto del Header
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');

        // Calcular porcentaje para la barra de progreso
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        if (barraProgreso) barraProgreso.style.width = scrollPercent + '%';

        // Mostrar u ocultar botón flotante
        if (btnFlotante) {
            if (window.scrollY > 300) btnFlotante.classList.add('visible');
            else btnFlotante.classList.remove('visible');
        }
    });

    // Acción del botón flotante para subir
    if (btnFlotante) {
        btnFlotante.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 5. JSON: NOTICIAS ---
    const contenedorNoticias = document.getElementById('contenedor-noticias'); 
    const contenedorNoticiasIndex = document.getElementById('contenedor-ultimas-noticias'); 

    if (contenedorNoticias || contenedorNoticiasIndex) {
        fetch('noticias.json')
            .then(res => {
                if (!res.ok) throw new Error('No se encontró noticias.json');
                return res.json();
            })
            .then(noticias => {
                globalNoticias = noticias;
                if (contenedorNoticias) renderizarNoticias(globalNoticias, contenedorNoticias, idiomaActual);
                if (contenedorNoticiasIndex) renderizarNoticias(globalNoticias.slice(0, 2), contenedorNoticiasIndex, idiomaActual);
            })
            .catch(err => {
                console.error("Error en noticias JSON:", err);
                const msj = `<p style="color: #ef4444; width: 100%; text-align: center;"><i class="fas fa-exclamation-triangle"></i> Error al cargar noticias.json o bloqueo local.</p>`;
                if (contenedorNoticias) contenedorNoticias.innerHTML = msj;
                if (contenedorNoticiasIndex) contenedorNoticiasIndex.innerHTML = msj;
            });
    }

    function renderizarNoticias(arrayNoticias, contenedor, lang) {
        contenedor.innerHTML = ''; 
        if (arrayNoticias.length === 0) return;
        arrayNoticias.forEach(n => {
            const tit = n['titulo_' + lang] || 'Título no disponible';
            const desc = n['descripcion_' + lang] || 'Descripción no disponible';
            const textLnk = n['textoEnlace_' + lang] || 'Ver más';
            
            contenedor.innerHTML += `
                <div class="tarjeta-proyecto" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
                    <h3>${tit}</h3>
                    <p>${desc}</p>
                    <a href="${n.enlace}" target="_blank" class="enlace-proyecto">${textLnk}</a>
                </div>`;
        });
        if(typeof VanillaTilt !== 'undefined') VanillaTilt.init(contenedor.querySelectorAll(".tarjeta-proyecto"));
    }

    // --- 6. JSON: PROYECTOS Y FILTROS ---
    const contenedorProyectos = document.getElementById('contenedor-proyectos'); 
    const contenedorProyectosIndex = document.getElementById('contenedor-proyectos-index'); 
    const botonesFiltro = document.querySelectorAll('.btn-filtro');

    if (contenedorProyectos || contenedorProyectosIndex) {
        fetch('proyectos.json')
            .then(res => {
                if (!res.ok) throw new Error('No se encontró proyectos.json');
                return res.json();
            })
            .then(proyectos => {
                globalProyectos = proyectos;
                if (contenedorProyectos) {
                    renderizarProyectos(globalProyectos, filtroActualProyectos, contenedorProyectos, idiomaActual);
                    botonesFiltro.forEach(btn => {
                        btn.addEventListener('click', () => {
                            botonesFiltro.forEach(b => b.classList.remove('activo'));
                            btn.classList.add('activo');
                            filtroActualProyectos = btn.getAttribute('data-filtro');
                            renderizarProyectos(globalProyectos, filtroActualProyectos, contenedorProyectos, idiomaActual);
                        });
                    });
                }
                if (contenedorProyectosIndex) {
                    renderizarProyectos(globalProyectos.filter(p => p.destacado), 'todos', contenedorProyectosIndex, idiomaActual);
                }
            })
            .catch(err => {
                console.error("Error en proyectos JSON:", err);
                const msj = `<p style="color: #ef4444; width: 100%; text-align: center;"><i class="fas fa-exclamation-triangle"></i> Error al cargar proyectos.json o bloqueo local.</p>`;
                if (contenedorProyectos) contenedorProyectos.innerHTML = msj;
                if (contenedorProyectosIndex) contenedorProyectosIndex.innerHTML = msj;
            });
    }

    function renderizarProyectos(arrayProyectos, filtroActual, contenedor, lang) {
        contenedor.innerHTML = ''; 
        const filtrados = filtroActual === 'todos' ? arrayProyectos : arrayProyectos.filter(p => p.categoria === filtroActual);
        if (filtrados.length === 0) return;
        filtrados.forEach(p => {
            const tit = p['titulo_' + lang] || 'Título no disponible';
            const desc = p['descripcion_' + lang] || 'Descripción no disponible';
            const textLnk = p['textoEnlace_' + lang] || 'Ver más';

            contenedor.innerHTML += `
                <div class="tarjeta-proyecto" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
                    <h3>${tit}</h3>
                    <p>${desc}</p>
                    <a href="${p.enlace}" class="enlace-proyecto">${textLnk}</a>
                </div>`;
        });
        if(typeof VanillaTilt !== 'undefined') VanillaTilt.init(contenedor.querySelectorAll(".tarjeta-proyecto"));
    }

    // --- 7. FUNCIONES DE LA TERMINAL (Para el i18n) ---
    const terminalBody = document.getElementById('terminal-body');

    function reiniciarTerminal(lang) {
        if (terminalBody && typeof traducciones !== 'undefined') {
            terminalBody.innerHTML = `
                <p class="terminal-output">${traducciones[lang]['term_welcome']}</p>
                <p class="terminal-output">${traducciones[lang]['term_type_help']}</p>
            `;
        }
    }

    // --- 8. MOTOR DE IDIOMAS (i18n) ---
    function aplicarIdioma(lang) {
        document.querySelectorAll('[data-i18n]').forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n');
            if (traducciones[lang] && traducciones[lang][clave]) elemento.innerHTML = traducciones[lang][clave];
        });

        const iNombre = document.getElementById('input-nombre');
        const iCorreo = document.getElementById('input-correo');
        const iMensaje = document.getElementById('input-mensaje');
        if(iNombre) iNombre.placeholder = traducciones[lang]['form_nombre'];
        if(iCorreo) iCorreo.placeholder = traducciones[lang]['form_correo'];
        if(iMensaje) iMensaje.placeholder = traducciones[lang]['form_mensaje'];

        if (btnLang) {
            btnLang.textContent = lang === 'es' ? 'EN' : 'ES';
            document.documentElement.lang = lang;
        }
    }

    if (typeof traducciones !== 'undefined') {
        aplicarIdioma(idiomaActual);
        reiniciarTerminal(idiomaActual); 
    }

    if (btnLang) {
        btnLang.addEventListener('click', () => {
            idiomaActual = idiomaActual === 'es' ? 'en' : 'es';
            localStorage.setItem('idioma', idiomaActual);
            aplicarIdioma(idiomaActual); 
            reiniciarTerminal(idiomaActual);

            if (globalProyectos.length > 0) {
                if (contenedorProyectos) renderizarProyectos(globalProyectos, filtroActualProyectos, contenedorProyectos, idiomaActual);
                if (contenedorProyectosIndex) renderizarProyectos(globalProyectos.filter(p => p.destacado), 'todos', contenedorProyectosIndex, idiomaActual);
            }
            if (globalNoticias.length > 0) {
                if (contenedorNoticias) renderizarNoticias(globalNoticias, contenedorNoticias, idiomaActual);
                if (contenedorNoticiasIndex) renderizarNoticias(globalNoticias.slice(0, 2), contenedorNoticiasIndex, idiomaActual);
            }
        });
    }

    // --- 9. EFECTO NODOS ---
    const canvas = document.getElementById('canvas-nodos');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;
        function resizeCanvas() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
        resizeCanvas(); window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor(x, y, dx, dy, size, color) { this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size; this.color = color; }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = '#2563eb'; ctx.fill(); }
            update() {
                if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
                if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
                this.x += this.dx; this.y += this.dy; this.draw();
            }
        }
        function initParticles() {
            particlesArray = [];
            let np = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < np; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                particlesArray.push(new Particle(x, y, (Math.random()*1)-0.5, (Math.random()*1)-0.5, size, '#2563eb'));
            }
        }
        function connect() {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                                 + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    if (distance < (canvas.width/7) * (canvas.height/7)) {
                        ctx.strokeStyle = 'rgba(255, 255, 255,' + (1 - (distance / 20000)) + ')';
                        ctx.lineWidth = 1; ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
                    }
                }
            }
        }
        function animate() { requestAnimationFrame(animate); ctx.clearRect(0, 0, innerWidth, innerHeight); particlesArray.forEach(p => p.update()); connect(); }
        initParticles(); animate();
    }

    // --- 10. LÓGICA CORE DE LA TERMINAL INTERACTIVA ---
    const terminalInput = document.getElementById('terminal-input');

    if (terminalInput && terminalBody) {
        document.getElementById('mi-terminal').addEventListener('click', () => terminalInput.focus());

        // --- HISTORIAL DE COMANDOS ---
        let historialComandos = [];
        let posicionHistorial = 0;

        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                let comandoStr = this.value.trim().toLowerCase();
                this.value = ''; 
                if (comandoStr === '') return;

                // Guardamos el comando en el historial y actualizamos la posición
                historialComandos.push(comandoStr);
                posicionHistorial = historialComandos.length;

                imprimirEnTerminal(`david@telecom:~$ ${comandoStr}`, false);
                procesarComando(comandoStr);
                
            } else if (event.key === 'ArrowUp') {
                event.preventDefault(); // Evita que el cursor salte al principio del input
                if (posicionHistorial > 0) {
                    posicionHistorial--;
                    this.value = historialComandos[posicionHistorial];
                }
            } else if (event.key === 'ArrowDown') {
                event.preventDefault(); // Evita que el cursor salte al final
                if (posicionHistorial < historialComandos.length - 1) {
                    posicionHistorial++;
                    this.value = historialComandos[posicionHistorial];
                } else {
                    posicionHistorial = historialComandos.length;
                    this.value = ''; // Si bajamos del todo, dejamos el input vacío
                }
            } else if (event.key === 'Tab') {
                event.preventDefault(); // Evita que el tabulador te saque del input
                
                // Lista de tus comandos
                const comandos = ['help', 'whoami', 'skills', 'contact', 'clear', 'sudo rm -rf /', 'ping', 'matrix'];
                const inputActual = this.value.trim().toLowerCase();
                
                if (inputActual !== '') {
                    // Busca comandos que empiecen por lo que ha escrito el usuario
                    const coincidencias = comandos.filter(cmd => cmd.startsWith(inputActual));
                    
                    if (coincidencias.length === 1) {
                        this.value = coincidencias[0]; // Si solo hay una coincidencia, autocompleta
                    }
                }
            }
        });

        function procesarComando(cmd) {
            const t = traducciones[idiomaActual]; 
            
            if(cmd === 'contact' || cmd === 'contacto') cmd = 'contacto_cmd';

            switch(cmd) {
                case 'help':
                    imprimirEnTerminal(t.term_help_title, true);
                    imprimirEnTerminal(`  <span class='comando-resaltado'>whoami</span>   - ${t.term_help_whoami}`, true);
                    imprimirEnTerminal(`  <span class='comando-resaltado'>skills</span>   - ${t.term_help_skills}`, true);
                    imprimirEnTerminal(`  <span class='comando-resaltado'>contact</span>  - ${t.term_help_contact}`, true);
                    imprimirEnTerminal(`  <span class='comando-resaltado'>clear</span>    - ${t.term_help_clear}`, true);
                    imprimirEnTerminal(t.term_help_info, true);
                    break;
                case 'whoami':
                    imprimirEnTerminal(t.term_whoami, true);
                    break;
                case 'skills':
                    imprimirEnTerminal(t.term_skills, true);
                    break;
                case 'contacto_cmd':
                    imprimirEnTerminal(t.term_contact, true);
                    break;
                case 'clear':
                    terminalBody.innerHTML = ''; 
                    imprimirEnTerminal(t.term_type_help, false);
                    break;
                case 'sudo':
                    imprimirEnTerminal(t.term_sudo, true);
                    break;
                case 'ping':
                    imprimirEnTerminal("PING david-portfolio.local (127.0.0.1): 56 data bytes", true);
                    imprimirEnTerminal("64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.045 ms", true);
                    imprimirEnTerminal("--- david-portfolio.local ping statistics ---", true);
                    imprimirEnTerminal("1 packets transmitted, 1 packets received, 0.0% packet loss", true);
                    break;
                
                // --- INICIO EASTER EGGS ---
                case 'matrix':
                    imprimirEnTerminal(idiomaActual === 'es' ? "Despertando, Neo..." : "Wake up, Neo...", true);
                    setTimeout(iniciarMatrix, 1000);
                    break;

                case 'sudo rm -rf /':
                case 'sudo rm -rf /*':
                    const lang = idiomaActual; // Cogemos el idioma actual
                    imprimirEnTerminal(lang === 'es' ? "⚠️ ALERTA: Iniciando borrado crítico del sistema de archivos..." : "⚠️ WARNING: Initiating critical file system wipe...", true);
                    
                    // 1. Iniciar temblor y glitch
                    setTimeout(() => {
                        document.body.classList.add('hacker-shake');
                    }, 500);
                    
                    // 2. Apagón total (Blackout)
                    setTimeout(() => {
                        document.body.classList.remove('hacker-shake');
                        document.body.classList.add('hacker-blackout');
                    }, 2500);

                    // 3. Reinicio y vuelta a la normalidad
                    setTimeout(() => {
                        document.body.classList.remove('hacker-blackout');
                        imprimirEnTerminal(lang === 'es' ? "Reinicio de emergencia completado. Archivos recuperados." : "Emergency reboot completed. Files recovered.", true);
                    }, 5500);
                    break;
                // --- FIN EASTER EGGS ---
                
                default:
                    imprimirEnTerminal(`${t.term_not_found_1} '${cmd}'. ${t.term_not_found_2}`, true);
            }
        }

        function imprimirEnTerminal(texto, esRespuesta) {
            const p = document.createElement('p');
            p.className = esRespuesta ? 'terminal-output verde' : 'terminal-output';
            terminalBody.appendChild(p);
            
            // Si es un comando del usuario, se imprime instantáneamente
            if (!esRespuesta) {
                p.innerHTML = texto;
                terminalBody.scrollTop = terminalBody.scrollHeight;
                return;
            }

            // Si es la respuesta del sistema, efecto máquina de escribir
            let i = 0;
            let isTag = false;

            function typeWriter() {
                if (i < texto.length) {
                    // Si encontramos una etiqueta HTML (ej. <span> o <br>), la pasamos rápida
                    if (texto.charAt(i) === '<') isTag = true;
                    
                    p.innerHTML = texto.substring(0, i + 1);

                    if (texto.charAt(i) === '>') isTag = false;
                    
                    i++;
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                    
                    if (isTag) {
                        typeWriter(); // Velocidad luz para el código HTML
                    } else {
                        setTimeout(typeWriter, 10); // Milisegundos entre letras (ajusta para más velocidad)
                    }
                }
            }
            typeWriter();
        }
    }

    // =========================================
    // EXTRA: CONEXIÓN A LA API DE GITHUB
    // =========================================
    const contenedorGithub = document.getElementById('contenedor-github');

    async function cargarRepositoriosGitHub(username) {
        if (!contenedorGithub) return;

        try {
            const respuesta = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            
            if (!respuesta.ok) throw new Error('Error en la llamada a la API');
            
            const repositorios = await respuesta.json();
            contenedorGithub.innerHTML = ''; 

            const lang = localStorage.getItem('idioma') || 'es';
            const textoBtn = lang === 'es' ? 'Ver repositorio &rarr;' : 'View repository &rarr;';
            const descVacia = lang === 'es' ? 'Sin descripción proporcionada en GitHub.' : 'No description provided on GitHub.';

            repositorios.forEach(repo => {
                const lenguaje = repo.language ? `<span style="font-size: 0.85rem; color: var(--color-texto-mutado); font-weight: bold;"><i class="fas fa-circle" style="color: var(--color-principal); font-size: 0.6rem;"></i> ${repo.language}</span>` : '';

                contenedorGithub.innerHTML += `
                    <div class="tarjeta-proyecto" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
                        <h3 style="display: flex; align-items: center; gap: 10px;">
                            <i class="fab fa-github"></i> ${repo.name}
                        </h3>
                        <p>${repo.description || descVacia}</p>
                        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                            <a href="${repo.html_url}" target="_blank" class="enlace-proyecto">${textoBtn}</a>
                            ${lenguaje}
                        </div>
                    </div>
                `;
            });

            if(typeof VanillaTilt !== 'undefined') {
                VanillaTilt.init(contenedorGithub.querySelectorAll(".tarjeta-proyecto"));
            }

        } catch (error) {
            console.error("Fallo al cargar GitHub API:", error);
            contenedorGithub.innerHTML = `<p style="color: var(--color-texto-mutado); text-align: center; width: 100%;">No se pudieron cargar los repositorios en este momento.</p>`;
        }
    }

    cargarRepositoriosGitHub('dsanchezisabel');

    // --- BOTÓN COPIAR CORREO TERMINAL ---
    const btnCopiar = document.getElementById('btn-copiar');
    if (btnCopiar) {
        btnCopiar.addEventListener('click', () => {
            const correo = "david.sanchezisabel@gmail.com"; // Pon aquí tu correo real
            navigator.clipboard.writeText(correo).then(() => {
                // Un pequeño feedback visual: cambiar el icono momentáneamente
                const iconoOriginal = btnCopiar.innerHTML;
                btnCopiar.innerHTML = '<i class="fas fa-check" style="color:#27c93f;"></i>';
                setTimeout(() => btnCopiar.innerHTML = iconoOriginal, 2000);
                
                // Opcional: imprimir en la propia terminal que se ha copiado
                imprimirEnTerminal("Correo copiado al portapapeles: " + correo, true);
            });
        });
    }

    // --- ENVÍO DE FORMULARIO SIN SALIR DE LA WEB (AJAX) ---
    const formContacto = document.querySelector('.formulario-contacto');
    if (formContacto) {
        formContacto.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que la web recargue o salte a Formspree
            
            const btn = formContacto.querySelector('button[type="submit"]');
            const textoOriginal = btn.innerHTML;
            
            // Estado de carga
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            btn.style.opacity = '0.7';
            btn.disabled = true;
            
            try {
                const response = await fetch(formContacto.action, {
                    method: 'POST',
                    body: new FormData(formContacto),
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    // Éxito
                    btn.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje Enviado!';
                    btn.style.backgroundColor = '#10b981'; // Verde éxito
                    btn.style.opacity = '1';
                    formContacto.reset(); // Limpia los campos
                } else {
                    throw new Error('Error de red');
                }
            } catch (error) {
                // Error
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error al enviar';
                btn.style.backgroundColor = '#ef4444'; // Rojo error
                btn.style.opacity = '1';
            }
            
            // Restaurar el botón después de 3 segundos
            setTimeout(() => {
                btn.innerHTML = textoOriginal;
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }, 3000);
        });
    }

    // --- MOTOR DEL EFECTO MATRIX ---
    function iniciarMatrix() {
        // 1. Crear el canvas de Matrix a pantalla completa
        const canvasMatrix = document.createElement('canvas');
        canvasMatrix.id = 'matrix-canvas';
        canvasMatrix.style.position = 'fixed';
        canvasMatrix.style.top = '0';
        canvasMatrix.style.left = '0';
        canvasMatrix.style.width = '100vw';
        canvasMatrix.style.height = '100vh';
        canvasMatrix.style.zIndex = '9999'; // Por encima de todo
        canvasMatrix.style.cursor = 'pointer'; // Indica que se puede hacer clic
        document.body.appendChild(canvasMatrix);

        const ctx = canvasMatrix.getContext('2d');
        canvasMatrix.width = window.innerWidth;
        canvasMatrix.height = window.innerHeight;

        // 2. Caracteres estilo Matrix (Números)
        const caracteres = '0123456789';
        const fontSize = 16;
        const columnas = canvasMatrix.width / fontSize;

        // Array para rastrear la coordenada Y de cada columna
        const gotas = [];
        for (let x = 0; x < columnas; x++) {
            gotas[x] = 1;
        }

        // 3. Función de dibujo repetitivo
        const dibujarMatrix = () => {
            // Fondo negro semitransparente para el efecto de rastro
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvasMatrix.width, canvasMatrix.height);

            ctx.fillStyle = '#0F0'; // Verde Neón brillante
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < gotas.length; i++) {
                const texto = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
                ctx.fillText(texto, i * fontSize, gotas[i] * fontSize);

                // Devolver la gota al principio de forma aleatoria si sale de la pantalla
                if (gotas[i] * fontSize > canvasMatrix.height && Math.random() > 0.975) {
                    gotas[i] = 0;
                }
                gotas[i]++;
            }
        };

        const intervaloMatrix = setInterval(dibujarMatrix, 33); // Aprox 30 fps

        // 4. Mecanismo para salir de Matrix
        const salirMatrix = () => {
            clearInterval(intervaloMatrix);
            canvasMatrix.remove();
            // Aseguramos que la respuesta vaya a la terminal
            const tb = document.getElementById('terminal-body');
            if (tb) {
                const p = document.createElement('p');
                p.className = 'terminal-output verde';
                p.innerHTML = idiomaActual === 'es' ? "Sistema restaurado. Bienvenido al mundo real." : "System restored. Welcome to the real world.";
                tb.appendChild(p);
                tb.scrollTop = tb.scrollHeight;
            }
        };

        // Salir al hacer clic en la pantalla
        canvasMatrix.addEventListener('click', salirMatrix);
        
        // Salir al pulsar Escape
        document.addEventListener('keydown', function eventoTecla(e) {
            if (e.key === 'Escape' || e.key === 'Enter') {
                salirMatrix();
                document.removeEventListener('keydown', eventoTecla);
            }
        });
        
        // Reajustar tamaño si cambian la ventana
        window.addEventListener('resize', () => {
            if (document.getElementById('matrix-canvas')) {
                canvasMatrix.width = window.innerWidth;
                canvasMatrix.height = window.innerHeight;
            }
        });
    }
    
    // --- LÓGICA DE ACORDEONES (POLÍTICA) ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion-content').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // --- LÓGICA GENERADOR QR ---
    const btnGenerarQR = document.getElementById('btn-generar-qr');
    if (btnGenerarQR) {
        btnGenerarQR.addEventListener('click', () => {
            const lang = document.documentElement.lang || 'es';
            const inputUrl = document.getElementById('inputUrl');
            const contenedorQR = document.getElementById('qr-oculto');
            const mensaje = document.getElementById('mensaje-estado');
            const url = inputUrl.value.trim();

            if (url === "") {
                mensaje.textContent = lang === 'es' ? "❌ Por favor, introduce un enlace válido." : "❌ Please enter a valid link.";
                mensaje.className = "qr-mensaje qr-error";
                inputUrl.focus();
                return;
            }

            mensaje.textContent = lang === 'es' ? "⏳ Generando..." : "⏳ Generating...";
            mensaje.className = "qr-mensaje qr-espera";
            contenedorQR.innerHTML = "";

            new QRCode(contenedorQR, {
                text: url, width: 300, height: 300,
                colorDark : "#000000", colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H 
            });

            setTimeout(() => {
                const imagenQR = contenedorQR.querySelector("img");
                if (imagenQR) {
                    const enlaceDescarga = document.createElement("a");
                    enlaceDescarga.href = imagenQR.src;
                    enlaceDescarga.download = "codigo_qr_web.png";
                    document.body.appendChild(enlaceDescarga);
                    enlaceDescarga.click();
                    document.body.removeChild(enlaceDescarga);
                    
                    mensaje.textContent = lang === 'es' ? "✅ ¡Descarga iniciada!" : "✅ Download started!";
                    mensaje.className = "qr-mensaje qr-exito";
                } else {
                    mensaje.textContent = lang === 'es' ? "❌ Error al generar la imagen." : "❌ Error generating image.";
                    mensaje.className = "qr-mensaje qr-error";
                }
            }, 500);
        });
    }

    // --- PLACEHOLDER DE QR (TRADUCCIÓN DINÁMICA) ---
    const qrInputElem = document.getElementById('inputUrl');
    if(qrInputElem && typeof traducciones !== 'undefined') {
        const checkLang = () => {
            const lang = document.documentElement.lang || 'es';
            if(traducciones[lang] && traducciones[lang]['qr_placeholder']) {
                qrInputElem.placeholder = traducciones[lang]['qr_placeholder'];
            }
        };
        checkLang();
        if(btnLang) btnLang.addEventListener('click', () => setTimeout(checkLang, 10));
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Usamos './sw.js' para asegurar que el scope es la carpeta actual
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('SW registrado con éxito en el scope:', reg.scope))
                .catch(err => console.log('Fallo al registrar SW:', err));
        });
    }

});
