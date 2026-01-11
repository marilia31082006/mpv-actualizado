const ws = new WebSocket("ws://127.0.0.1:8000/ws/localizacao");

ws.onopen = () => {
    navigator.geolocation.watchPosition(pos => {
        ws.send(JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }));
    });
};

ws.onmessage = e => {
    const d = JSON.parse(e.data);
    L.marker([d.latitude, d.longitude]).addTo(map);
};
// socket.onmessage = e => {
//     const data = JSON.parse(e.data);

//     if (data.tipo === "pagamento_criado") {
//         alert("Valor da corrida: " + data.valor + " Kz");
//     }

//     if (data.tipo === "pagamento_confirmado") {
//         alert("Pagamento confirmado!");
//     }
// };
// async function pagar() {
//   await fetch("http://127.0.0.1:8000/pagamento/pagar?pagamento_id=1", {
//     method: "POST"
//   });
//   alert("Pagamento realizado com sucesso");
// }
