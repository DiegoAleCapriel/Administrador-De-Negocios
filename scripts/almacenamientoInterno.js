//primero accedemos a la base de datos, inicializa y abriendo la conexión a la base de datos
const request = indexedDB.open("BaseDeDatosTienda", 1); // Nombre y versión de la DB

let db; //variable global para poder acceder a la base de datos una vez ya se haya abierto

//onupgradeneeded es un evento que se activa cuando se abre una base de datos y es necesario crearla o actualizarla a una nueva versión
request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Crear un Object Store (si no existe)
    if (!db.objectStoreNames.contains("gastos-tienda")) {
        const store = db.createObjectStore("gastos-tienda", { keyPath: "id", autoIncrement: true });
        
        // Crear un índice fecha para cada elemento del almacen
        store.createIndex("fecha", "fecha", { unique: false });
    }
        // Crear un Object Store (si no existe)
    if (!db.objectStoreNames.contains("productos-tienda")) {
        const store = db.createObjectStore("productos-tienda", { keyPath: "id", autoIncrement: true });

        // Crear un índice categoria para cada elemento del almacen
        store.createIndex("categoria", "categoria", { unique: false });
    }
    if ( !db.objectStoreNames.contains("recordatorios-tienda")){
        db.createObjectStore("recordatorios-tienda", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("categorias-tienda")){
        const store = db.createObjectStore("categorias-tienda", {keyPath: "id", autoIncrement: true });
        
        // Crear un índice categoria para la categoria y que su valor sea unico
        store.createIndex("categoria", "categoria", { unique: true });
    }
    if (!db.objectStoreNames.contains("historial-Gastos")){
        db.createObjectStore("historial-Gastos", {keyPath: "id", autoIncrement: true });
    }
};

//evento que se activa cuando una operación (como abrir la base de datos o realizar una transacción) se completa con éxito.
request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Base de datos abierta correctamente");
};

// evento que se activa cuando ocurre un error en una operación relacionada con la base de datos.
request.onerror = function(event) {
    console.error("Error al abrir la base de datos", event.target.error);
};

function agregarElementoEnDb2_0(informacion, nombreDeAlmacen){
    return new Promise((resolve, reject) => {
        //crea una nueva transaccion
        let transaction = db.transaction([nombreDeAlmacen], "readwrite");
        //accede al almacen para trabajar con el contenido
        let objectStore = transaction.objectStore(nombreDeAlmacen);

        //solicitud para agregar un nuevo elmento en la db
        let requestAdd = objectStore.add(informacion);

        requestAdd.onsuccess = function(event) {
            resolve([event.target.result, null])
        };

        requestAdd.onerror = function(event) {
            reject([null, event.target.errorCode]);
        };
    })
}

function obtenerDatosEnDB2_3(indice, valor , nombreDeAlmacen) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(nombreDeAlmacen, "readonly");
        const store = transaction.objectStore(nombreDeAlmacen);
        const index = store.index(indice);

        const keyRange = IDBKeyRange.only(valor);
        const query = index.getAll(keyRange);

        query.onsuccess = () => {
            resolve([query.result, null]);
        };

        query.onerror = (event) => {
            reject([null, event.target.errorCode]);
        };
    })
}

function agregarGastoEnContenedor(informacion, idAlmacen){
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["historial-Gastos"], "readwrite");
        const store = transaction.objectStore("historial-Gastos");
    
        const getRequest = store.get(Number(idAlmacen)); // Obtener el elemento con ID 1
    
        getRequest.onsuccess = function(event) {
            const data = event.target.result;
    
            if (data) {
                // Modificamos el array "gastos", que contiene todos los gastos de la tienda de hoy
                data.gastos.push(informacion);
    
                // Guardamos de nuevo el objeto actualizado
                const updateRequest = store.put(data);
    
                updateRequest.onsuccess = function() {
                    resolve(["Elemento actualizado con éxito.", null]);
                };
    
                updateRequest.onerror = function() {
                    reject([null, "Error al actualizar el elemento."]);
                };
            } else {
                reject([null, "Elemento no encontrado."]);
            }
        };    
    })   
}

//recuperar elementos de la base de datos, si le pasamos un id, y obtenerVariosElementos = false, solo recupera un elemento, si no le pasamos id y obtenerVariosElementos = true, recupera todos los elementos
function recuperarElementosEnDb2_0(nombreDeAlmacen, id_objetivo, obtenerVariosElementos = true){
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([nombreDeAlmacen], "readonly");
        let objectStore = transaction.objectStore(nombreDeAlmacen);

        let request;

        if (obtenerVariosElementos) request = objectStore.getAll();

        else request = objectStore.get(id_objetivo);

        request.onsuccess = function(event) {
            resolve([event.target.result, null]);
        };

        request.onerror = function(event) {
            reject([null, event.target.errorCode]);
        };
    })
}

function actualizarElementoEnDb2_0(nombreDeAlmacen, nuevosDatos, id_objetivo){
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([nombreDeAlmacen], "readwrite");
        let objectStore = transaction.objectStore(nombreDeAlmacen);

        nuevosDatos.id = id_objetivo

        let request = objectStore.put(nuevosDatos);

        request.onsuccess = function(event) {
            resolve(["Dato actualizado correctamente", null]);
        };

        request.onerror = function(event) {
            console.log("Ha ocurrido un error")
            reject([null, event.target.errorCode]);
        };
    })
}

function eliminarElementoEnDb2_0(nombreDeAlmacen, id_objetivo){
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([nombreDeAlmacen], "readwrite");
        let objectStore = transaction.objectStore(nombreDeAlmacen);

        let request = objectStore.delete(id_objetivo);

        request.onsuccess = function(event) {
            resolve(["Dato eliminado correctamente", null]);
        };

        request.onerror = function(event) {
            reject([null, event.target.errorCode]);
        };

    })
}

function agregarElementoEnDb(contenido, nombreDeAlmacen) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(nombreDeAlmacen, "readwrite");
        const store = transaction.objectStore(nombreDeAlmacen);

        store.add(contenido);

        //evento que ocurre cuando una transacción se completa correctamente.
        transaction.oncomplete = () => resolve(["Elemento agregado correctamente", null]);
        
        //evento que ocurre cuando una transaccion no se completa correctamente
        transaction.onerror = event => reject([null, "Error: " + event.target.error]);
    });
}

//mejoras: definir una sola funcion para obtener los datos y preguntar si queremos obtener varios datos o solo uno
//y usar crear una nueva propiedad en los obejetos (Ids) para buscarlos usando: objectStore.get(id_objetivo);
function obtenerProducto(nombreObjetivo, nombreDeAlmacen) {
    return new Promise((resolve, reject) => {
        //crea una transaccion para trabajar con el almacen de datos
        const transaction = db.transaction(nombreDeAlmacen, "readonly");
        const almacen = transaction.objectStore(nombreDeAlmacen);

        const request = almacen.getAll(); //obtener todos los datos del almacen actual

        request.onsuccess = (event) => {
            if (request.result) {
                const elementosEncontrados = event.target.result;
                const elementoEncontrado =  elementosEncontrados.filter((item) => item.nombreGasto === nombreObjetivo);
                resolve([elementoEncontrado, null]); //[datos, error]
            } else {
                reject([null,"Producto no encontrado"]);
            }
        };

        request.onerror = event => reject([null, "Error al obtener producto " + event.target.error]);
    })
    
}

function obtenerVariosElementos(nombreDeAlmacen){
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(nombreDeAlmacen, "readonly");
        const almacen = transaction.objectStore(nombreDeAlmacen);

        const request = almacen.getAll(); //obten todos los datos del almacen actual

        request.onsuccess = (event) =>{
            if(request.result){
                const datos = event.target.result;
                resolve([datos, null])//[datos, error]
            } else{
                reject([null, "No hay elementos guardados"])
            }
        };

        request.onerror = (event) => reject([null, "Error al obtener producto " + event.target.error]);
    })
}

function eliminarElementoEnDb(nombreDeAlmacen, condicion){
    return new Promise((resolve, reject) => {
       const transaccion =  db.transaction(nombreDeAlmacen, "readwrite");
       const almacen = transaccion.objectStore(nombreDeAlmacen);

       const cursorRequest = almacen.openCursor();
       
       cursorRequest.onsuccess = (event) => {
            const cursor = event.target.result;

            if(cursor){
                // Revisar si el valor cumple con la condición
                if(condicion(cursor)){
                    const deleteRequest = cursor.delete();

                    deleteRequest.onsuccess = () => resolve(["Elemento eliminado correctamente", null]);

                    deleteRequest.onerror = (event) => reject([null, "Error al eliminar el elemento " + event.target.error]);
                }

                cursor.continue(); // Continuar con el siguiente registro
            }
       }
    })
}
