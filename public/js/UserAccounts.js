// document.addEventListener('DOMContentLoaded', async function() {
//   try {
//       const username_response_promise = fetch('https://script.google.com/macros/s/AKfycbwmA97K4sdfq6dhzSsp14JU9KgQrFgSARNZbvSfiU7vuH8oEipt6TmcFo_o-jCI0kiQ/exec');

//       const [
//           username_response,
//       ] = await Promise.all([
//           username_response_promise,
//       ]);

//       const username_data_list  = await username_response.json();

//       const submitButton = document.getElementById("submit_button");
//       const form = document.forms.login;
//       form.addEventListener('submit', function(event) {
//         event.preventDefault();
//       });
  
//       submitButton.addEventListener("click", () => {
//         const username = document.getElementById("username").value;
//         const password = document.getElementById("password").value;
        
//         var number
//         let user = null;
//         for (let x = 1; x < username_data_list.content.length; x++) {
//           if (username === username_data_list.content[x][findTextInArray(username_data_list, "USERNAME")] && password === username_data_list.content[x][findTextInArray(username_data_list, "PASSWORD")]) {
//             user = username_data_list.content[x][findTextInArray(username_data_list, "ACCOUNT")];
//             number = x
//             break;
//           }
//         }
  
//         if (user) {
//           const queryParams = `?user=${number}`;
//           window.location.assign(`public/users/${user}.html${queryParams}`);
//           console.log("authenticated");
//           document.getElementById('error-message').innerText = '';
//         } else {
//           document.getElementById('error-message').innerText = 'Username and Password did not match';
//           document.getElementById('error-message').style.color = 'red';
//           console.log('Username and Password did not match');
//         }
//       });

//     } catch (error) {
//       console.error('Error fetching data:', error);
//   }
// });

// function findTextInArray(textArray, targetText) {
//   for (let q = 0; q < textArray.content[0].length; q++) {
//     if (textArray.content[0][q] == targetText) {
//       return q; // Found the target text, return its index
//     }
//   }
//   return -1; // Target text not found in the array
// }