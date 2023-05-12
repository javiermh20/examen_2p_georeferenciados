let map;

function initMap(){
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 21.1307643, lng: -101.6818728 },
        zoom: 12,
    });

    map.addListener("tilesloaded", () => {
        fetch('http://172.18.69.218:4000/api/branchs/all')
            .then(response => response.json())
            .then(data => {
                data.forEach(branch => {
                    const latitud = parseFloat(branch.latestLaltitude);
                    const longitud = parseFloat(branch.latestLongitude);
                    const nombre = branch.name;
                    const name_manager = branch.name_manager;

                    if (isNaN(latitud) || isNaN(longitud)) {
                        console.error(`Invalid coordinate data for branch ${nombre}`);
                        return;
                    }

                    const marker = new google.maps.Marker({
                        position: {lat: latitud, lng: longitud},
                        map: map,
                        title: nombre,
                        description: name_manager
                    });
                });
            })
            .catch(error => console.error(error));
    });
}

function onSubmitForm() {
    // Obtener los valores de los campos
    const nombre = document.getElementById("nombre").value;
    const latitud = parseFloat(document.getElementById("latitud").value);
    const longitud = parseFloat(document.getElementById("longitud").value);
  
    if (nombre === "" || isNaN(latitud) || isNaN(longitud)) {
        alert("Favor de llenar todos los campos y que la latitud y longitud sean números");
        return false;
    }
    
    if (latitud < 20.0 || latitud > 26.0 || isNaN(latitud) || longitud < -102.0 || longitud > -99.0 || isNaN(longitud)) {
        alert("Las coordenadas deben ser números y estar dentro del rango de Guanajuato, México.");
        return false;
    }

    // Actualizar el valor del campo de coordenadas
    document.getElementById("coordenadas").value = `${latitud},${longitud}`;
  
    return true;
}

// Escuchar el evento submit del formulario
document.getElementById("form").addEventListener("submit", onSubmitForm());

