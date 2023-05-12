const parametros = new URLSearchParams(window.location.search);
const nombre = parametros.get("nombre");
const latitud = parseFloat(parametros.get("latitud"));
const longitud = parseFloat(parametros.get("longitud"));
const coordenadas = { lat: latitud, lng: longitud };
let map;

document.getElementById("nombre").textContent = nombre;

async function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: coordenadas,
        zoom: 12,
    });

    // Obtener las coordenadas de cada Branch y calcular los tiempos de viaje
    fetch('http://172.18.69.218:4000/api/branchs/all')
        .then(response => response.json())
        .then(async data => {
            const origins = [`${latitud},${longitud}`];
            const destinations = [];
            let closestDistance = Infinity;
            let closestIndex = -1;
            console.log(data)
            await Promise.all(data.map(async (branch, index) => {
                const latitud = parseFloat(branch.latestLaltitude);
                const longitud = parseFloat(branch.latestLongitude);
                const nombre = branch.name;
                const name_manager = branch.name_manager;
                console.log(latitud, longitud, nombre, name_manager)
                if (isNaN(latitud) || isNaN(longitud)) {
                    console.error(`Coordenada Invalida de la sucursal ${nombre}`);
                    return;
                }

                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(latitud, longitud),
                    new google.maps.LatLng(coordenadas.lat, coordenadas.lng)
                );
                console.log(distance)
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }

                destinations.push(`${latitud},${longitud}`);
            }));

            // Pintar la ruta más cercana en el mapa
            if (closestIndex !== -1) {
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer({
                    map: map,
                });

                directionsService.route(
                    {
                        origin: new google.maps.LatLng(latitud, longitud),
                        destination: new google.maps.LatLng(
                            parseFloat(data[closestIndex].latestLaltitude),
                            parseFloat(data[closestIndex].latestLongitude)
                        ),
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC,
                    },
                    (response, status) => {
                        if (status === "OK") {
                            directionsRenderer.setDirections(response);
                        } else {
                            console.error(`Error al obtener la ruta: ${status}`);
                        }
                    }
                );
            }
            const service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: origins,
                destinations: destinations,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, (response, status) => {
                if (status === "OK") {
                    const elements = response.rows[0].elements;
                    data.forEach((branch, index) => {
                        const element = elements[index];
                        if (element.status === "OK") {
                            const num = index + 1;
                            const distanceText = element.distance.text;
                            const durationText = element.duration.text;
                            console.log(branch.name, distanceText, durationText);
                            document.getElementById("ruta"+ num + "").textContent = durationText + " Distancia: " + distanceText;
                        } else {
                            console.error(`Error al obtener la distancia y tiempo de la sucursal ${branch.name}: ${element.status}`);
                        }
                    });
                } else {
                    console.error(`Error al obtener la distancia y tiempo: ${status}`);
                }
            });
            alert("La ruta más cercana es la " + data[closestIndex].name);
        })
        .catch(error => console.error(error));
}
