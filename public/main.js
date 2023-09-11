// const url = 'https://jsonplaceholder.typicode.com/posts';
// const BASE_URL = 'http://127.0.0.1:63408';
const BASE_URL = 'http://localhost:3000';
// const API_URL = `${BASE_URL}/api/persons`;

const fetchBtn = document.querySelector('.fetch-names-btn');

async function fetchData(url, method, body) {
  console.log({ url });
  try {
    const data = await fetch(url, {
      method: method === 'POST' ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),

      // credentials: 'same-origin', // include(every orgin), *same-origin, omit
    }).then((resp) => {
      return resp.json();
    });
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

(async function () {
  await fetchData('http://localhost:5000/api/v1/auth/login', 'POST', {
    email: 'csrinu236@gmail.com',
    password: 'secret',
  });

  await fetchData('http://localhost:5000/api/v1/showMe', 'GET');
  await fetchData('http://localhost:5000/api/v1/users', 'GET');
})();

// function calc(symbol, ...values) {
//   console.log(symbol, values);
// }
// const addFunc = calc.bind(this, '+');
// console.log(addFunc);
// addFunc(2, 3);

function getCookie(cookieName) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

const myCookieValue = getCookie('token');
console.log(myCookieValue);
