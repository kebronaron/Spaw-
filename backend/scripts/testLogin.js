(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'example@gmail.com', password: 'MyTempPass123!' })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('HEADERS:', Object.fromEntries(res.headers));
    console.log('BODY:', text);
  } catch (err) {
    console.error('ERROR:', err);
    process.exitCode = 1;
  }
})();
