// Configuración - REEMPLAZA ESTE ID CON EL TUYO
const SHEET_ID = '1vBTkaukd4qznFMJqQTDsmcAVgcECKrd2ZmTMiR7PI1k';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let datos = [];

// Cargar datos desde Google Sheets
async function cargarDatos() {
    try {
        mostrarLoading();
        
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            throw new Error('Error al cargar los datos');
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        datos = json.table.rows.map((row, index) => ({
            id: row.c[0]?.v || index + 1,
            categoria: row.c[1]?.v || 'Sin categoría',
            enlace: row.c[2]?.v || '#',
            descripcion: row.c[3]?.v || 'Sin descripción'
        }));
        
        mostrarResultados(datos);
        actualizarContador(datos.length);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los datos. Verifica que la hoja esté publicada.');
    }
}

// Buscar contenido
function buscarContenido() {
    const textoBusqueda = document.getElementById('buscador').value.toLowerCase();
    const categoriaSeleccionada = document.getElementById('categoriaFiltro').value;
    
    const resultados = datos.filter(item => {
        const coincideTexto = item.descripcion.toLowerCase().includes(textoBusqueda) || 
                             item.categoria.toLowerCase().includes(textoBusqueda);
        const coincideCategoria = !categoriaSeleccionada || item.categoria === categoriaSeleccionada;
        
        return coincideTexto && coincideCategoria;
    });
    
    mostrarResultados(resultados);
    actualizarContador(resultados.length);
}

// Mostrar resultados
function mostrarResultados(resultados) {
    const contenedor = document.getElementById('resultados');
    
    if (resultados.length === 0) {
        contenedor.innerHTML = `
            <div class="no-resultados">
                <h3>😕 No se encontraron resultados</h3>
                <p>Intenta con otros términos de búsqueda o cambia la categoría</p>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = resultados.map(item => `
        <div class="item-resultado">
            <h3>${item.categoria}</h3>
            <p>${item.descripcion}</p>
            <a href="${item.enlace}" target="_blank" class="enlace-ig">
                📱 Ver en Instagram
            </a>
        </div>
    `).join('');
}

// Actualizar contador
function actualizarContador(cantidad) {
    document.getElementById('contador').textContent = `📊 ${cantidad} resultados encontrados`;
}

// Mostrar loading
function mostrarLoading() {
    document.getElementById('resultados').innerHTML = `
        <div class="loading">📥 Cargando contenidos desde Google Sheets...</div>
    `;
}

// Mostrar error
function mostrarError(mensaje) {
    document.getElementById('resultados').innerHTML = `
        <div class="no-resultados">
            <h3>❌ Error</h3>
            <p>${mensaje}</p>
            <p><small>Asegúrate de que la hoja de Google Sheets esté publicada para la web.</small></p>
        </div>
    `;
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('buscador').value = '';
    document.getElementById('categoriaFiltro').value = '';
    buscarContenido();
}

// Event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos al iniciar
    cargarDatos();
    
    // Event listeners para búsqueda en tiempo real
    document.getElementById('buscador').addEventListener('input', buscarContenido);
    document.getElementById('categoriaFiltro').addEventListener('change', buscarContenido);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
});

// Recargar datos cada 5 minutos (opcional)
setInterval(cargarDatos, 300000);