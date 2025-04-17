function obtenerFechaActual(){
    const fecha = new Date();
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio", 
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    // Obtener la hora y minutos actual
    const horaActual = new Date();
    const diaActual = fecha.getDate();
    const mesActual = meses[fecha.getMonth()];
    const añoActual = fecha.getFullYear();
  
    return [horaActual, diaActual, mesActual, añoActual];
}

//funcion que verifica si el sistema aun no ha cerrado y si ya cerro esperar al siguiente dia para habrir el sistema
function obtenerHoraObjetivo(nombreDeHoraObjetivo){
    //obtiene la hora y minutos del cierre del sistema
    let [horaObjetivo, minutosObjetivo] =  localStorage.getItem(nombreDeHoraObjetivo).split(":").map(Number);

    // Crear la fecha objetivo con la misma fecha de hoy pero con la hora y minuto deseados
    let fechaObjetivo = new Date();
    fechaObjetivo.setHours(horaObjetivo, minutosObjetivo, 0, 0);
    
    return fechaObjetivo;
}

function guardarContenedorDeGastos(fechaActualDeGastos){
    //guarda la informacion del contenedor de gastos en la base de datos
    agregarElementoEnDb2_0({fechaDeGastos: fechaActualDeGastos, gastos: []}, "historial-Gastos").then(([mensaje, error]) => {
        if(!error) {
            //agrega un nuevo boton al contenedor de historial de gastos
            //el contenedor de historial de gastos es un div con id "scroll-historial-gastos"
            const scrollHistorialGastos = document.getElementById("scroll-historial-gastos");
            const nuevoBoton = document.createElement("button");
    
            nuevoBoton.textContent = fechaActualDeGastos;
    
            nuevoBoton.className = "date-button";
    
            scrollHistorialGastos.prepend(nuevoBoton);

            //actualiza el contenedor de historial de gastos
            toggleHistorialGastos() 
        }
        else alert("Error al guardar contendor de gastos");
    });
}

//al iniciar la pagina verificar si el sistema ya ha cerrado y si 
window.onload = function(){
    const [horaActual, diaActual, mesActual, añoActual] = obtenerFechaActual();
    toggleHistorialGastos();

    document.getElementById("fechaDeInicioDeSistema").innerText = `${diaActual} de ${mesActual} de ${añoActual}`;
    
    // Verificar si es la primera vez que se abre la página
    if (!localStorage.getItem("paginaVisitada")) {
        // Si no existe el indicador, significa que es la primera vez
        alert("¡Bienvenido a nuestra página por primera vez!");

        // Establecer un valor en el LocalStorage para marcar que ya se ha visitado
        localStorage.setItem("paginaVisitada", "true");
        localStorage.setItem("horaParaAbrirSistema", "6:00");
        localStorage.setItem("horaParaCerrarSistema", "18:00");
        localStorage.setItem("informacionDesistema", JSON.stringify({abierto: false, contenedorCreado: false}));
    }
    
    const horaDeAperturaSistema = obtenerHoraObjetivo("horaParaAbrirSistema");
    const horaDeCierreSistema = obtenerHoraObjetivo("horaParaCerrarSistema");

    //verifica si el sistema ya esta abierto
    if(horaActual >=  horaDeAperturaSistema && horaActual < horaDeCierreSistema){
        console.log("El sistema esta abierto");

        const sistema = JSON.parse(localStorage.getItem("informacionDesistema"));

        //habilitar el sistema una vez ya haya abierto
        sistema.abierto = true

        //verica si el sistema ya ha abierto y si aun no se ha creado el contedor para los gastos actuales
        if(sistema.abierto === true && sistema.contenedorCreado === false){
            let [_, diaActual, mesActual, añoActual] = obtenerFechaActual();

            const request = indexedDB.open("BaseDeDatosTienda", 1); 

            request.onsuccess = function(event) {
                guardarContenedorDeGastos(`${diaActual} de ${mesActual} de ${añoActual}`);

                //actualiza la informacion del sistema
                localStorage.setItem("informacionDesistema", JSON.stringify({abierto: false, contenedorCreado:true}));

                console.log("Base de datos abierta correctamente");
            };

            // evento que se activa cuando ocurre un error en una operación relacionada con la base de datos.
            request.onerror = function(event) {
                console.error("Error al abrir la base de datos", event.target.error);
            };
        }
    }

    else if (horaActual < horaDeAperturaSistema){
        alert("El sistema no ha abierto aun...")

        //verifica cuanto tiempo falta para que habra el sistema otra vez
        let horasRestantes = horaDeAperturaSistema.getHours() - horaActual.getHours();
        let minutosRestantes = (horaDeAperturaSistema.getMinutes() - horaActual.getMinutes());

        if (horasRestantes < 2 && minutosRestantes < 2) alert("Falta: " + horasRestantes + " hora y " + minutosRestantes + " minuto para que el sistema abra");
        
        else alert("Faltan: " + horasRestantes + " horas y " + minutosRestantes + " minutos para que el sistema abra");
    }

    else if(horaActual >= horaDeCierreSistema){
        alert("El sistema ya ha cerrado, espera que habra mañana a las: " + horaDeAperturaSistema.getHours() + ":" + horaDeAperturaSistema.getMinutes());

        const sistema = JSON.parse(localStorage.getItem("informacionDesistema"));

        localStorage.setItem("informacionDesistema", JSON.stringify({abierto: false, contenedorCreado:false}));
    }
}