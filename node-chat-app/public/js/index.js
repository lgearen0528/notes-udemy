let socket = io();

function scrollToBottom(){
  //selectors
  let messages = jQuery('#messages');
  let newMessage = messages.children('li:last-child');
  //Heights
  let clientHeight = messages.prop('clientHeight');
  let scrollHeight = messages.prop('scrollHeight');
  let scrollTop = messages.prop('scrollTop');
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
  console.log('Connected to server.');


  // socket.emit('createEmail', {
  //   to:'liem@example.com',
  //   text:'hey this is missy'
  // });
  // socket.emit('createMessage', {
  //   from: 'missy',
  //   text: 'Hi there!'
  // });
});

socket.on('disconnect', function (){
  console.log('Disconnected from server.')
});

// socket.on('newEmail', function (email){
//   console.log('New email', email);
// });

socket.on('newMessage', function(message){
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = jQuery('#message-template').html();
  let html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();

  // let formattedTime = moment(message.createdAt).format('h:mm a');
  // let li = jQuery('<li></li>');
  // li.text(`${message.from} ${formattedTime}: ${message.text}`);
  //
  // jQuery('#messages').append(li);
});


jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();
  let messageTextbox = jQuery('[name=message]');
  socket.emit('createMessage', {
    from: 'User',
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('');
  });

});
socket.on('newLocationMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = jQuery('#location-message-template').html();
  let html = Mustache.render(template, {
    from: message.from,
    createdAt: formattedTime,
    url: message.url
  });
  jQuery('#messages').append(html);
  scrollToBottom();
  // let li = jQuery('<li></li>');
  // let a = jQuery('<a target="_blank">My current location</a>');
  // let formattedTime = moment(message.createdAt).format('h:mm a');
  // li.text(`${message.from} ${formattedTime}: `);
  // a.attr('href', message.url);
  // li.append(a);
  // jQuery('#messages').append(li);
});
let locationButton = jQuery('#send-location');
locationButton.on('click', function(){
  if (!navigator.geolocation){
    return alert('geolocation not supported by your browser.')
  }
  locationButton.attr('disabled', 'disabled').text('Sending location...');
  navigator.geolocation.getCurrentPosition(function(position){
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function() {
    alert('Unable to fetch location.');

  });
});
