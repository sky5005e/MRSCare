export function SmartReaderWSConnection(
  fn: (data: any) => void,
  url: string = 'ws://localhost:8765/api/ws/v1/smartcard/?token=12',
) {
  const socket = new WebSocket(url);

  //console.log('handleWSConnection called');
  // Create WebSocket connection

  // Connection opened
  socket.onopen = () => {
    console.log('Connected to WebSocket server');

    // Send a message
    socket.send(
      JSON.stringify({
        type: 'hello',
        message: 'Hello Server',
      }),
    );
  };

  // Listen for messages
  socket.onmessage = (event) => {
    const eventdata = JSON.parse(event.data);
    window.localStorage.removeItem('patientIdentifierSet');

    if (eventdata.type === 'card_removed' || eventdata.type === 'card_inserted') {
      let data = eventdata.payload;
      if (eventdata.type === 'card_inserted') {
        if (data.card_type === 'Patient Card') {
          window.localStorage.setItem('patient-Identifier-CardId', JSON.stringify(eventdata.payload));
        } else {
          window.localStorage.setItem('user-Identifier-CardId', JSON.stringify(eventdata.payload));
        }
      } else {
        if (data.card_type === 'Patient Card') {
          window.localStorage.removeItem('patient-Identifier-CardId');
        } else {
          window.localStorage.removeItem('user-Identifier-CardId');
        }
      }
      fn(eventdata);
      /*
        showSnackbar({
          isLowContrast: true,
          kind: 'warning',
          title: 'Card Reader Event',
          subtitle: data.payload?.reader
            ? `Card Reader: ${data.type} - ${data.payload.reader}`
            : 'No reader information available',
        });
        */
    } else {
      console.log(`Card Reader: ${eventdata.type} - ${eventdata.payload.reader}`);
    }
  };

  // Handle errors
  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  // Handle connection close
  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
  };

  // Cleanup on component unmount
  return () => {
    socket.close();
  };
}
