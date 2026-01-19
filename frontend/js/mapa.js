const angolaBounds = L.latLngBounds(
    L.latLng(-18.038, 11.460),
    L.latLng(-4.388, 24.082)
);
//mapa focado em angola
const map = L.map('map', {
    maxBounds: angolaBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 6,
    maxZoom: 18
}).setView([-1.2027, 17.8739], 6);

//tiles opensteet
L.tileLayer("https://{s}.tile.openstreetmap.org/{z},{x},{y}.png",{
    attribution: '&copy; <a href="https://openstreetmap.org">openStreetMap</a> contributors',
    maxZoom: 18,
    minZoom:6
}).addTo(map);

//lista de todos os pontos das províncias 
const provincias = [
    {nome:"Luanda", lat: -8.8383, lng: 13.2344},
    {nome:"Benguela", lat: -12.5783, lng: 13.4072},
    {nome:"Huambo", lat: -12.7761, lng: 5.7382},
    {nome:"Bié (Kuito)", lat: -12.3833 , lng: 16.9333},
    {nome:"Lubango (Huíla)", lat: -14.980 , lng: 13.4925},
    {nome:"Cabinda", lat: -5.5560 , lng:2.1970 },
    {nome:"Menongue (Cuando Cubango)", lat: -14.6570 , lng: 17.6892},
    {nome:"N´dalatando (Cuanza Norte)", lat: -9.2976, lng: 14.9096},
    {nome:"Sumbe (Cuanza Sul)", lat: -11.2104 , lng: 13.8437},
    {nome:"Ondjiva (Cunene)", lat: -17.0667, lng: 15.7333},
    {nome:"Saurimo (Lunda Sul)", lat: -9.6588, lng: 20.3925},
    {nome:"Malanje", lat: -9.5402, lng: 16.3410},
    {nome:"Luena (Moxico)", lat: -11.7833, lng: 19.9167},
    {nome:"Moçâmedes (Namibe)", lat: -15.1960, lng: 12.1520},
    {nome:"Uíge", lat: -7.6165, lng: 14.9112},
    {nome:"Mbanza Kongo (Zaire)", lat: -6.2667, lng: 14.2500}
  
];
//adicionar marcadores
provincias.forEach(p=>{
    L.marker([p.lat, p.lng]).addTo(map).bindPoup(p.nome)
})
//websocket para veículos
const ws = new WebSocket("ws://localhost:8000/stream");
let markers = []
ws.onmessage = e =>{
    const data = JSON.parse(e.data)
    if(markers.length === 0){
        data.cars.forEach(v =>{
            let m = L.marker([v[0], v[1]])
            m.addTo(map)
            markers.push(m)
        })
    }
    data.cars.forEach(v, i)=>{
        markers[i].setLatLng([v[0], v[1]])
    }
}
const ws = new WebSocket("wss://meuservidor.com/stream")

const route = [
    [startLat, startLng],
    [endLat, endLng]
];
L.polyline(route,{color:'blue'}).addTo(map)


// var map = L.map('map').setView([-8.8383, 13.2344],13);
// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
//     maxZoom: 19
// }).addTo(map)