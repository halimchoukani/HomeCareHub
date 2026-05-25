fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test4', email: 'test4@example.com' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
